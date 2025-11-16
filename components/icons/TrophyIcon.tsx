import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.5 1.5c1.933 0 3.5 1.567 3.5 3.5v9a3.5 3.5 0 01-3.5 3.5h-9A3.5 3.5 0 014 14V5a3.5 3.5 0 013.5-3.5h9zm-9 1.5A2 2 0 005.5 5v9a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2h-9z" />
    <path d="M9.75 18.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
    <path d="M12 1.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5z" />
  </svg>
);
