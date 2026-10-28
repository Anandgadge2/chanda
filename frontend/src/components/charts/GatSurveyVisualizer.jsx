'use client';

import Link from 'next/link';
import { Compass, ChevronRight, Sprout, Mountain, CheckCircle2, Layers } from 'lucide-react';
import { useTranslation } from '../LanguageContext';

export default function GatSurveyVisualizer({
  parcels = [],
  totalPotkharabaHa = 0,
  totalCultivableHa = 0,
}) {
  const { isMarathi } = useTranslation();
  const potkharaba = Number(totalPotkharabaHa || 0);
  const cultivable = Number(totalCultivableHa || 0);
  const totalUsableArea = potkharaba + cultivable;
  const cultivablePct = totalUsableArea > 0 ? ((cultivable / totalUsableArea) * 100).toFixed(1) : '0.0';
  const potkharabaPct = totalUsableArea > 0 ? ((potkharaba / totalUsableArea) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-slate-300/80 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{isMarathi ? 'गट व स.नं. भूमी वापर विश्लेषक' : 'Gat & Survey Land Usability Visualizer'}</span>
            
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isMarathi
                ? 'लागवडीयोग्य क्षेत्र वि. पोटखराबा प्रमाण व जमीन प्रतवारी विश्लेषण'
                : 'Cultivable Area vs. Potkharaba split & classification metrics'}
            </p>
          </div>
        </div>

        <Link
          href="/parcels"
          className="text-[11px] text-blue-900 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50/70 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/80 transition self-start sm:self-auto shrink-0"
        >
          <span>{isMarathi ? 'भूखंड नोंदवहीत जा' : 'View Parcels Ledger'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Usability Stacked Bar Chart */}
      <div className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isMarathi ? 'लागवडीयोग्य शेतजमीन:' : 'Cultivable Agricultural Land:'}{' '}
              {cultivable.toFixed(2)} Ha
            </span>
          </span>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
            {cultivablePct}%
          </span>
        </div>

        {/* Dual Stacked Progress Chart */}
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner" aria-label="Land usability split chart">
          <div
            className="bg-emerald-600 h-full transition-all duration-500"
            style={{ width: `${cultivablePct}%` }}
            title={`${isMarathi ? 'लागवडीयोग्य:' : 'Cultivable:'} ${cultivable.toFixed(2)} Ha (${cultivablePct}%)`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${potkharabaPct}%` }}
            title={`${isMarathi ? 'पोटखराबा:' : 'Potkharaba:'} ${potkharaba.toFixed(2)} Ha (${potkharabaPct}%)`}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold pt-0.5">
          <span className="flex items-center gap-1.5 text-amber-900 text-[11px]">
            <Mountain className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isMarathi
                ? 'पोटखराबा जमीन (डोंगर, नाले, पडीक):'
                : 'Potkharaba Land (Uncultivable / Barren):'}{' '}
              {potkharaba.toFixed(2)} Ha
            </span>
          </span>
          <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
            {potkharabaPct}%
          </span>
        </div>
      </div>

      {/* Visual Analytics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 my-1">
        {/* Metric 1 */}
        <div className="p-2.5 sm:p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
            <span>{isMarathi ? 'उत्पादक शेती' : 'Productive Farmland'}</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            <span className="text-sm sm:text-base font-black text-emerald-900 font-mono">
              {cultivable.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 ml-1">
              {isMarathi ? 'हेक्टर' : 'Ha'}
            </span>
          </div>
          <div className="w-full bg-emerald-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${cultivablePct}%` }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-2.5 sm:p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-amber-800 font-bold uppercase tracking-wider">
            <span>{isMarathi ? 'अकृषक / पडीक' : 'Non-Agri / Barren'}</span>
            <Mountain className="w-3 h-3 text-amber-600" />
          </div>
          <div className="mt-1.5">
            <span className="text-sm sm:text-base font-black text-amber-900 font-mono">
              {potkharaba.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-amber-700 ml-1">
              {isMarathi ? 'हेक्टर' : 'Ha'}
            </span>
          </div>
          <div className="w-full bg-amber-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${potkharabaPct}%` }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-2.5 sm:p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 flex flex-col justify-between col-span-2 sm:col-span-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-indigo-800 font-bold uppercase tracking-wider">
            <span>{isMarathi ? 'एकूण महसूल क्षेत्र' : 'Total Revenue Area'}</span>
            <Layers className="w-3 h-3 text-indigo-600" />
          </div>
          <div className="mt-1.5">
            <span className="text-sm sm:text-base font-black text-indigo-900 font-mono">
              {totalUsableArea.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-indigo-700 ml-1">
              {isMarathi ? 'हेक्टर' : 'Ha'}
            </span>
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1.5">
            {isMarathi ? '१००% अभिलेख डिजिटल ताळमेळ' : '100% Land Records Reconciled'}
          </div>
        </div>
      </div>

      {/* Screen Reader Accessible Data Summary (WCAG 1.1.1) */}
      <table className="sr-only">
        <caption>
          {isMarathi
            ? 'गट व सर्व्हे क्रमांक भूमी विश्लेषण सारणी'
            : 'Gat and Survey Land Usability Analysis Table'}
        </caption>
        <thead>
          <tr>
            <th scope="col">{isMarathi ? 'प्रकार' : 'Classification'}</th>
            <th scope="col">{isMarathi ? 'क्षेत्र (हे.)' : 'Area (Ha)'}</th>
            <th scope="col">{isMarathi ? 'टक्केवारी (%)' : 'Percentage (%)'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{isMarathi ? 'लागवडीयोग्य क्षेत्र' : 'Cultivable Land'}</td>
            <td>{cultivable.toFixed(2)}</td>
            <td>{cultivablePct}%</td>
          </tr>
          <tr>
            <td>{isMarathi ? 'पोटखराबा क्षेत्र' : 'Potkharaba Land'}</td>
            <td>{potkharaba.toFixed(2)}</td>
            <td>{potkharabaPct}%</td>
          </tr>
          <tr>
            <td>{isMarathi ? 'एकूण क्षेत्र' : 'Total Area'}</td>
            <td>{totalUsableArea.toFixed(2)}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>

      {/* Redirect Footer */}
      <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 font-medium">
        <span>
          {isMarathi
            ? 'सर्व गट व सर्व्हे क्रमांक नोंदवही तपासण्यासाठी भूखंड विभागाचा वापर करा'
            : 'Use the Parcels module to inspect detailed Gat & Survey ledgers'}
        </span>
        <Link
          href="/parcels"
          className="text-blue-900 font-bold hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>{isMarathi ? 'भूखंड नोंदवही उघडा' : 'Open Parcels Ledger'}</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
