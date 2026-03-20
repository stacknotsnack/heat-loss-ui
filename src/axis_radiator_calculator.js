/**
 * Pottsy's Radiator Calculator
 * Uses BS EN 442 power law formula with exponent n = 1.3
 *
 * Corrected Output = Base ΔT50 × ((MWT − Room Temp) / 50) ^ 1.3
 *
 * Water temps (Flow 55°C / Return 35°C → Mean 45°C):
 *   Room 18°C → ΔT 27 → CF 0.449
 *   Room 21°C → ΔT 24 → CF 0.385
 *   Room 23°C → ΔT 22 → CF 0.344
 */

// ─── Constants ────────────────────────────────────────────────────────────────
export const EXPONENT_N = 1.3;
export const PART_L_MAX_OVERSIZING = 15; // %

// ─── Water Temperature Parts ──────────────────────────────────────────────────
export const WATER_TEMP_PARTS = {
  L: { label: 'Part L – Low Temperature',  flow: 55, return: 35, description: 'Heat pump / modern low-temp boiler' },
  M: { label: 'Part M – Medium',           flow: 60, return: 40, description: 'Standard condensing boiler' },
  X: { label: 'Part X – Extended',         flow: 65, return: 45, description: 'Higher output condensing boiler' },
  H: { label: 'Part H – High Temperature', flow: 70, return: 50, description: 'Older conventional boiler system' }
};

// ─── Model Definitions ────────────────────────────────────────────────────────
export const MODELS = {
  K1: { label: 'K1',       description: 'Single panel, single convector',  type: 11 },
  PP: { label: 'P+',       description: 'Double panel, single convector',  type: 21 },
  K2: { label: 'K2',       description: 'Double panel, double convector',  type: 22 }
};

// ─── Radiator Database ────────────────────────────────────────────────────────
// Each entry: { model, height, length, sections, wattsAt50 }
// All base outputs are at ΔT50 (EN 442 standard test condition)

const R = (model, height, length, sections, wattsAt50) => ({
  id: `${model}_${height}x${length}`,
  model,
  height,
  length,
  sections,
  wattsAt50,
  btuAt50: Math.round(wattsAt50 * 3.412),
  label: `${MODELS[model].label} ${height}×${length}mm`,
  description: MODELS[model].description,
  type: MODELS[model].type
});

