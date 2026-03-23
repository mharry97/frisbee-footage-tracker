import { LuMinus, LuPlus } from "react-icons/lu";
import React from "react";

type ThrowCounterProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function ThrowCounter({ value = 0, onChange }: ThrowCounterProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-300 mb-1">Throws</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-700 hover:bg-neutral-700 transition-colors"
          aria-label="Decrease throws"
        >
          <LuMinus />
        </button>
        <span className="text-lg min-w-[3ch] text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-700 hover:bg-neutral-700 transition-colors"
          aria-label="Increase throws"
        >
          <LuPlus />
        </button>
      </div>
    </div>
  );
}
