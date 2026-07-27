import type { ReactNode } from "react";

type GridProps = {
  children: ReactNode;
  className?: string;
};

export function Grid({ children, className = "" }: GridProps) {
  return <div className={`grid-container ${className}`.trim()}>{children}</div>;
}
