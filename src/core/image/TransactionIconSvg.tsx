import React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export const TransactionIconSvg = (props: Props) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2v20M2 12h20M17 7l-5-5-5 5M17 17l-5 5-5-5" />
    </svg>
  );
};
