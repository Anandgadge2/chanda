export default function ParcelsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-20 bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-slate-200 rounded-lg" />
          <div className="h-3 w-40 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-28 bg-slate-200 rounded-xl" />
      </div>

      {/* Filter Bar skeleton */}
      <div className="h-16 bg-white rounded-2xl border border-slate-200 p-3 flex gap-3">
        <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-10 w-36 bg-slate-100 rounded-xl" />
        <div className="h-10 w-36 bg-slate-100 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl flex items-center justify-between px-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
