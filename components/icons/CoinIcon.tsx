

import React from 'react';

export const CoinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FBBF24' }} />
        <stop offset="100%" style={{ stopColor: '#D97706' }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#FDE68A" strokeWidth="1.5" />
    <text
      x="12"
      y="16"
      fontFamily="Arial, sans-serif"
      fontSize="12"
      fill="white"
      textAnchor="middle"
      fontWeight="bold"
    >₹</text>
  </svg>
);