import type { Option } from '@/types';
import Image from 'next/image';
import { type Dispatch, forwardRef, type SetStateAction } from 'react';
import type { Noop } from 'react-hook-form';
import {
  type GroupBase,
  type SelectInstance,
  type SingleValue,
} from 'react-select';
import { default as ReactSelect } from 'react-select';

interface SelectProps {
  isSearchable?: boolean;
  option: Option[];
  inputId: string;
  onChange?: (value: SingleValue<Option>) => void;
  onBlur?: Noop;
  placeholder?: string;
  maxHeightMenuList?: string;
  value?: Option;
  selectClassName?: string;
  setPage?: Dispatch<SetStateAction<number>>;
  page?: number;
}

export type SelectRef = SelectInstance<Option, false, GroupBase<Option>>;

/**
 * Select without Search
 */
const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      inputId,
      maxHeightMenuList,
      isSearchable,
      onChange,
      onBlur,
      option,
      placeholder,
      value,
      setPage,
      page,
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="flex items-center">
          {setPage && (
            <button
              type="button"
              disabled={page == 1}
              onClick={() =>
                setPage((prev) => {
                  if (prev == 1) {
                    return 1;
                  }
                  return prev - 1;
                })
              }
              className="flex h-8 w-8 items-center justify-center rounded-l-md border border-gray-200 bg-gray-100 hover:bg-gray-200"
              aria-label="Previous option"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#525C76"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div className="flex-grow">
            <ReactSelect
              isSearchable={isSearchable}
              ref={ref}
              inputId={inputId}
              components={{
                IndicatorSeparator: null,
              }}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              options={option}
              getOptionValue={(option) => option.value}
              formatOptionLabel={(option) => {
                const label = option.label;
                const iconPresent = option.icon;
                const secondIcon = option.icon?.[2];
                return (
                  <div className="flex w-full items-center justify-between">
                    <span>{label}</span>
                    {iconPresent ? (
                      <div className="flex gap-1">
                        <Image
                          src={`/assets/svgs/${option.icon?.[1]}.svg`}
                          alt=""
                          height="24"
                          width="24"
                        />
                        {secondIcon ? (
                          <Image
                            src={`/assets/svgs/${option.icon?.[2]}.svg`}
                            alt=""
                            height="24"
                            width="24"
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              }}
              styles={{
                control: (_base, _state) => ({
                  border: '1px solid',
                  borderRadius: '0',
                  padding: '0.75rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  height: '3rem',
                  color: '#525C76',
                  caretColor: 'transparent',
                  borderColor: '#e2e4e8',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(to bottom, #fff, #eeeff2)',
                  width: '100%',
                }),
                valueContainer: (base) => ({
                  ...base,
                  color: '#525C76',
                  paddingLeft: 0,
                }),
                indicatorsContainer: (base, _props) => ({
                  ...base,
                  '& > div': {
                    paddingLeft: 0,
                  },
                }),
                menu: (base) => ({
                  ...base,
                  border: 'none',
                  boxShadow: 'none',
                  width: '100%',
                  minWidth: 'unset',
                }),
                menuList: (base) => ({
                  ...base,
                  visibility: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  fontSize: '14px',
                  border: '1px solid #F3F4F6',
                  maxHeight: `${maxHeightMenuList}`,
                  gap: '8px',
                  borderRadius: '0.5rem',
                  boxShadow: '0px 4px 8px 0px rgba(9, 23, 74, 0.12);',
                  overflowY: 'auto',
                  marginBottom: '30px',
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: '0.875rem',
                  backgroundColor: state.isFocused ? '#9C2D7A' : '',
                  fontWeight: 600,
                  color: state.isFocused ? '#fff' : '#424A59',
                  ':active': {
                    backgroundColor: '#9C2D7A',
                    cursor: 'pointer',
                  },
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: '#525C76',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#525C76',
                }),
              }}
              value={value}
            />
          </div>
          {setPage && (
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={value?.value ? value.value.length % 10 !== 0 : false}
              className="flex h-8 w-8 items-center justify-center rounded-r-md border border-gray-200 bg-gray-100 hover:bg-gray-200"
              aria-label="Next option"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="#525C76"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
