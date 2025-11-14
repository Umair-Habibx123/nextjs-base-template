"use client"

import * as React from "react"
import { cn } from "../lib/utils"

/**
 * 🟣 Professional Input — DaisyUI + shadcn hybrid
 * Keeps your focus ring and structure, but uses DaisyUI tokens for consistency.
 */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base structure
        "input input-bordered w-full h-9 text-sm transition-all duration-200",
        // Focus and selection styling
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "selection:bg-primary selection:text-primary-content",
        // Disabled and error states
        "disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Input }
