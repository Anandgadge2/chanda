export default function DocumentsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-24 bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-60 bg-slate-200 rounded-lg" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl flex items-center justify-between px-4">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-7 w-20 bg-slate-300 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
