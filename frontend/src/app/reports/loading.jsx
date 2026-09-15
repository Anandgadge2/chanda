export default function ReportsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-24 bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-60 bg-slate-200 rounded-lg" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-200 rounded-xl" />
      </div>

      {/* Report preview skeleton */}
      <div className="h-96 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="h-6 w-52 bg-slate-200 rounded" />
        <div className="h-72 bg-slate-50 rounded-xl" />
      </div>
    </div>
  );
}
