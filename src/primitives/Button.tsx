import { twMerge } from "@/utils";
import React, { forwardRef } from "react";
import type { ComponentProps } from "react";

const VARIANT = {
  primary:
    " bg-bca-primary text-white focus:outline-none focus-visible:rounded-md disabled:bg-bca-pink-1",
  secondary:
    "border border-bca-grey-3 shadow disabled:border-bca-grey-2 disabled:bg-bca-grey-2 disabled:text-bca-grey-5 disabled:shadow-none",
  tertiary:
    "border bg-white leading-6 text-bca-primary11 transition-shadow hover:shadow focus-visible:rounded-md focus-visible:outline-none focus-visible:ring focus-visible:ring-bca-black-1",
  destructive:
    "bg-bca-red-failure7 text-white disabled:border-bca-grey-2 disabled:bg-bca-grey-2 disabled:text-bca-grey-5 disabled:shadow-none",
  inactive:
    " bg-bca-pink-1 text-white focus:outline-none focus-visible:rounded-md focus-visible:shadow-bca-shadow-green disabled:bg-bca-grey-15",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  pagination:
    "flex items-center justify-center rounded-full bg-[#F4B9DC] p-2 text-white disabled:bg-white disabled:text-[#9DA8B6]",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant: keyof typeof VARIANT;
  isFullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, isFullWidth, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          "font-outfit flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white transition-transform duration-100 active:scale-95",
          VARIANT[variant],
          isFullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
