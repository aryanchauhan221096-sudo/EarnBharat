import React from 'react';

export const QuizIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.914.64 3.682 1.732 5.093l.354.461.353-.461A8.25 8.25 0 0012 2.25z" />
    <path d="M6.262 17.518l-1.072.893a.75.75 0 001.072 1.286l1.072-.893a.75.75 0 00-1.072-1.286z" />
    <path d="M17.738 17.518a.75.75 0 00-1.072 1.286l1.072.893a.75.75 0 001.072-1.286l-1.072-.893z" />
    <path d="M12 7.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
    <path fillRule="evenodd" d="M12 21.75a2.25 2.25 0 002.25-2.25v-2.25a2.25 2.25 0 00-4.5 0v2.25A2.25 2.25 0 0012 21.75z" clipRule="evenodd" />
  </svg>
);
