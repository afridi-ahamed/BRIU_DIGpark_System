// Reusable skeleton loading components

export const SkeletonLine = ({ width = 'w-full', height = 'h-3' }) => (
  <div className={`skeleton ${width} ${height}`} />
);

export const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl p-6 space-y-4">
    <SkeletonLine width="w-24" height="h-2" />
    <SkeletonLine width="w-16" height="h-8" />
    <SkeletonLine height="h-1.5" />
  </div>
);

export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-teal-500/10" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
      <div className="absolute inset-[4px] rounded-full border border-transparent border-t-teal-300/50 animate-spin" style={{ animationDuration: '0.6s' }} />
    </div>
    <p className="section-label text-teal-500/70 animate-pulse">{label}</p>
  </div>
);

export const InlineLoader = () => (
  <div className="relative w-4 h-4">
    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
  </div>
);
