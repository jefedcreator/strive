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
        "border-bca-grey-5 text-bca-grey-4 border-opacity-40 h-12 w-full rounded-md border px-3 py-[0.69rem] text-sm font-semibold focus:outline-none focus-visible:rounded-md disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...rest}
      // role="presentation"
      autoComplete="off"
    />
  );
});

Input.displayName = "Input";

export { Input };
