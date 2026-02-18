import type { FilterOption } from "@/types";
import { SlidersHorizontal } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterOption[];
  onFilterChange: (id: string) => void;
}

 const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
        <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-4">Filter by Type</h3>
        <div className="space-y-3">
          {filters.map((filter) => (
            <label key={filter.id} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filter.checked}
                onChange={() => onFilterChange(filter.id)}
                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:checked:bg-primary cursor-pointer"
              />
              <span className="ml-2 text-sm text-text-sub-light dark:text-text-sub-dark group-hover:text-primary dark:group-hover:text-white transition-colors">
                {filter.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
        <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-2">Notification Settings</h3>
        <p className="text-sm text-text-sub-light dark:text-text-sub-dark mb-4">Control what you see in your dashboard.</p>
        <button className="w-full bg-white dark:bg-transparent border border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark hover:bg-gray-50 dark:hover:bg-gray-800 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Manage Preferences
        </button>
      </div>
    </div>
  );
};


export default FilterPanel;