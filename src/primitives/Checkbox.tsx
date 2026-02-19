import { twMerge } from '@/utils';
import * as Checkbox from '@radix-ui/react-checkbox';
import { SquareCheck } from 'lucide-react';

const CheckBox = ({
  id,
  label,
  height,
  width,
  ischecked,
  onClick,
  checkboxClassName,
  labelClassName,
  indicatorClassName,
}: {
  id: string;
  label: string;
  height?: number;
  width?: number;
  ischecked?: boolean;
  onClick?: () => void;
  checkboxClassName?: string;
  labelClassName?: string;
  indicatorClassName?: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox.Root
        className={twMerge(
          'border-bca-primary focus:shadow-bca-primary flex appearance-none items-center justify-center rounded border bg-white outline-none',
          `h-${height ?? 4} w-${width ?? 4}`,
          checkboxClassName
        )}
        defaultChecked={false}
        id={id}
        checked={ischecked}
        onClick={onClick}
      >
        <Checkbox.Indicator
          className={twMerge(
            `bg-bca-primary h-4 w-4 rounded text-white`,
            indicatorClassName
          )}
        >
          <SquareCheck className="h-full w-full" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        className={twMerge(
          'text-bca-grey-3 font-outfit text-sm font-semibold',
          labelClassName
        )}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

export { CheckBox };
