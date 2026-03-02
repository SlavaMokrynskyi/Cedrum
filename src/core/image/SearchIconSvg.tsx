import React from "react";

type Props = {
  className?: string;
  title?: string;
};

export function SearchIconSvg({ className, title = "Search" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
    >
      <circle cx={11} cy={11} r={7} />
      <line x1={16.65} y1={16.65} x2={21} y2={21} />
    </svg>
  );
}
