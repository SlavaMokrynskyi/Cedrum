import React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export const ArrowLeftSvg = (props: Props) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="20" y1="12" x2="6" y2="12" />\
      <polyline points="12 6 6 12 12 18" />
    </svg>
  );
};
