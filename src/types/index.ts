interface ISubMenu {
  name: string;
  isActive: boolean;
  subMenu: {
    name: string;
    function: () => void;
    isActive: boolean;
  }[];
}

type Option = {
  value: string;
  label: string;
  icon?:
    | {
        1: string;
        2?: string | undefined;
      }
    | undefined;
};

enum DateRangeFilters {
  thisWeek = "this-week",
  lastWeek = "last-week",
  thisMonth = "this-month",
  lastMonth = "last-month",
  thisYear = "this-year",
}

export type { ISubMenu, Option, DateRangeFilters };
