import React from "react";

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function CardGrid({ children, className = "" }: CardGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${className}`}>
      {children}
    </div>
  );
}
