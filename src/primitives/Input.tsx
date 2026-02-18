import { twMerge } from "@/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}

export type Ref = HTMLInputElement;

const Input = forwardRef<Ref, InputProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <input
      className={twMerge(
        "h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...rest}
      autoComplete="off"
    />
  );
});

Input.displayName = "Input";

export { Input };
