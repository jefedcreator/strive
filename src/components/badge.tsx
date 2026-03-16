import { Award, Sparkles, Star } from 'lucide-react';

export type BadgeVariant = 'gold' | 'silver' | 'bronze';

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantStyles = {
  gold: {
    gradient: 'from-amber-300 via-yellow-500 to-amber-600',
    glow: 'bg-yellow-500/20',
    decorations: 'text-yellow-400',
    label: 'GOLD',
  },
  silver: {
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    glow: 'bg-slate-400/20',
    decorations: 'text-slate-400',
    label: 'SILVER',
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-500 to-orange-700',
    glow: 'bg-orange-500/20',
    decorations: 'text-orange-500',
    label: 'BRONZE',
  },
};

export function Badge({ variant, className = '' }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`relative w-full max-w-[320px] aspect-square group ${className}`}>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 ${styles.glow} blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity`}
      ></div>

      {/* Main Badge */}
      <div
        className={`relative h-full w-full flex items-center justify-center bg-gradient-to-br ${styles.gradient} rounded-full shadow-2xl border-8 border-white dark:border-slate-800 overflow-hidden`}
      >
        <div className="flex flex-col items-center text-white drop-shadow-lg">
          <Award className="w-32 h-32 mb-2" strokeWidth={1.5} />
          <span className="font-black text-2xl uppercase tracking-[0.2em] -mt-2">
            {styles.label}
          </span>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className={`absolute top-0 right-4 animate-bounce ${styles.decorations}`}>
        <Star className="w-8 h-8 fill-current" />
      </div>
      <div className={`absolute bottom-10 left-0 ${styles.decorations}`}>
        <Sparkles className="w-10 h-10" />
      </div>
    </div>
  );
}
