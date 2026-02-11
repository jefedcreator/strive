import { getChildId, twMerge } from "@/utils";
import type { ReactElement } from "react";

interface FieldProps {
  className?: string;
  formClassName?: string;
  id?: string;
  children: ReactElement;
  label: string | React.ReactNode;
  error?: string;
}

const Field = ({
  id,
  children,
  label,
  error,
  className,
  formClassName,
}: FieldProps) => {
  const fieldId = getChildId(children) ?? id;

  return (
    <div
      className={twMerge(
        "font-outfit relative flex flex-col gap-1",
        formClassName,
      )}
    >
      <label
        className={twMerge(
          "text-bca-grey-1 block text-sm font-semibold",
          className,
        )}
        htmlFor={fieldId}
      >
        {label}
      </label>
      {children}
      {error && (
        <small className="absolute top-0 right-0 text-xs text-red-500">
          {error}
        </small>
      )}
    </div>
  );
};

export { Field };
