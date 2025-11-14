// import * as React from "react";
// import { cn } from "../lib/utils";

// // Explicitly define the prop types, overriding the default onChange type
// interface ColorPickerProps extends Omit<React.ComponentProps<"input">, "onChange" | "type"> {
//   label?: string;
//   value?: string;
//   onChange?: (value: string) => void;
// }

// export function Input({ className, label, value, onChange, ...props }: ColorPickerProps) {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     if (onChange) onChange(newValue); // ✅ Now types match
//   };

//   return (
//     <div className="flex flex-col gap-1">
//       {label && <label className="text-sm text-gray-700">{label}</label>}
//       <input
//         type="color"
//         value={value}
//         onChange={handleChange}
//         className={cn(
//           "h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1 transition-colors",
//           className
//         )}
//         {...props}
//       />
//     </div>
//   );
// }


"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface ColorPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * 🟣 Professional DaisyUI Color Picker
 * - Keeps your current behavior and typing
 * - Matches DaisyUI inputs visually
 * - Works across light/dark themes
 */
export function Input({
  className,
  label,
  value,
  onChange,
  ...props
}: ColorPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label pb-1">
          <span className="label-text text-sm font-medium text-base-content/80">
            {label}
          </span>
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Color Input */}
        <input
          type="color"
          value={value}
          onChange={handleChange}
          className={cn(
            "h-10 w-10 cursor-pointer rounded-md border border-base-300 bg-base-100 shadow-sm transition-all hover:scale-[1.05] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
            className
          )}
          {...props}
        />

        {/* Hex Preview / Editable Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="input input-bordered input-sm w-full font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
