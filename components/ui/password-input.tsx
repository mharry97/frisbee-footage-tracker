"use client"

import * as React from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 pr-10 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100"
          aria-label="Toggle password visibility"
        >
          {visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
        </button>
      </div>
    );
  }
);
