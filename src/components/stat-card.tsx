
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
        {value}
        {unit && <span className="text-lg font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
