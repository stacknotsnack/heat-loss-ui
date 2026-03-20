/**
 * CADViewer – Three.js 3D room visualiser
 * - Realistic window / door / radiator / furniture rendering
 * - Wall-aware placement (radiator back flush against wall)
 * - Drag-to-move for all furniture objects
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  wall:       0x2e3f6e,  wallEdge:  0x4a5a9a,
  floor:      0x1c2035,  ceiling:   0x1e2340,
  grid:       0x1e2340,  gridCtr:   0x2e3f6e,
  winFrame:   0xeceff1,  winGlass:  0x90caf9,
  doorFrame:  0xe0e0e0,  doorLeaf:  0x8d6e63,
  doorPanel:  0x6d4c41,  doorHdl:   0xffd54f,
  radBody:    0xf5f5f5,  radFin:    0xe0e0e0,
  radPipe:    0xbdbdbd,  radValve:  0x9e9e9e,
  sofaBase:   0x455a64,  sofaCush:  0x546e7a,
  sofaFeet:   0x37474f,
  bedFrame:   0x6d4c41,  bedMatt:   0xeceff1,
  bedPillow:  0xfff9c4,  bedDuvet:  0xbbdefb,
  woodLight:  0xbc8a5f,  woodDark:  0x795548,
  wardRobe:   0x6d4c41,  wardHdl:   0xffd54f,
  tvCab:      0x263238,  tvScreen:  0x050810,
  tvBezel:    0x1a1a1a,
  bathOut:    0xfafafa,  bathIn:    0x4dd0e1,
  bathTap:    0xbdbdbd,
  dragHover:  0x7b8ef8,  // tint colour for hover/drag highlight
};

// ── Material ──────────────────────────────────────────────────────────────────
const mkMat = (color, opts = {}) => new THREE.MeshPhongMaterial({
  color,
  shininess:   opts.shininess  ?? 30,
  transparent: (opts.opacity !== undefined && opts.opacity < 1),
  opacity:     opts.opacity    ?? 1,
  side:        opts.side       ?? THREE.FrontSide,
  depthWrite:  opts.depthWrite ?? true,
});

// ── Box helper ────────────────────────────────────────────────────────────────
function bx(group, w, h, d, color, x, y, z, opts = {}) {
  const geo  = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mkMat(color, opts));
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  if (!opts.noEdge && (opts.opacity ?? 1) > 0.5) {
    const el = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 })
    );
    el.position.set(x, y, z);
    group.add(el);
  }
  return mesh;
}

function markGroup(g) {
  g.userData.cad = true;
  g.traverse(c => { c.userData.cad = true; });
  return g;
}

// ── Wall placement ─────────────────────────────────────────────────────────────
// embed=true  → centre in wall (windows, doors)
// embed=false → back flush with inner wall face (radiators, TV units)
function placeOnWall(group, wall, xPos, objWidth, W, L, T, yFloor = 0, embed = true) {
  const xp = parseFloat(xPos) || 0;
  const hw = W / 2, hl = L / 2;
  const shift = embed ? 0 : T / 2; // extra push outward from centre
  switch (wall) {
    case 'South':
      group.position.set(-hw + xp + objWidth / 2, yFloor, hl - T / 2 - shift);
      group.rotation.y = Math.PI; break;
    case 'East':
      group.position.set(hw - T / 2 - shift, yFloor, -hl + xp + objWidth / 2);
      group.rotation.y = -Math.PI / 2; break;
    case 'West':
      group.position.set(-hw + T / 2 + shift, yFloor, -hl + xp + objWidth / 2);
      group.rotation.y = Math.PI / 2; break;
    default: // North
      group.position.set(-hw + xp + objWidth / 2, yFloor, -hl + T / 2 + shift);
      group.rotation.y = 0;
  }
}

function wallLabelPos(wall, xPos, objWidth, objHeight, W, L) {
  const xp = parseFloat(xPos) || 0;
  const hw = W / 2, hl = L / 2;
  switch (wall) {
    case 'South': return { x: -hw + xp + objWidth/2, y: objHeight + 0.2, z:  hl + 0.25 };
    case 'East':  return { x:  hw + 0.25, y: objHeight + 0.2, z: -hl + xp + objWidth/2 };
    case 'West':  return { x: -hw - 0.25, y: objHeight + 0.2, z: -hl + xp + objWidth/2 };
    default:      return { x: -hw + xp + objWidth/2, y: objHeight + 0.2, z: -hl - 0.25 };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Object Builders — local space, all facing +Z
// ══════════════════════════════════════════════════════════════════════════════

function buildWindow(w, h, T) {
  const g = new THREE.Group();
  const FT = 0.055, TD = T + 0.02;
  bx(g, w,  FT, TD, C.winFrame,  0,       h-FT/2,   0);
  bx(g, w,  FT, TD, C.winFrame,  0,       FT/2,      0);
  bx(g, FT, h,  TD, C.winFrame, -w/2+FT/2, h/2,     0);
  bx(g, FT, h,  TD, C.winFrame,  w/2-FT/2, h/2,     0);
  bx(g, FT, h-FT*2, TD, C.winFrame, 0, h/2, 0);
  bx(g, w-FT*2, FT, TD, C.winFrame, 0, h*0.55, 0);
  const glassOpts = { opacity: 0.38, side: THREE.DoubleSide, noEdge: true, shininess: 120, depthWrite: false };
  const pW  = (w - FT*3) / 2;
  const pHu = h*0.55 - FT*1.5, pHl = h*0.45 - FT*1.5;
  const gu = h*0.55 + FT/2 + pHu/2 - FT;
  bx(g, pW, pHu, 0.008, C.winGlass, -pW/2-FT/2, gu, 0, glassOpts);
  bx(g, pW, pHu, 0.008, C.winGlass,  pW/2+FT/2, gu, 0, glassOpts);
  bx(g, pW, pHl, 0.008, C.winGlass, -pW/2-FT/2, FT+pHl/2, 0, glassOpts);
  bx(g, pW, pHl, 0.008, C.winGlass,  pW/2+FT/2, FT+pHl/2, 0, glassOpts);
  return g;
}

function buildDoor(w, h, T) {
  const g = new THREE.Group();
  const FW = 0.07, TD = T + 0.02;
  bx(g, w,  FW, TD, C.doorFrame, 0, h-FW/2, 0);
  bx(g, FW, h,  TD, C.doorFrame, -w/2+FW/2, h/2, 0);
  bx(g, FW, h,  TD, C.doorFrame,  w/2-FW/2, h/2, 0);
  const lW = w-FW*2, lH = h-FW;
  bx(g, lW, lH, T*0.55, C.doorLeaf, 0, FW/2+lH/2, T*0.25);
  bx(g, lW*0.72, lH*0.44, 0.025, C.doorPanel, 0, FW+lH*0.3+lH*0.44/2, T*0.55);
  bx(g, lW*0.72, lH*0.28, 0.025, C.doorPanel, 0, FW+lH*0.02+lH*0.28/2, T*0.55);
  const sGeo = new THREE.SphereGeometry(0.04, 10, 10);
  const hdl  = new THREE.Mesh(sGeo, new THREE.MeshPhongMaterial({ color: C.doorHdl, shininess: 140 }));
  hdl.position.set(lW*0.36, lH*0.44+FW, T*0.58);
  g.add(hdl);
  return g;
}

// Radiator built back-at-z=0, extends into room (+z)
function buildRadiator(rW, rH) {
  const g = new THREE.Group();
  const pipeH = 0.055, pipeD = 0.05;
  const finW  = 0.022, finD  = 0.1;
  const n     = Math.max(3, Math.round(rW / 0.11));
  const gap   = rW / (n + 1);

  // Back plate flush against wall (z = 0 = wall inner face)
  bx(g, rW, rH, 0.018, C.radBody, 0, rH/2, 0, { noEdge: true });
  // Top & bottom pipes (extend out from wall)
  bx(g, rW+0.04, pipeH, pipeD, C.radPipe, 0, rH-pipeH/2, pipeD/2);
  bx(g, rW+0.04, pipeH, pipeD, C.radPipe, 0, pipeH/2,    pipeD/2);
  // Fins
  for (let i = 1; i <= n; i++) {
    bx(g, finW, rH-pipeH*2, finD, C.radFin,
      -rW/2 + gap*i, rH/2, finD/2, { noEdge: true });
  }
  // Valve
  bx(g, 0.09, 0.05, 0.05, C.radValve, -rW/2-0.04, pipeH/2, pipeD/2, { noEdge: true });
  return g;
}

function buildSofa(w, d) {
  const g  = new THREE.Group();
  const sh = 0.44, sd = d*0.58, bh = 0.52, aw = 0.18;
  bx(g, w, 0.08, d, C.sofaFeet, 0, 0.04, 0);
  bx(g, w-aw*2, sh, sd, C.sofaCush, 0, sh/2+0.08, (d-sd)/2);
  bx(g, w-aw*2, bh, d*0.18, C.sofaBase, 0, sh+0.08+bh/2, -d/2+d*0.09+0.01);
  bx(g, aw, sh+bh*0.35, d, C.sofaBase, -w/2+aw/2, (sh+bh*0.35)/2+0.08, 0);
  bx(g, aw, sh+bh*0.35, d, C.sofaBase,  w/2-aw/2, (sh+bh*0.35)/2+0.08, 0);
  return g;
}

function buildBed(w, d) {
  const g = new THREE.Group();
  bx(g, w+0.08, 0.22, d+0.06, C.bedFrame, 0, 0.11, 0);
  bx(g, w, 0.28, d*0.82, C.bedMatt,  0, 0.22+0.14, d*0.06);
  bx(g, w-0.05, 0.10, d*0.65, C.bedDuvet, 0, 0.22+0.28+0.05, d*0.06+d*0.08);
  bx(g, w+0.06, 0.65, 0.10, C.bedFrame, 0, 0.22+0.325, -d/2+0.05);
  bx(g, w*0.38, 0.09, 0.28, C.bedPillow, -w*0.2, 0.22+0.28+0.045, -d/2+0.18+d*0.06);
  bx(g, w*0.38, 0.09, 0.28, C.bedPillow,  w*0.2, 0.22+0.28+0.045, -d/2+0.18+d*0.06);
  return g;
}

function buildTable(w, d) {
  const g = new THREE.Group();
  bx(g, w, 0.04, d, C.woodLight, 0, 0.74, 0);
  const lx = w/2-0.04, lz = d/2-0.04;
  [[lx,lz],[lx,-lz],[-lx,lz],[-lx,-lz]].forEach(([x,z]) =>
    bx(g, 0.06, 0.70, 0.06, C.woodDark, x, 0.35, z, { noEdge: true }));
  return g;
}

function buildChair(w, d) {
  const g = new THREE.Group();
  bx(g, w, 0.05, d, C.woodLight, 0, 0.44, 0);
  bx(g, w, 0.42, 0.06, C.woodLight, 0, 0.44+0.21, -d/2+0.03);
  const lx = w/2-0.04, lz = d/2-0.04;
  [[lx,lz],[lx,-lz],[-lx,lz],[-lx,-lz]].forEach(([x,z]) =>
    bx(g, 0.04, 0.44, 0.04, C.woodDark, x, 0.22, z, { noEdge: true }));
  return g;
}

function buildWardrobe(w, d) {
  const g = new THREE.Group();
  bx(g, w, 2.0, d, C.wardRobe, 0, 1.0, 0);
  bx(g, 0.015, 2.0, 0.01, 0x4e342e, 0, 1.0, d/2, { noEdge: true });
  bx(g, 0.025, 0.14, 0.04, C.wardHdl, -w*0.14, 1.0, d/2+0.005, { noEdge: true });
  bx(g, 0.025, 0.14, 0.04, C.wardHdl,  w*0.14, 1.0, d/2+0.005, { noEdge: true });
  return g;
}

// TV built back-at-z=0, facing into room (+z)
function buildTV(w, d) {
  const g   = new THREE.Group();
  const ch  = 0.48, tvW = w*0.88, tvH = tvW*0.56;
  bx(g, w,  ch,   d,    C.tvCab,   0, ch/2,         0);
  bx(g, 0.12, 0.12, 0.12, C.tvCab, 0, ch+0.06,      0, { noEdge: true });
  bx(g, tvW+0.05, tvH+0.05, 0.055, C.tvBezel, 0, ch+0.12+tvH/2, d*0.1);
  bx(g, tvW, tvH, 0.025, C.tvScreen, 0, ch+0.12+tvH/2, d*0.1+0.02, { noEdge: true });
  return g;
}

function buildBath(w, d) {
  const g = new THREE.Group();
  bx(g, w, 0.62, d, C.bathOut, 0, 0.31, 0);
  bx(g, w-0.14, 0.34, d-0.15, C.bathIn, 0, 0.62*0.76, 0,
    { opacity: 0.75, noEdge: true, depthWrite: false });
  bx(g, 0.06, 0.12, 0.06, C.bathTap,  w*0.32, 0.62+0.06, 0, { noEdge: true });
  bx(g, 0.06, 0.12, 0.06, C.bathTap,  w*0.44, 0.62+0.06, 0, { noEdge: true });
  return g;
}

// ══════════════════════════════════════════════════════════════════════════════
// View Presets
// ══════════════════════════════════════════════════════════════════════════════
const VIEW_PRESETS = {
  perspective: { phi: Math.PI/4,   theta: Math.PI/5.5, factor: 1.4 },
  top:         { phi: 0,           theta: 0.001,        factor: 1.7 },
  front:       { phi: 0,           theta: Math.PI/2,    factor: 1.3 },
  side:        { phi: Math.PI/2,   theta: Math.PI/2,    factor: 1.3 },
};

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
export default function CADViewer({ room, objects, viewMode, onObjectMove, onReady }) {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);  // active camera (switches between persp/ortho)
  const perspCamRef = useRef(null);
  const orthoCamRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const cssRendRef  = useRef(null);
  const frameRef    = useRef(null);
  const labelsRef   = useRef([]);
  // Keep latest room/callback in refs so drag handlers (set up once) see current values
  const roomRef          = useRef(room);
  const onObjectMoveRef  = useRef(onObjectMove);
  useEffect(() => { roomRef.current = room; },          [room]);
  useEffect(() => { onObjectMoveRef.current = onObjectMove; }, [onObjectMove]);

  // ── Build scene ─────────────────────────────────────────────────────────────
  const buildScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const toRemove = [];
    scene.traverse(o => { if (o.userData.cad) toRemove.push(o); });
    toRemove.forEach(o => {
      scene.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => m.dispose());
    });
    labelsRef.current.forEach(l => scene.remove(l));
    labelsRef.current = [];

    if (!room?.width || !room?.length || !room?.height) return;

    const W = room.width, L = room.length, H = room.height, T = 0.14;

    const addGroup = g => { markGroup(g); scene.add(g); return g; };

    // ── Floor & ceiling ────────────────────────────────────────────────────
    const flG = new THREE.Group();
    bx(flG, W, 0.022, L, C.floor, 0, 0.011, 0);
    addGroup(flG);

    const grid = markGroup(new THREE.GridHelper(Math.max(W,L)*1.6, 22, C.gridCtr, C.grid));
    grid.position.y = 0.023;
    scene.add(grid);

    const ceG = new THREE.Group();
    bx(ceG, W, 0.018, L, C.ceiling, 0, H-0.009, 0,
      { opacity: 0.2, side: THREE.DoubleSide, noEdge: true, depthWrite: false });
    addGroup(ceG);

    // ── Walls ──────────────────────────────────────────────────────────────
    const wallMat = () => new THREE.MeshPhongMaterial({ color: C.wall, side: THREE.DoubleSide });
    const addWall = (w, h, d, x, y, z) => {
      const geo  = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, wallMat());
      mesh.position.set(x, y, z);
      mesh.userData.cad = mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      const el = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: C.wallEdge, transparent: true, opacity: 0.35 })
      );
      el.position.copy(mesh.position);
      el.userData.cad = true;
      scene.add(el);
    };
    addWall(W, H, T,  0,      H/2, -L/2+T/2);
    addWall(W, H, T,  0,      H/2,  L/2-T/2);
    addWall(T, H, L,  W/2-T/2, H/2, 0);
    addWall(T, H, L, -W/2+T/2, H/2, 0);

    // ── Dimension labels ───────────────────────────────────────────────────
    const addLabel = (text, x, y, z) => {
      const div = document.createElement('div');
      div.className = 'cad-dim-label';
      div.textContent = text;
      const lbl = new CSS2DObject(div);
      lbl.position.set(x, y, z);
      lbl.userData.cad = true;
      scene.add(lbl);
      labelsRef.current.push(lbl);
    };

    addLabel(`${W.toFixed(1)} m`, 0, 0.18, L/2+0.35);
    addLabel(`${L.toFixed(1)} m`, W/2+0.35, 0.18, 0);
    addLabel(`${H.toFixed(1)} m`, W/2+0.35, H/2, -L/2);

    // ── Placed objects ─────────────────────────────────────────────────────
    (objects || []).forEach(obj => {
      const wall = obj.wall || 'North';
      const xPos = parseFloat(obj.xPos) || 0;

      if (obj.type === 'window') {
        const wW = parseFloat(obj.width)  || 1.2;
        const wH = parseFloat(obj.height) || 1.1;
        const grp = buildWindow(wW, wH, T);
        placeOnWall(grp, wall, xPos, wW, W, L, T, 0.9, true);
        addGroup(grp);
        const lp = wallLabelPos(wall, xPos, wW, wH+0.9, W, L);
        addLabel(`🪟 ${wW}×${wH}m`, lp.x, lp.y, lp.z);
      }

      if (obj.type === 'door') {
        const dW = parseFloat(obj.width)  || 0.9;
        const dH = parseFloat(obj.height) || 2.1;
        const grp = buildDoor(dW, dH, T);
        placeOnWall(grp, wall, xPos, dW, W, L, T, 0, true);
        addGroup(grp);
        const lp = wallLabelPos(wall, xPos, dW, dH, W, L);
        addLabel(`🚪 ${dW}×${dH}m`, lp.x, lp.y, lp.z);
      }

      if (obj.type === 'radiator') {
        const rW = (parseFloat(obj.length) || 1000) / 1000;
        const rH = (parseFloat(obj.height) || 600)  / 1000;
        const grp = buildRadiator(rW, rH);
        // embed=false → back flush with inner wall face, sticks into room
        placeOnWall(grp, wall, xPos, rW, W, L, T, 0.12, false);
        addGroup(grp);
        const lp = wallLabelPos(wall, xPos, rW, rH+0.12, W, L);
        addLabel(`🔥 ${obj.length||1000}mm`, lp.x, lp.y, lp.z);
      }

      if (obj.type === 'tv') {
        const tW = parseFloat(obj.width) || 1.4;
        const tD = parseFloat(obj.depth) || 0.4;
        const grp = buildTV(tW, tD);
        placeOnWall(grp, wall, xPos, tW, W, L, T, 0, false);
        addGroup(grp);
        const lp = wallLabelPos(wall, xPos, tW, 1.2, W, L);
        addLabel(`📺 TV Unit`, lp.x, lp.y, lp.z);
      }

      // ── Furniture (draggable) ─────────────────────────────────────────────
      const xRoom = parseFloat(obj.xPos) || 1.0;
      const zRoom = parseFloat(obj.zPos) || 1.0;
      const rotDeg = parseFloat(obj.rotY) || 0;

      const placeFurniture = (grp, w, d, labelText) => {
        grp.position.set(-W/2 + xRoom + w/2, 0, -L/2 + zRoom + d/2);
        grp.rotation.y = rotDeg * Math.PI / 180;
        // Tag for drag
        grp.userData.objId   = obj.id;
        grp.userData.draggable = true;
        grp.userData.halfW   = w / 2;
        grp.userData.halfD   = d / 2;
        grp.traverse(c => {
          c.userData.objId     = obj.id;
          c.userData.draggable = true;
        });
        addGroup(grp);
        addLabel(labelText, grp.position.x, 1.3, grp.position.z);
      };

      if (obj.type === 'sofa') {
        const w = parseFloat(obj.width)||2.0, d = parseFloat(obj.depth)||0.9;
        placeFurniture(buildSofa(w,d), w, d, `🛋 Sofa`);
      }
      if (obj.type === 'bed') {
        const w = parseFloat(obj.width)||1.4, d = parseFloat(obj.depth)||2.0;
        placeFurniture(buildBed(w,d), w, d, `🛏 Bed`);
      }
      if (obj.type === 'table') {
        const w = parseFloat(obj.width)||1.2, d = parseFloat(obj.depth)||0.8;
        placeFurniture(buildTable(w,d), w, d, `Table`);
      }
      if (obj.type === 'chair') {
        const w = 0.5, d = 0.5;
        placeFurniture(buildChair(w,d), w, d, `🪑 Chair`);
      }
      if (obj.type === 'wardrobe') {
        const w = parseFloat(obj.width)||1.2, d = parseFloat(obj.depth)||0.6;
        placeFurniture(buildWardrobe(w,d), w, d, `Wardrobe`);
      }
      if (obj.type === 'bath') {
        const w = parseFloat(obj.width)||1.7, d = parseFloat(obj.depth)||0.75;
        placeFurniture(buildBath(w,d), w, d, `🛁 Bath`);
      }
    });
  }, [room, objects]);

  // ── Apply view mode ─────────────────────────────────────────────────────────
  const applyView = useCallback((mode) => {
    const ctrl = controlsRef.current;
    const persp = perspCamRef.current;
    const ortho = orthoCamRef.current;
    if (!persp || !ortho || !ctrl || !room) return;

    const W = room.width  || 4;
    const L = room.length || 5;
    const H = room.height || 2.4;
    const maxDim = Math.max(W, L, H);
    const tgt = new THREE.Vector3(0, H / 2, 0);

    if (mode === '2d') {
      // Switch to orthographic, top-down, no rotation
      cameraRef.current = ortho;
      ctrl.object = ortho;

      // Fit the room width/length into the ortho frustum
      const el   = mountRef.current;
      const asp  = el ? el.clientWidth / el.clientHeight : 1;
      const half = Math.max(W, L) * 0.65;
      ortho.left   = -half * asp;
      ortho.right  =  half * asp;
      ortho.top    =  half;
      ortho.bottom = -half;
      ortho.updateProjectionMatrix();

      ortho.position.set(0, maxDim * 6, 0);
      ortho.lookAt(0, 0, 0);
      ctrl.target.set(0, 0, 0);
      ctrl.enableRotate = false;
      ctrl.update();
    } else {
      // Switch back to perspective
      cameraRef.current = persp;
      ctrl.object = persp;
      ctrl.enableRotate = true;

      const dist = maxDim * (VIEW_PRESETS[mode]?.factor ?? 1.4) * 1.9;
      const p    = VIEW_PRESETS[mode] || VIEW_PRESETS.perspective;
      const x = dist * Math.sin(p.phi) * Math.cos(p.theta);
      const y = dist * Math.sin(p.theta) || dist * 0.88;
      const z = dist * Math.cos(p.phi)  * Math.cos(p.theta);
      persp.position.set(x, y, z);
      persp.lookAt(tgt);
      ctrl.target.copy(tgt);
      ctrl.update();
    }
  }, [room]);

  // ── Three.js init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080a16);
    scene.fog = new THREE.FogExp2(0x080a16, 0.032);
    sceneRef.current = scene;

    // Perspective camera (default)
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth/el.clientHeight, 0.05, 300);
    camera.position.set(9, 7, 9);
    perspCamRef.current = camera;
    cameraRef.current   = camera;

    // Orthographic camera (used in 2D Plan mode)
    const asp  = el.clientWidth / el.clientHeight;
    const half = 6;
    const ortho = new THREE.OrthographicCamera(-half*asp, half*asp, half, -half, 0.05, 500);
    ortho.position.set(0, 60, 0);
    ortho.lookAt(0, 0, 0);
    orthoCamRef.current = ortho;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D
    const css = new CSS2DRenderer();
    css.setSize(el.clientWidth, el.clientHeight);
    Object.assign(css.domElement.style,
      { position:'absolute', top:'0', left:'0', pointerEvents:'none' });
    el.appendChild(css.domElement);
    cssRendRef.current = css;

    // Lights
    scene.add(new THREE.AmbientLight(0x8090c0, 0.55));
    const sun = new THREE.DirectionalLight(0xfff8e7, 1.0);
    sun.position.set(6, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x4060a0, 0.35);
    fill.position.set(-8, 4, -6);
    scene.add(fill);
    scene.add(new THREE.HemisphereLight(0x8090c0, 0x302810, 0.2));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // ── Drag-to-move ─────────────────────────────────────────────────────────
    const raycaster    = new THREE.Raycaster();
    const mouse        = new THREE.Vector2();
    const floorPlane   = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dragIntersect = new THREE.Vector3();
    let dragGroup = null;

    const getNDC = (clientX, clientY) => {
      const r = el.getBoundingClientRect();
      mouse.set(
        ((clientX - r.left) / r.width)  * 2 - 1,
       -((clientY - r.top)  / r.height) * 2 + 1
      );
      return mouse;
    };

    const findDraggable = () => {
      raycaster.setFromCamera(mouse, cameraRef.current);
      const meshes = [];
      scene.traverse(o => { if (o.isMesh && o.userData.draggable) meshes.push(o); });
      const hits = raycaster.intersectObjects(meshes, false);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && !o.userData.objId) o = o.parent;
      return o || null;
    };

    const onPointerDown = (e) => {
      getNDC(e.clientX, e.clientY);
      const found = findDraggable();
      if (found) {
        dragGroup = found;
        controls.enabled = false;
        el.style.cursor = 'grabbing';
        el.setPointerCapture(e.pointerId);
        e.stopPropagation();
      }
    };

    const onPointerMove = (e) => {
      getNDC(e.clientX, e.clientY);
      if (!dragGroup) {
        // Hover cursor
        const found = findDraggable();
        el.style.cursor = found ? 'grab' : '';
        return;
      }
      raycaster.setFromCamera(mouse, cameraRef.current);
      if (raycaster.ray.intersectPlane(floorPlane, dragIntersect)) {
        const rm = roomRef.current || {};
        const hw = dragGroup.userData.halfW || 0.5;
        const hd = dragGroup.userData.halfD || 0.5;
        const W  = rm.width  || 4;
        const L  = rm.length || 5;
        dragGroup.position.x = Math.max(-W/2+hw, Math.min(W/2-hw, dragIntersect.x));
        dragGroup.position.z = Math.max(-L/2+hd, Math.min(L/2-hd, dragIntersect.z));
      }
    };

    const onPointerUp = (e) => {
      if (!dragGroup) return;
      const rm = roomRef.current || {};
      const hw = dragGroup.userData.halfW || 0.5;
      const hd = dragGroup.userData.halfD || 0.5;
      const newXPos = +(dragGroup.position.x + (rm.width||4)/2  - hw).toFixed(2);
      const newZPos = +(dragGroup.position.z + (rm.length||5)/2 - hd).toFixed(2);
      onObjectMoveRef.current?.(dragGroup.userData.objId, Math.max(0, newXPos), Math.max(0, newZPos));
      el.releasePointerCapture(e.pointerId);
      dragGroup = null;
      controls.enabled = true;
      el.style.cursor = '';
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup',   onPointerUp);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      const cam = cameraRef.current;
      renderer.render(scene, cam);
      css.render(scene, cam);
    };
    animate();

    // Resize
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      // Update perspective camera
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Update ortho camera frustum to match new aspect
      const oc = orthoCamRef.current;
      if (oc) {
        const asp2 = w / h;
        const halfY = oc.top;
        oc.left   = -halfY * asp2;
        oc.right  =  halfY * asp2;
        oc.updateProjectionMatrix();
      }
      renderer.setSize(w, h);
      css.setSize(w, h);
    });
    ro.observe(el);

    if (onReady) onReady({ scene, camera, ortho, controls, renderer });

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup',   onPointerUp);
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      if (el.contains(css.domElement))      el.removeChild(css.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { buildScene(); },         [buildScene]);
  useEffect(() => { applyView(viewMode); },  [viewMode, applyView]);

  return <div ref={mountRef} className="cad-canvas" style={{ position: 'relative' }} />;
}
