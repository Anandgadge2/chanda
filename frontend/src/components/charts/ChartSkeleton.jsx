'use client';

import React from 'react';

export default function ChartSkeleton({ title = '', height = 'h-[320px]' }) {
  return (
    <div className={`w-full ${height} bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between animate-pulse select-none`}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
          <div className="h-3 w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="h-7 w-20 bg-slate-200/70 rounded-lg" />
      </div>

      <div className="flex-1 flex items-end justify-center gap-3 py-6 px-4">
        <div className="w-10 bg-slate-200/60 rounded-t-lg h-2/3" />
        <div className="w-10 bg-slate-200/80 rounded-t-lg h-full" />
        <div className="w-10 bg-slate-200/50 rounded-t-lg h-1/2" />
        <div className="w-10 bg-slate-200/70 rounded-t-lg h-4/5" />
        <div className="w-10 bg-slate-200/40 rounded-t-lg h-1/3" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
