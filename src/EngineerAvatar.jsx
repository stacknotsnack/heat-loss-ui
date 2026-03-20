/**
 * EngineerAvatar – radiator SVG icon, consistent with app tab icons
 * Supports multiple sizes: sm (32px), md (40px), lg (48px), xl (60px)
 */

import React from 'react';

const SIZES = {
  sm:  32,
  md:  40,
  lg:  48,
  xl:  60
};

// Simple radiator SVG – horizontal pipes top & bottom, vertical fins between
function RadiatorIcon({ px }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Radiator"
    >
      {/* Top pipe */}
      <rect x="3" y="5" width="34" height="5" rx="2.5" fill="#e67e22" />
      {/* Bottom pipe */}
      <rect x="3" y="30" width="34" height="5" rx="2.5" fill="#e67e22" />
      {/* Fins */}
      <rect x="5"  y="10" width="4" height="20" rx="1.5" fill="#f39c12" />
      <rect x="11" y="10" width="4" height="20" rx="1.5" fill="#f39c12" />
      <rect x="17" y="10" width="4" height="20" rx="1.5" fill="#f39c12" />
      <rect x="23" y="10" width="4" height="20" rx="1.5" fill="#f39c12" />
      <rect x="29" y="10" width="4" height="20" rx="1.5" fill="#f39c12" />
      {/* Valve nub bottom-left */}
      <rect x="1" y="33" width="4" height="3" rx="1" fill="#d35400" />
    </svg>
  );
}

export default function EngineerAvatar({ size = 'md', style = {}, className = '' }) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;

  return (
    <span
      className={`engineer-avatar ${className}`}
      style={{
        width: px,
        height: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'rgba(230,126,34,0.15)',
        flexShrink: 0,
        ...style
      }}
    >
      <RadiatorIcon px={px * 0.75} />
    </span>
  );
}