export const RADIATOR_DATABASE = [

  // ── Height 300mm ─────────────────────────────────────────────────────────────
  R('K1', 300,  500, 15,  255), R('PP', 300,  500, 15,  373), R('K2', 300,  500, 15,  491),
  R('K1', 300, 1000, 30,  509), R('PP', 300, 1000, 30,  745), R('K2', 300, 1000, 30,  982),
  R('K1', 300, 1500, 45,  764), R('PP', 300, 1500, 45, 1118), R('K2', 300, 1500, 45, 1473),
  R('K1', 300, 2000, 60, 1018), R('PP', 300, 2000, 60, 1490), R('K2', 300, 2000, 60, 1964),
  R('K1', 300, 2500, 75, 1273), R('PP', 300, 2500, 75, 1863), R('K2', 300, 2500, 75, 2455),
  R('K1', 300, 3000, 90, 1527), R('PP', 300, 3000, 90, 2235), R('K2', 300, 3000, 90, 2946),

  // ── Height 450mm ─────────────────────────────────────────────────────────────
  R('K1', 450,  400, 12,  302), R('PP', 450,  400, 12,  422), R('K2', 450,  400, 12,  548),
  R('K1', 450,  500, 15,  378), R('PP', 450,  500, 15,  528), R('K2', 450,  500, 15,  686),
  R('K1', 450,  600, 18,  454), R('PP', 450,  600, 18,  633), R('K2', 450,  600, 18,  823),
  R('K1', 450,  700, 21,  529), R('PP', 450,  700, 21,  739), R('K2', 450,  700, 21,  960),
  R('K1', 450,  800, 24,  605), R('PP', 450,  800, 24,  844), R('K2', 450,  800, 24, 1097),
  R('K1', 450,  900, 27,  680), R('PP', 450,  900, 27,  950), R('K2', 450,  900, 27, 1234),
  R('K1', 450, 1000, 30,  756), R('PP', 450, 1000, 30, 1055), R('K2', 450, 1000, 30, 1371),
  R('K1', 450, 1100, 33,  832), R('PP', 450, 1100, 33, 1161), R('K2', 450, 1100, 33, 1508),
  R('K1', 450, 1200, 36,  907), R('PP', 450, 1200, 36, 1266), R('K2', 450, 1200, 36, 1645),
  R('K1', 450, 1400, 42, 1058), R('PP', 450, 1400, 42, 1477), R('K2', 450, 1400, 42, 1919),
  R('K1', 450, 1600, 48, 1210), R('PP', 450, 1600, 48, 1688), R('K2', 450, 1600, 48, 2194),
  R('K1', 450, 1800, 54, 1361), R('PP', 450, 1800, 54, 1899), R('K2', 450, 1800, 54, 2468),
  R('K1', 450, 2000, 60, 1512), R('PP', 450, 2000, 60, 2110), R('K2', 450, 2000, 60, 2742),
  R('K1', 450, 2200, 66, 1663), R('PP', 450, 2200, 66, 2321), R('K2', 450, 2200, 66, 3016),
  R('K1', 450, 2400, 72, 1814), R('PP', 450, 2400, 72, 2532), R('K2', 450, 2400, 72, 3290),
  R('K1', 450, 2600, 78, 1966), R('PP', 450, 2600, 78, 2743), R('K2', 450, 2600, 78, 3565),
  R('K1', 450, 2800, 84, 2117), R('PP', 450, 2800, 84, 2954), R('K2', 450, 2800, 84, 3839),
  R('K1', 450, 3000, 90, 2268), R('PP', 450, 3000, 90, 3165), R('K2', 450, 3000, 90, 4113),

  // ── Height 600mm ─────────────────────────────────────────────────────────────
  R('K1', 600,  300,  9,  294),                                R('K2', 600,  300,  9,  520),
  R('K1', 600,  400, 12,  392), R('PP', 600,  400, 12,  538), R('K2', 600,  400, 12,  693),
  R('K1', 600,  500, 15,  490), R('PP', 600,  500, 15,  673), R('K2', 600,  500, 15,  866),
  R('K1', 600,  600, 18,  588), R('PP', 600,  600, 18,  807), R('K2', 600,  600, 18, 1039),
  R('K1', 600,  700, 21,  686), R('PP', 600,  700, 21,  942), R('K2', 600,  700, 21, 1212),
  R('K1', 600,  800, 24,  784), R('PP', 600,  800, 24, 1076), R('K2', 600,  800, 24, 1386),
  R('K1', 600,  900, 27,  882), R('PP', 600,  900, 27, 1211), R('K2', 600,  900, 27, 1559),
  R('K1', 600, 1000, 30,  980), R('PP', 600, 1000, 30, 1345), R('K2', 600, 1000, 30, 1732),
  R('K1', 600, 1100, 33, 1078), R('PP', 600, 1100, 33, 1480), R('K2', 600, 1100, 33, 1905),
  R('K1', 600, 1200, 36, 1176), R('PP', 600, 1200, 36, 1614), R('K2', 600, 1200, 36, 2078),
  R('K1', 600, 1400, 42, 1372), R('PP', 600, 1400, 42, 1883), R('K2', 600, 1400, 42, 2425),
  R('K1', 600, 1600, 48, 1568), R('PP', 600, 1600, 48, 2152), R('K2', 600, 1600, 48, 2771),
  R('K1', 600, 1800, 54, 1764), R('PP', 600, 1800, 54, 2421), R('K2', 600, 1800, 54, 3118),
  R('K1', 600, 2000, 60, 1960), R('PP', 600, 2000, 60, 2690), R('K2', 600, 2000, 60, 3464),
  R('K1', 600, 2200, 66, 2156), R('PP', 600, 2200, 66, 2959), R('K2', 600, 2200, 66, 3810),
  R('K1', 600, 2400, 72, 2352), R('PP', 600, 2400, 72, 3228), R('K2', 600, 2400, 72, 4157),
  R('K1', 600, 2600, 78, 2548), R('PP', 600, 2600, 78, 3497), R('K2', 600, 2600, 78, 4503),
  R('K1', 600, 2800, 84, 2744), R('PP', 600, 2800, 84, 3766), R('K2', 600, 2800, 84, 4850),
  R('K1', 600, 3000, 90, 2940), R('PP', 600, 3000, 90, 4035), R('K2', 600, 3000, 90, 5196),

  // ── Height 700mm ─────────────────────────────────────────────────────────────
  R('K1', 700,  300,  9,  335),                                R('K2', 700,  300,  9,  588),
  R('K1', 700,  400, 12,  447), R('PP', 700,  400, 12,  612), R('K2', 700,  400, 12,  784),
  R('K1', 700,  500, 15,  559), R('PP', 700,  500, 15,  765), R('K2', 700,  500, 15,  981),
  R('K1', 700,  600, 18,  670), R('PP', 700,  600, 18,  918), R('K2', 700,  600, 18, 1177),
  R('K1', 700,  700, 21,  782), R('PP', 700,  700, 21, 1071), R('K2', 700,  700, 21, 1373),
  R('K1', 700,  800, 24,  894), R('PP', 700,  800, 24, 1224), R('K2', 700,  800, 24, 1569),
  R('K1', 700,  900, 27, 1005), R('PP', 700,  900, 27, 1377), R('K2', 700,  900, 27, 1765),
  R('K1', 700, 1000, 30, 1117), R('PP', 700, 1000, 30, 1530), R('K2', 700, 1000, 30, 1961),
  R('K1', 700, 1100, 33, 1229), R('PP', 700, 1100, 33, 1683), R('K2', 700, 1100, 33, 2157),
  R('K1', 700, 1200, 36, 1340), R('PP', 700, 1200, 36, 1836), R('K2', 700, 1200, 36, 2353),
  R('K1', 700, 1400, 42, 1564), R('PP', 700, 1400, 42, 2142), R('K2', 700, 1400, 42, 2745),
  R('K1', 700, 1600, 48, 1787), R('PP', 700, 1600, 48, 2448), R('K2', 700, 1600, 48, 3138),
  R('K1', 700, 1800, 54, 2011), R('PP', 700, 1800, 54, 2754), R('K2', 700, 1800, 54, 3530),
  R('K1', 700, 2000, 60, 2234), R('PP', 700, 2000, 60, 3060), R('K2', 700, 2000, 60, 3922),
  R('K1', 700, 2200, 66, 2457), R('PP', 700, 2200, 66, 3366), R('K2', 700, 2200, 66, 4314),
  R('K1', 700, 2400, 72, 2681), R('PP', 700, 2400, 72, 3672), R('K2', 700, 2400, 72, 4706),
  R('K1', 700, 2600, 78, 2904), R('PP', 700, 2600, 78, 3978), R('K2', 700, 2600, 78, 5099),
  R('K1', 700, 2800, 84, 3128), R('PP', 700, 2800, 84, 4284), R('K2', 700, 2800, 84, 5491),
  R('K1', 700, 3000, 90, 3351), R('PP', 700, 3000, 90, 4590), R('K2', 700, 3000, 90, 5883),
];

