export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-24 bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-slate-200 rounded-lg" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-20 bg-slate-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart & Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-52 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-72 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-52 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
