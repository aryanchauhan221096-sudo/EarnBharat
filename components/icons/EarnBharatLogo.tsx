
import React from 'react';

export const EarnBharatLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" stroke="#fff" strokeWidth="3" />
    <path
      d="M35 25 H 65 M 35 50 H 55 M 35 75 H 65"
      stroke="#1F2937"
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M25 40 H 45"
      stroke="#1F2937"
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
    />
    <text
      x="50"
      y="62"
      fontFamily="Arial, sans-serif"
      fontSize="50"
      fill="#fff"
      textAnchor="middle"
      fontWeight="bold"
    >₹</text>
  </svg>
);