// ─── Core Calculation ─────────────────────────────────────────────────────────

/**
 * BS EN 442 power law correction.
 * CF = ((MWT − roomTemp) / 50) ^ 1.3
 */
export function correctionFactor(mwt, roomTemp) {
  const dt = mwt - roomTemp;
  if (dt <= 0) return 0;
  return Math.pow(dt / 50, EXPONENT_N);
}

/**
 * Corrected output for a radiator at actual conditions.
 * Rounded to whole watts as per catalog convention.
 */
export function correctedOutput(wattsAt50, cf) {
  return Math.round(wattsAt50 * cf);
}

// ─── Main Selection Function ──────────────────────────────────────────────────

/**
 * Find the best radiator match for a room.
 *
 * @param {number} heatLossW   Room heat loss in Watts
 * @param {number} roomTempC   Design room temperature °C
 * @param {string} waterPart   'L' | 'M' | 'X' | 'H'
 * @returns {object}           Full result with recommendation and alternatives
 */
export function calculateRadiatorSelection(heatLossW, roomTempC, waterPart) {
  if (!heatLossW || heatLossW <= 0)           throw new Error('Heat loss must be greater than 0W');
  if (roomTempC == null || roomTempC < 0 || roomTempC > 35) throw new Error('Room temperature must be 0–35°C');
  const part = WATER_TEMP_PARTS[waterPart];
  if (!part) throw new Error(`Invalid water part: ${waterPart}`);

  // ── Temperature calcs ───────────────────────────────────────────────────────
  const flowTemp   = part.flow;
  const returnTemp = part.return;
  const mwt        = (flowTemp + returnTemp) / 2;
  const actualDT   = parseFloat((mwt - roomTempC).toFixed(2));
  const cf         = parseFloat(correctionFactor(mwt, roomTempC).toFixed(4));

  // ── Score every radiator ────────────────────────────────────────────────────
  const scored = RADIATOR_DATABASE.map(rad => {
    const revised       = correctedOutput(rad.wattsAt50, cf);
    const revisedBTU    = Math.round(revised * 3.412);
    const deficit       = revised - heatLossW;
    const oversizingPct = parseFloat(((deficit / heatLossW) * 100).toFixed(1));
    const meetsLoad     = revised >= heatLossW;
    const withinPartL   = oversizingPct <= PART_L_MAX_OVERSIZING;

    let compliance;
    if (!meetsLoad)       compliance = 'FAIL';
    else if (withinPartL) compliance = 'PASS';
    else                  compliance = 'CHECK';

    return { ...rad, revisedOutput: revised, revisedBTU, deficit: parseFloat(deficit.toFixed(1)), oversizingPct, meetsLoad, compliance };
  });

  // ── Best recommendation: smallest PASS, fallback to smallest CHECK ──────────
  const passing    = scored.filter(r => r.compliance === 'PASS').sort((a, b) => a.revisedOutput - b.revisedOutput);
  const checking   = scored.filter(r => r.compliance === 'CHECK').sort((a, b) => a.revisedOutput - b.revisedOutput);
  const candidates = [...passing, ...checking];
  const recommended = candidates[0] || null;

  // ── Alternatives: next 3 candidates ────────────────────────────────────────
  const alternatives = candidates.slice(1, 4);

  // ── Calculation steps for display ──────────────────────────────────────────
  const steps = [
    { label: 'Mean Water Temperature (MWT)',  formula: `(${flowTemp} + ${returnTemp}) ÷ 2`,                        result: `${mwt}°C` },
    { label: 'Actual ΔT',                     formula: `${mwt} − ${roomTempC}`,                                   result: `${actualDT} K` },
    { label: 'Correction Factor (CF)',         formula: `(${actualDT} ÷ 50) ^ ${EXPONENT_N}`,                      result: cf.toFixed(3) },
    recommended && {
      label: 'Corrected Output',
      formula: `${recommended.wattsAt50}W × ${cf.toFixed(3)}`,
      result:  `${recommended.revisedOutput}W`
    },
    recommended && {
      label: 'Oversizing',
      formula: `((${recommended.revisedOutput} − ${heatLossW}) ÷ ${heatLossW}) × 100`,
      result:  `${recommended.oversizingPct}%`
    }
  ].filter(Boolean);

  return {
    inputs:      { heatLossW, heatLossBTU: Math.round(heatLossW * 3.412), roomTempC, waterPart },
    waterTemps:  { part: waterPart, label: part.label, flowTemp, returnTemp, mwt, description: part.description },
    calculation: { actualDT, correctionFactor: cf, exponentN: EXPONENT_N, partLMaxOversizing: PART_L_MAX_OVERSIZING },
    steps,
    recommended,
    alternatives,
    allPassing:  passing.length,
    timestamp:   new Date().toISOString()
  };
}
