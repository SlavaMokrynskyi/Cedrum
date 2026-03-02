import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export function SideBarIconSvg({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(0,200) scale(0.1,-0.1)" stroke="none">
        <path d="M546 1604 c-70 -22 -149 -103 -170 -174 -24 -79 -24 -781 0 -860 22
-74 100 -152 174 -174 79 -24 821 -24 900 0 74 22 152 100 174 174 24 79 24
781 0 860 -22 74 -100 152 -174 174 -77 23 -829 22 -904 0z m194 -605 l0 -461
-75 4 c-69 3 -78 6 -108 36 l-32 32 0 389 0 389 25 27 c34 37 54 44 128 44
l62 1 0 -461z m702 423 l33 -32 0 -390 0 -390 -33 -32 -32 -33 -255 -3 -255
-3 0 461 0 461 255 -3 255 -3 32 -33z"/>
      </g>
    </svg>
  );
}
