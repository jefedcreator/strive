export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T = unknown>
  extends ApiResponse<T>,
  PaginationMeta { }

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
  thisWeek = 'this-week',
  lastWeek = 'last-week',
  thisMonth = 'this-month',
  lastMonth = 'last-month',
  thisYear = 'this-year',
}

interface LeaderboardEntry {
  rank: number;
  athlete: string;
  distance: string;
  avgPace: string;
  initials: string;
  color: string;
}

interface Activity {
  id: string;
  club: string;
  description: string;
  time: string;
  initials: string;
  color: string;
}


export type { ISubMenu, Option, LeaderboardEntry, Activity };
export { DateRangeFilters };
