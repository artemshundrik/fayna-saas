import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "select-none",
    "transition-all duration-200 ease-out",
    // Typography base (без font-weight — вага тільки у variant)
    "text-[16px] leading-[24.8px] tracking-[0.2px]",
    // Icons
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "[&_svg]:-mt-[0.5px]",
    // Focus/disabled
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    // Shape / spacing
    "rounded-[var(--btn-radius)]",
    "gap-2",
    "will-change-transform",
    "bg-clip-padding",
  ].join(" "),
  {
    variants: {
      variant: {
        // ✅ Filled CTA (Linear-style): semibold ALWAYS
        primary: [
          "!font-medium", // ⬅️ ключ: прибиває “regular” у всіх кнопках з іконкою
          "text-primary-foreground",
          "gumloop-blue-gradient",
          "btn-3d-shadow",
          "btn-glow btn-glow-primary btn-sheen",
          "hover:-translate-y-[1px]",
          "active:scale-[0.985]",
        ].join(" "),

        // ✅ Surface (hero/secondary): medium by default (як у Linear)
        secondary: [
          "!font-medium",
          "bg-secondary text-secondary-foreground border border-border",
          "btn-surface-shadow",
          "hover:-translate-y-[1px]",
          "hover:btn-surface-shadow-hover",
          "active:translate-y-0",
          "active:scale-[0.99]",
          "active:btn-surface-pressed",
        ].join(" "),

        outline: [
          "!font-medium",
          "border border-border bg-transparent text-foreground",
          "hover:bg-accent/60",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
          "active:scale-[0.99]",
        ].join(" "),

        // ✅ Danger: semibold ALWAYS
        destructive: [
          "!font-medium",
          "text-destructive-foreground",
          "btn-danger-gradient",
          "border border-destructive/30",
          "btn-danger-3d",
          "btn-glow btn-glow-danger btn-sheen",
          "hover:bg-destructive/90",
          "hover:-translate-y-[1px]",
          "hover:btn-danger-3d-hover",
          "active:translate-y-0",
          "active:scale-[0.99]",
          "active:btn-danger-pressed",
        ].join(" "),

        // ✅ Ghost/link: medium
        ghost: "!font-medium bg-transparent text-foreground hover:bg-accent active:scale-[0.99]",
        link: "!font-medium bg-transparent text-primary underline-offset-4 hover:underline",
      },

      // ✅ Height (як ти хотів “як була”)
      size: {
        sm: "h-9 px-3",          // 36
        md: "h-10 px-5",         // 40 (default)
        lg: "h-11 px-6",         // 44
        icon: "h-10 w-10 px-0",  // 40x40
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
