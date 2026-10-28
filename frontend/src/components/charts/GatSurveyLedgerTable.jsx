'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TENURE_CLASSES, VIOLATION_TYPES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

export default function GatSurveyLedgerTable({ parcels = [] }) {
  const { isMarathi } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenure, setSelectedTenure] = useState('ALL');

  // Filter parcels by search query and tenure tab
  const filteredParcels = (parcels || []).filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.gatNumber?.toLowerCase().includes(q) ||
      p.oldSurveyNo?.toLowerCase().includes(q) ||
      p.villageName?.toLowerCase().includes(q) ||
      p.taluka?.toLowerCase().includes(q) ||
      p.upi?.toLowerCase().includes(q);

    const matchesTenure =
      selectedTenure === 'ALL' || p.tenureClass === selectedTenure;

    return matchesSearch && matchesTenure;
  });

  const maxArea = Math.max(...(parcels.map((p) => Number(p.totalAreaHa || 0))), 1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{isMarathi ? 'गट व सर्व्हे क्रमांक महसूल अभिलेख सारणी' : 'Gat & Survey Number Revenue Ledger'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-semibold">
                {filteredParcels.length} {isMarathi ? 'भूखंड' : 'Parcels'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {isMarathi
                ? 'नवा गट क्र., जुना स.नं., क्षेत्र, पोटखराबा व वैधानिक चौकशी सविस्तर विवरण'
                : 'New Gat No., Old Survey No., Area, Potkharaba & Statutory Inquiry Details'}
            </p>
          </div>
        </div>

        {/* Search & Tenure Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <label htmlFor="gat-search-input" className="sr-only">
              {isMarathi ? 'गट, स.नं., किंवा गाव शोधा' : 'Search Gat, Survey No. or Village'}
            </label>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="gat-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMarathi ? 'गट, स.नं., गाव शोधा...' : 'Search Gat, Survey No., Village...'}
              className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 transition"
            />
          </div>

          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-bold" role="group" aria-label={isMarathi ? 'धारणाधिकार वर्ग फिल्टर' : 'Tenure Class Filter'}>
            <button
              onClick={() => setSelectedTenure('ALL')}
              className={`px-2 py-0.5 rounded-md transition ${
                selectedTenure === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMarathi ? 'सर्व' : 'All'}
            </button>
            <button
              onClick={() => setSelectedTenure('BHOGVATDAR_CLASS_2')}
              className={`px-2 py-0.5 rounded-md transition ${
                selectedTenure === 'BHOGVATDAR_CLASS_2'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMarathi ? 'वर्ग-२' : 'Class-2'}
            </button>
            <button
              onClick={() => setSelectedTenure('SARKAR_SHASAN')}
              className={`px-2 py-0.5 rounded-md transition ${
                selectedTenure === 'SARKAR_SHASAN'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMarathi ? 'शासकीय' : 'Government'}
            </button>
          </div>
        </div>
      </div>

      {/* Modern High-Performance Analytical Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200/80">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">
            {isMarathi
              ? 'गट व सर्व्हे क्रमांक महसूल अभिलेख सारणी - नवा गट क्र., जुना स.नं., क्षेत्र, पोटखराबा व वैधानिक चौकशी सविस्तर विवरण'
              : 'Gat & Survey Number Revenue Ledger - New Gat No., Old Survey No., Area, Potkharaba & Statutory Inquiry Details'}
          </caption>
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th scope="col" className="py-2 px-3">{isMarathi ? 'गट व स.नं.' : 'Gat & Survey No.'}</th>
              <th scope="col" className="py-2 px-3">{isMarathi ? 'गाव व तालुका' : 'Village & Taluka'}</th>
              <th scope="col" className="py-2 px-3">{isMarathi ? 'धारणाधिकार वर्ग' : 'Tenure Class'}</th>
              <th scope="col" className="py-2 px-3">{isMarathi ? 'एकूण क्षेत्र (Ha)' : 'Total Area (Ha)'}</th>
              <th scope="col" className="py-2 px-3">{isMarathi ? 'लागवड वि. पोटखराबा' : 'Cultivable vs Uncultivable'}</th>
              <th scope="col" className="py-2 px-3">{isMarathi ? 'वैधानिक स्थिती / उल्लंघन' : 'Statutory Status / Breach'}</th>
              <th scope="col" className="py-2 px-3 text-right">{isMarathi ? '३६०° इतिहास' : '360° History'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
            {filteredParcels.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  {isMarathi ? 'कोणतीही भूखंड नोंद आढळली नाही.' : 'No parcel records found.'}
                </td>
              </tr>
            ) : (
              filteredParcels.map((p) => {
                const tenure = TENURE_CLASSES[p.tenureClass] || {
                  labelMr: p.tenureClass,
                  labelEn: p.tenureClass,
                  badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
                };
                const violation = p.violationType ? VIOLATION_TYPES[p.violationType] : null;
                const areaPct = ((Number(p.totalAreaHa) / maxArea) * 100).toFixed(0);
                const cultPct = Number(p.totalAreaHa) > 0 ? (((Number(p.cultivableAreaHa) || 0) / Number(p.totalAreaHa)) * 100).toFixed(0) : 100;

                return (
                  <tr
                    key={p.upi}
                    className="hover:bg-blue-50/40 transition-colors duration-100 group"
                  >
                    {/* Gat & Survey Number */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs text-[11px]">
                          {isMarathi ? `गट ${p.gatNumber}` : `Gat ${p.gatNumber}`}
                        </span>
                        {p.oldSurveyNo && (
                          <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                            {isMarathi ? `स.नं. ${p.oldSurveyNo}` : `Sr.No. ${p.oldSurveyNo}`}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate max-w-[120px]">
                        {p.upi}
                      </span>
                    </td>

                    {/* Village & Taluka */}
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900 text-xs">{p.villageName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isMarathi ? `ता. ${p.taluka}` : `Taluka ${p.taluka}`}
                      </p>
                    </td>

                    {/* Tenure Class */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${tenure.badgeClass}`}>
                        {isMarathi ? tenure.labelMr : (tenure.labelEn || tenure.labelMr)}
                      </span>
                    </td>

                    {/* Total Area with visual mini bar */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-xs min-w-[50px]">
                          {Number(p.totalAreaHa).toFixed(2)} Ha
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-blue-900 h-full rounded-full"
                            style={{ width: `${areaPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Cultivable vs Potkharaba Mini Meter */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                          <span>{isMarathi ? 'लागवड: ' : 'Cult.: '}{Number(p.cultivableAreaHa || 0).toFixed(2)}</span>
                          {Number(p.potkharabaAreaHa) > 0 && (
                            <span className="text-amber-700">{isMarathi ? 'खराबा: ' : 'Uncult.: '}{Number(p.potkharabaAreaHa).toFixed(2)}</span>
                          )}
                        </div>
                        <div className="w-24 h-1.5 bg-amber-200 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-600 h-full"
                            style={{ width: `${cultPct}%` }}
                            title={`${isMarathi ? 'लागवड' : 'Cultivable'}: ${cultPct}%`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Statutory Status & Violation */}
                    <td className="py-2.5 px-3">
                      {p.hasActiveDispute || p.violationType ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 shrink-0 text-rose-600" />
                          <span className="truncate max-w-[130px]">
                            {isMarathi ? (violation?.labelMr || 'शर्तभंग चौकशी सक्रीय') : (violation?.labelEn || 'Active Breach Inquiry')}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                          <span>{isMarathi ? 'निर्दोष / निर्वेध' : 'Clear / Undisputed'}</span>
                        </div>
                      )}
                    </td>

                    {/* 360 Action */}
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/parcels?search=${encodeURIComponent(p.gatNumber)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded-md border border-slate-200 transition"
                        title={isMarathi ? '३६०° फेरफार इतिहास पहा' : 'View 360° Mutation History'}
                      >
                        <span>{isMarathi ? 'तपासा' : 'Trace'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Navigation Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>{isMarathi ? 'सर्व ७/१२, फेरफार नोंदी व अभिलेख डिजिटायझेशन थेट संलग्न आहेत.' : 'All 7/12, mutation records & digitization archives are directly linked.'}</span>
        <Link
          href="/parcels"
          className="text-blue-900 font-bold hover:underline"
        >
          {isMarathi ? 'संपूर्ण भूखंड रजिस्टर उघडा →' : 'Open Full Land Parcel Register →'}
        </Link>
      </div>
    </div>
  );
}
