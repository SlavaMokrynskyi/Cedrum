import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export function CedrumLogoSvg({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 574 574"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="317,187 186,127 93,288 222,188" />
      <polygon points="387,139 397,288 344,381 469,284" />
      <polygon points="199,119 340,185 383,259 371,119" />
      <polygon points="180,314 191,455 357,455 227,393" />
      <polygon points="467,300 349,391 250,391 378,451" />
      <polygon points="212,210 97,299 178,436 167,286" />
    </svg>
  );
}
