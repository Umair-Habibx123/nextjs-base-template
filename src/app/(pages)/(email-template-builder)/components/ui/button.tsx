"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "btn btn-primary text-primary-content",
        secondary: "btn btn-secondary text-secondary-content",
        accent: "btn btn-accent text-accent-content",
        outline: "btn btn-outline border-base-300 hover:border-primary hover:text-primary",
        ghost: "btn btn-ghost hover:bg-base-200",
        link: "btn btn-link text-primary underline-offset-4 hover:underline",
        destructive: "btn bg-error text-error-content hover:bg-error/90",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-sm rounded-md",
        lg: "h-11 px-6 text-base rounded-lg",
        icon: "h-9 w-9 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }
