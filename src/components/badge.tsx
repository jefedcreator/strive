
export type BadgeVariant = 'gold' | 'silver' | 'bronze' | 'club';

export const BadgeIcons = {
//   Award: (props: any) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       width="24"
//       height="24"
//       fill="none"
//       stroke="#FFF"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       style={{ opacity: 1 }}
//       {...props}
//     >
//       <path d="m15.477 12.89l1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
//       <circle cx="12" cy="8" r="6" />
//     </svg>
//   ),
  Award: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="#FFF"
      style={{ opacity: 1 }}
      {...props}
    >
      <path d="m9.675 13.7l.875-2.85L8.25 9h2.85l.9-2.8l.9 2.8h2.85l-2.325 1.85l.875 2.85l-2.3-1.775zM6 23v-7.725q-.95-1.05-1.475-2.4T4 10q0-3.35 2.325-5.675T12 2t5.675 2.325T20 10q0 1.525-.525 2.875T18 15.275V23l-6-2zm6-7q2.5 0 4.25-1.75T18 10t-1.75-4.25T12 4T7.75 5.75T6 10t1.75 4.25T12 16m-4 4.025L12 19l4 1.025v-3.1q-.875.5-1.888.788T12 18t-2.113-.288T8 16.926zm4-1.55" />
    </svg>
  ),
  Trophy: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="#FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 1 }}
      {...props}
    >
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978m7-7.318v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978M18 9h1.5a1 1 0 0 0 0-5H18M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm0 0H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  ),
//   Star: (props: any) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       width="24"
//       height="24"
//       fill="none"
//       stroke="#FFF"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       style={{ opacity: 1 }}
//       {...props}
//     >
//       <path
//         fill="none"
//         d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
//       />
//     </svg>
//   ),
  Star: (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFF" style="opacity:1;" {...props}><path  d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zM5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275zM12 12.25"/></svg>
  ),
//   Sparkles: (props: any) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       width="24"
//       height="24"
//       fill="none"
//       stroke="#FFF"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       style={{ opacity: 1 }}
//       {...props}
//     >
//       <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4m2-2h-4" />
//       <circle cx="4" cy="20" r="2" />
//     </svg>
//   ),
  Sparkles: (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFF" style="opacity:1;" {...props}><path  d="M2 22L7 8l9 9zm3.3-3.3l7.05-2.5l-4.55-4.55zm9.25-6.15L13.5 11.5l5.6-5.6q.8-.8 1.925-.8t1.925.8l.6.6l-1.05 1.05l-.6-.6q-.35-.35-.875-.35t-.875.35zm-4-4L9.5 7.5l.6-.6q.35-.35.35-.85t-.35-.85l-.65-.65L10.5 3.5l.65.65q.8.8.8 1.9t-.8 1.9zm2 2L11.5 9.5l3.6-3.6q.35-.35.35-.875t-.35-.875l-1.6-1.6l1.05-1.05l1.6 1.6q.8.8.8 1.925t-.8 1.925zm4 4L15.5 13.5l1.6-1.6q.8-.8 1.925-.8t1.925.8l1.6 1.6l-1.05 1.05l-1.6-1.6q-.35-.35-.875-.35t-.875.35zM5.3 18.7"/></svg>
  ),
//   Fire: (props: any) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
//     </svg>
//   ),
  Fire: (props: any) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFF" style="opacity:1;" {...props}><path  d="M6 14q0 1.3.525 2.463t1.5 2.037Q8 18.375 8 18.275v-.225q0-.8.3-1.5t.875-1.275L12 12.5l2.825 2.775q.575.575.875 1.275t.3 1.5v.225q0 .1-.025.225q.975-.875 1.5-2.037T18 14q0-1.25-.462-2.363T16.2 9.65q-.5.325-1.05.488t-1.125.162q-1.55 0-2.688-1.025T10.026 6.75Q9.05 7.575 8.3 8.463t-1.263 1.8t-.774 1.862T6 14m6 1.3l-1.425 1.4q-.275.275-.425.625t-.15.725q0 .8.587 1.375T12 20t1.412-.575T14 18.05q0-.4-.15-.737t-.425-.613zM12 3v3.3q0 .85.588 1.425t1.437.575q.45 0 .838-.187t.687-.563L16 7q1.85 1.05 2.925 2.925T20 14q0 3.35-2.325 5.675T12 22t-5.675-2.325T4 14q0-3.225 2.162-6.125T12 3"/></svg>
  ),    
};

export const variantStyles = {
  gold: {
    gradient: 'from-amber-300 via-yellow-500 to-amber-600',
    satoriGradient: 'linear-gradient(135deg, #FFD02D 0%, #E39D00 50%, #B86B00 100%)',
    glow: 'bg-yellow-500/20',
    satoriGlow: 'rgba(255, 215, 0, 0.3)',
    decorations: 'text-yellow-400',
    accent: '#FACC15',
    label: 'GOLD',
    Icon: BadgeIcons.Award,
  },
  silver: {
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    satoriGradient: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #475569 100%)',
    glow: 'bg-slate-400/20',
    satoriGlow: 'rgba(192, 192, 192, 0.3)',
    decorations: 'text-slate-400',
    accent: '#E2E8F0',
    label: 'SILVER',
    Icon: BadgeIcons.Award,
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-500 to-orange-700',
    satoriGradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #C2410C 100%)',
    glow: 'bg-orange-500/20',
    satoriGlow: 'rgba(205, 127, 50, 0.3)',
    decorations: 'text-orange-500',
    accent: '#FFEDD5',
    label: 'BRONZE',
    Icon: BadgeIcons.Award,
  },
  club: {
    gradient: 'from-blue-400 via-indigo-500 to-purple-700',
    satoriGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #4c1d95 100%)',
    glow: 'bg-blue-500/20',
    satoriGlow: 'rgba(59, 130, 246, 0.3)',
    decorations: 'text-blue-400',
    accent: '#60A5FA',
    label: 'CLUB',
    Icon: BadgeIcons.Fire,
  },
};

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
  labelOverride?: string;
}

export function Badge({ variant, className = '', labelOverride }: BadgeProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

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
          <Icon className="w-32 h-32 mb-2" />
          <span className="font-black text-2xl uppercase tracking-[0.2em] -mt-2">
            {labelOverride || styles.label}
          </span>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className={`absolute top-0 right-4 animate-bounce ${styles.decorations}`}>
        <BadgeIcons.Star className="w-8 h-8" />
      </div>
      <div className={`absolute bottom-10 left-0 ${styles.decorations}`}>
        <BadgeIcons.Sparkles className="w-10 h-10" />
      </div>
    </div>
  );
}
