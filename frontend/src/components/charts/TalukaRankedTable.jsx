'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

export default function TalukaRankedTable({ data = [], selectedTaluka = '' }) {
  const { isMarathi } = useTranslation();

  const talukaMap = useMemo(() => {
    const map = new Map();
    CHANDRAPUR_TALUKAS.forEach((t) => {
      map.set(t.id.toLowerCase(), { nameMr: t.nameMr, nameEn: t.nameEn });
    });
    return map;
  }, []);

  const rankedData = useMemo(() => {
    return (data || [])
      .map((item) => {
        const meta = talukaMap.get((item.taluka || '').toLowerCase()) || {
          nameMr: item.taluka,
          nameEn: item.taluka,
        };
        const parcels = Number(item.parcelCount || 0);
        const violations = Number(item.violationCount || 0);
        const totalArea = Number(Number(item.totalAreaHa || 0).toFixed(2));

        return {
          id: (item.taluka || '').toLowerCase(),
          nameMr: meta.nameMr,
          nameEn: meta.nameEn,
          parcels,
          violations,
          totalArea,
          isSelected: (selectedTaluka || '').toLowerCase() === (item.taluka || '').toLowerCase(),
        };
      })
      .sort((a, b) => b.parcels - a.parcels);
  }, [data, talukaMap, selectedTaluka]);

  const maxParcels = rankedData.length > 0 ? rankedData[0].parcels : 1;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                <span>{isMarathi ? 'तालुकानिहाय महसूल कामगिरी व वाद विश्लेषण' : 'Taluka Volume & Dispute Analysis'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold shrink-0">
                  १५ तालुके
                </span>
              </h3>
            </div>
          </div>

          <Link
            href={`/reports?tab=prapatra5&prapatra=1${selectedTaluka ? `&taluka=${encodeURIComponent(selectedTaluka)}` : ''}`}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{isMarathi ? 'प्रपत्र १ अहवाल' : 'Prapatra 1'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Ranked Leaderboard List */}
        <div className="mt-3.5 space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
          {rankedData.map((t, idx) => {
            const barWidth = (t.parcels / maxParcels) * 100;

            return (
              <Link
                key={t.id}
                href={`/parcels?taluka=${encodeURIComponent(t.id)}`}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between group ${
                  t.isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-2xs'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 w-36 sm:w-44">
                  <span className="text-[11px] font-bold text-slate-400 font-mono w-4 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                    {isMarathi ? t.nameMr : t.nameEn}
                  </span>
                </div>

                {/* Inline Sparkbar */}
                <div className="flex-1 mx-3 hidden sm:block">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(6, barWidth)}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Volume & Dispute Tag */}
                <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                  <span className="font-bold text-slate-900 w-16 text-right">
                    {t.parcels.toLocaleString('en-IN')} गट
                  </span>

                  {t.violations > 0 ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 w-16 text-center">
                      {t.violations} वाद
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-16 text-center">
                      निरंक
                    </span>
                  )}

                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Total */}
      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          {isMarathi ? 'जिल्हास्तरीय एकूण व्याप्ती:' : 'District Reach:'}
        </span>
        <span className="font-extrabold text-slate-900 font-mono bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">
          १५ तालुके • ७२३ गावे
        </span>
      </div>
    </div>
  );
}
