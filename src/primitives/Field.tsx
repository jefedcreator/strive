import { getChildId, twMerge } from '@/utils';
import type { ReactElement } from 'react';

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
    <div className={twMerge('relative flex flex-col gap-1.5', formClassName)}>
      <label
        className={twMerge(
          'block text-sm font-semibold text-gray-700 dark:text-gray-300',
          className
        )}
        htmlFor={fieldId}
      >
        {label}
      </label>
      {children}
      {error && (
        <small className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wider text-red-500">
          {error}
        </small>
      )}
    </div>
  );
};

export { Field };
