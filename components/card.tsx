import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border-b border-neutral-700">
      {children}
    </div>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 pt-0">
      {children}
    </div>
  );
}
