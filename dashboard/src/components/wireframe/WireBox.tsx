import { ReactNode } from "react";

type WireBoxProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function WireBox({ children, className = "", label }: WireBoxProps) {
  return (
    <div
      className={`border-2 border-neutral-800 bg-white p-4 ${className}`}
      role="presentation"
    >
      {label && (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-600">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
