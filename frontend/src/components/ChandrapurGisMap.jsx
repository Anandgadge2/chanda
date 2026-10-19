'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  Factory,
  Zap,
  Castle,
  Landmark,
  Pickaxe,
  FileText,
  HeartHandshake,
  ShieldAlert,
  ChevronRight,
  Info,
  ExternalLink,
  Sparkles,
  TreePine,
  Waves,
  Train,
} from 'lucide-react';
import {
  TALUKA_GIS_DATA,
  SUB_DIVISIONS,
  NEIGHBORING_REGIONS,
  RIVERS_DATA,
  RESERVOIRS,
  TADOBA_RESERVE,
  GIS_POIS,
  RAILWAY_ROUTE,
  CHANDRAPUR_DISTRICT_BOUNDS,
  CHANDRAPUR_OUTLINE_PATH,
} from '../lib/chandrapurMapData';

export default function ChandrapurGisMap({
  selectedTaluka = '',
  onSelectTaluka,
  analyticsData = [],
}) {
  const [hoveredTaluka, setHoveredTaluka] = useState(null);
  const [hoveredPoi, setHoveredPoi] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'risk' | 'sdo'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Active Map Layer Toggles
  const [layers, setLayers] = useState({
    talukas: true,
    rivers: true,
    reservoirs: true,
    tadoba: true,
    industries: true,
    mines: true,
    forts: true,
    heritage: true,
    railways: true,
    neighbors: true,
    labels: true,
  });

  const mapContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // Merge dynamic backend analytics into taluka GIS items
  const talukaDataMap = useMemo(() => {
    const map = new Map();
    TALUKA_GIS_DATA.forEach((t) => {
      const analyticMatch = (analyticsData || []).find(
        (a) => (a.taluka || '').toLowerCase() === t.id.toLowerCase()
      );
      map.set(t.id.toLowerCase(), {
        ...t,
        liveParcelCount: analyticMatch ? analyticMatch.parcelCount : t.total712,
        liveViolationCount: analyticMatch ? analyticMatch.violationCount : t.shartbhang,
        liveDisputeCount: analyticMatch ? analyticMatch.disputeCount : t.govtEncroached,
        liveTotalAreaHa: analyticMatch ? analyticMatch.totalAreaHa : t.cultivableHa,
      });
    });
    return map;
  }, [analyticsData]);

  // Max violations for choropleth scale calculation
  const maxViolations = useMemo(() => {
    let max = 1;
    TALUKA_GIS_DATA.forEach((t) => {
      const item = talukaDataMap.get(t.id.toLowerCase());
      if (item && item.liveViolationCount > max) {
        max = item.liveViolationCount;
      }
    });
    return max;
  }, [talukaDataMap]);

  // Determine Taluka Fill Color based on View Mode (Bright, Realistic Palette from Image 2)
  const getTalukaFill = (taluka) => {
    const isSelected = selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
    const isHovered = hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();

    if (viewMode === 'risk') {
      const item = talukaDataMap.get(taluka.id.toLowerCase());
      const v = item ? item.liveViolationCount : taluka.shartbhang;
      const ratio = Math.min(v / Math.max(maxViolations, 1), 1);
      // Clean, bright choropleth scale
      if (ratio < 0.1) return isHovered ? '#86EFAC' : '#DCFCE7';
      if (ratio < 0.3) return isHovered ? '#FEF08A' : '#FEF9C3';
      if (ratio < 0.6) return isHovered ? '#FED7AA' : '#FFEDD5';
      return isHovered ? '#FCA5A5' : '#FEE2E2';
    }

    if (viewMode === 'sdo') {
      const sdo = SUB_DIVISIONS.find((s) => s.id === taluka.sdoId);
      return sdo ? (isHovered ? sdo.color + '55' : sdo.color + '33') : taluka.colorAdmin;
    }

    // Official Administrative Map: Authentic Pastel Colors matching Image 2
    if (isSelected) return '#FEF08A';
    return taluka.colorAdmin;
  };

  // Determine Taluka Stroke Color
  const getTalukaStroke = (taluka) => {
    const isSelected = selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
    const isHovered = hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();

    if (isSelected) return '#1D4ED8'; // Bold royal blue outline
    if (isHovered) return '#D97706'; // Vibrant amber glow on hover

    return taluka.colorBorder || '#1E293B';
  };

  // Handle Mouse Events for Hover Tooltip (Measured relative to Canvas viewport)
  const handleMouseMove = (e) => {
    const el = canvasRef.current || mapContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Calculate Smart Tooltip Coordinates (4-quadrant auto-anchor + boundary clamping)
  const getSmartTooltipStyle = (cardWidth = 320, cardHeight = 290) => {
    const el = canvasRef.current || mapContainerRef.current;
    if (!el) return { left: '16px', top: '16px' };
    const rect = el.getBoundingClientRect();
    const containerW = rect.width || 800;
    const containerH = rect.height || 600;

    const style = {};

    // Horizontal placement:
    // If cursor is past 52% of canvas width or near right edge, anchor right edge to cursor left
    if (tooltipPos.x > containerW * 0.52 || tooltipPos.x + cardWidth + 20 > containerW) {
      const rightDistance = containerW - tooltipPos.x + 16;
      style.right = `${Math.max(12, Math.min(rightDistance, containerW - cardWidth - 12))}px`;
      style.left = 'auto';
    } else {
      const leftDistance = tooltipPos.x + 16;
      style.left = `${Math.max(12, Math.min(leftDistance, containerW - cardWidth - 12))}px`;
      style.right = 'auto';
    }

    // Vertical placement:
    // If cursor is past 45% of canvas height or near bottom edge, anchor bottom edge to cursor top
    if (tooltipPos.y > containerH * 0.45 || tooltipPos.y + cardHeight + 20 > containerH) {
      const bottomDistance = containerH - tooltipPos.y + 16;
      style.bottom = `${Math.max(12, Math.min(bottomDistance, containerH - cardHeight - 12))}px`;
      style.top = 'auto';
    } else {
      const topDistance = tooltipPos.y + 16;
      style.top = `${Math.max(12, Math.min(topDistance, containerH - cardHeight - 12))}px`;
      style.bottom = 'auto';
    }

    return style;
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseDrag = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const activeTalukaProfile = useMemo(() => {
    if (!selectedTaluka) return null;
    return talukaDataMap.get(selectedTaluka.toLowerCase()) || null;
  }, [selectedTaluka, talukaDataMap]);

  return (
    <div
      ref={mapContainerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full'
      }`}
    >
      {/* Top Header & Command Bar */}
      <div className="relative z-20 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/90 px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-slate-800">
        {/* District & System Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0 font-black">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                अधिकृत GIS नकाशा
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
                चंद्रपूर जिल्हा प्रशासकीय व कॅडस्ट्रल नकाशा
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              १५ तालुके • ६ उपविभाग (SDO) • महसूल व शर्तभंग संनियंत्रण
            </p>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setViewMode('admin')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'admin'
                ? 'bg-white text-blue-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
            title="प्रशासकीय तालुका नकाशा (Image 2 संदर्भ)"
          >
            <span>प्रशासकीय नकाशा</span>
          </button>
          <button
            onClick={() => setViewMode('risk')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'risk'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
            title="शर्तभंग व जोखीम हीटमॅप"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>शर्तभंग हीटमॅप</span>
          </button>
          <button
            onClick={() => setViewMode('sdo')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'sdo'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
            title="उपविभाग (SDO Circles)"
          >
            <span>उपविभाग (SDO)</span>
          </button>
        </div>

        {/* Layer Controls & Zoom Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedTaluka && (
            <button
              onClick={() => onSelectTaluka && onSelectTaluka('')}
              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-1 rounded-lg transition active:scale-95 cursor-pointer"
            >
              <span>सर्व १५ तालुके</span>
              <RotateCcw className="w-3 h-3 text-amber-700" />
            </button>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-100 text-slate-700 rounded transition cursor-pointer"
              title="झूम इन (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-100 text-slate-700 rounded transition cursor-pointer"
              title="झूम आउट (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-100 text-slate-700 rounded transition cursor-pointer"
              title="मूळ आकार (Reset)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
            title={isFullscreen ? 'सामान्य आकार' : 'पूर्ण स्क्रीन (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggles Bar (Clean Light Badges) */}
      <div className="relative z-10 bg-slate-50/80 border-b border-slate-200 px-3 py-1.5 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-700">
          <Layers className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-bold text-slate-800 text-xs">नकाशा स्तर:</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          <button
            onClick={() => setLayers((p) => ({ ...p, rivers: !p.rivers }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.rivers
                ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Waves className="w-3 h-3 text-sky-600" />
            <span>नद्या व जलसाठे</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, tadoba: !p.tadoba }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.tadoba
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <TreePine className="w-3 h-3 text-emerald-600" />
            <span>ताडोबा अभयारण्य</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, industries: !p.industries }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.industries
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Factory className="w-3 h-3 text-amber-600" />
            <span>उद्योग व वीज केंद्र</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, mines: !p.mines }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.mines
                ? 'bg-stone-100 border-stone-300 text-stone-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Pickaxe className="w-3 h-3 text-stone-600" />
            <span>कोळसा खाणी (WCL)</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, forts: !p.forts }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.forts
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Castle className="w-3 h-3 text-rose-600" />
            <span>गोंड किल्ले व मंदिरे</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, railways: !p.railways }))}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.railways
                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Train className="w-3 h-3 text-indigo-600" />
            <span>रेल्वे मार्ग</span>
          </button>

          <button
            onClick={() => setShowLegend((p) => !p)}
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              showLegend
                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Info className="w-3 h-3 text-blue-700" />
            <span>संदर्भ सूची</span>
          </button>
        </div>
      </div>

      {/* Main Map SVG Canvas (Bright, Crisp White Background) */}
      <div
        ref={canvasRef}
        className={`relative w-full flex items-center justify-center select-none overflow-hidden cursor-${
          isDragging ? 'grabbing' : 'grab'
        } ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[520px] sm:h-[600px] lg:h-[660px]'}`}
        style={{
          backgroundColor: '#FFFFFF',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseDrag(e);
          handleMouseMove(e);
        }}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredTaluka(null);
          setHoveredPoi(null);
        }}
      >
        {/* Subtle, Crisp Geographic Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* SVG Drawing Canvas */}
        <svg
          viewBox={CHANDRAPUR_DISTRICT_BOUNDS.viewBox}
          className="w-full h-full max-h-full transition-transform duration-100 ease-out origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          <defs>
            {/* Filters for Selection Glow (calibrated for 323x363) */}
            <filter id="glow-selected-bright" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#2563EB" floodOpacity="0.9" />
            </filter>
            <filter id="glow-hover-bright" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#D97706" floodOpacity="0.8" />
            </filter>

            {/* Pattern for Tadoba Forest Reserve */}
            <pattern id="tadoba-pattern-bright" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#15803D" fillOpacity="0.18" />
              <circle cx="3" cy="3" r="0.8" fill="#16A34A" fillOpacity="0.6" />
            </pattern>
          </defs>

          {/* Layer: Neighboring Regions & State Border Dashed Reference Lines (Background) */}
          {layers.neighbors && (
            <g className="neighboring-borders pointer-events-none">
              {(NEIGHBORING_REGIONS || []).map((region, idx) => (
                <path
                  key={`border-${idx}`}
                  d={region.borderLine}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="0.8"
                  strokeDasharray="3,2"
                  opacity="0.85"
                />
              ))}
            </g>
          )}

          {/* Layer: 15 Real Taluka Polygons Traced from Image 2 */}
          <g id="talukas-real-layer">
            {/* District Landmass Base (Ensures zero transparency crevices) */}
            <path
              d={CHANDRAPUR_OUTLINE_PATH}
              fill="#F8FAFC"
              stroke="none"
              pointerEvents="none"
            />

            {(TALUKA_GIS_DATA || []).map((taluka) => {
              const isSelected =
                selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
              const isHovered =
                hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();

              const fillColor = getTalukaFill(taluka);
              const strokeColor = getTalukaStroke(taluka);

              return (
                <g
                  key={taluka.id}
                  className="taluka-polygon-group cursor-pointer transition-all duration-200"
                  onClick={() => {
                    if (onSelectTaluka) {
                      if (isSelected) {
                        onSelectTaluka('');
                      } else {
                        onSelectTaluka(taluka.id);
                      }
                    }
                  }}
                  onMouseEnter={() => setHoveredTaluka(taluka)}
                  onMouseLeave={() => setHoveredTaluka(null)}
                >
                  {/* Taluka Boundary Path */}
                  <path
                    d={taluka.path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.85}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-colors duration-150"
                  />

                  {/* Headquarters Marker */}
                  <circle
                    cx={taluka.center[0]}
                    cy={taluka.center[1]}
                    r={isSelected ? 3.0 : isHovered ? 2.4 : 1.6}
                    fill={isSelected ? '#1E3A8A' : isHovered ? '#D97706' : '#1E293B'}
                    stroke="#FFFFFF"
                    strokeWidth={0.6}
                  />

                  {/* Special Ring for District Headquarter (Chandrapur) */}
                  {taluka.id === 'Chandrapur' && (
                    <circle
                      cx={taluka.center[0]}
                      cy={taluka.center[1]}
                      r={4.2}
                      fill="none"
                      stroke="#B45309"
                      strokeWidth="0.9"
                      strokeDasharray="1.5,1.5"
                    />
                  )}

                  {/* Taluka Labels (Clean Dark Text with White Halo) */}
                  {layers.labels && (
                    <g pointerEvents="none">
                      <text
                        x={taluka.center[0]}
                        y={taluka.center[1] - 2.8}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize={isSelected ? '8.2' : isHovered ? '7.6' : '6.4'}
                        fontWeight="900"
                        className="select-none tracking-tight font-black"
                        style={{
                          textShadow:
                            '0 0 3px #FFFFFF, 0 0 5px #FFFFFF, 0 1px 2px #FFFFFF',
                        }}
                      >
                        {taluka.nameMr}
                      </text>
                      <text
                        x={taluka.center[0]}
                        y={taluka.center[1] + 5.2}
                        textAnchor="middle"
                        fill="#1E293B"
                        fontSize={isSelected ? '5.2' : isHovered ? '4.8' : '4.2'}
                        fontWeight="800"
                        className="select-none tracking-wider uppercase font-mono"
                        style={{
                          textShadow: '0 0 2.5px #FFFFFF, 0 0 4px #FFFFFF',
                        }}
                      >
                        {taluka.nameEn}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Official Outer District Perimeter Outline */}
            <path
              d={CHANDRAPUR_OUTLINE_PATH}
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />

            {/* Hover / Selection Top-Level Outline Overlay (Ensures active border never gets clipped) */}
            {hoveredTaluka && (
              <path
                d={hoveredTaluka.path}
                fill="none"
                stroke="#D97706"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#glow-hover-bright)"
                pointerEvents="none"
              />
            )}
            {selectedTaluka && (
              <path
                d={
                  TALUKA_GIS_DATA.find(
                    (t) => t.id.toLowerCase() === selectedTaluka.toLowerCase()
                  )?.path
                }
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#glow-selected-bright)"
                pointerEvents="none"
              />
            )}
          </g>

          {/* Layer: Tadoba-Andhari Tiger Reserve */}
          {layers.tadoba && TADOBA_RESERVE && (
            <g
              id="tadoba-layer"
              className="cursor-pointer"
              onMouseEnter={() =>
                setHoveredPoi({
                  nameMr: TADOBA_RESERVE.nameMr,
                  badge: 'राष्ट्रीय उद्यान व व्याघ्र प्रकल्प',
                  description: TADOBA_RESERVE.description,
                  taluka: 'Chimur / Bhadravati / Chandrapur',
                })
              }
              onMouseLeave={() => setHoveredPoi(null)}
            >
              <path
                d={TADOBA_RESERVE.path}
                fill="url(#tadoba-pattern-bright)"
                stroke="#15803D"
                strokeWidth="0.8"
                strokeDasharray="2,1.5"
              />
              <g transform={`translate(${TADOBA_RESERVE.center[0] - 5}, ${TADOBA_RESERVE.center[1] - 5})`}>
                <rect width="10" height="10" rx="5" fill="#15803D" stroke="#FFFFFF" strokeWidth="0.6" />
                <text x="5" y="7" textAnchor="middle" fontSize="6">
                  🐅
                </text>
              </g>
              <text
                x={TADOBA_RESERVE.center[0]}
                y={TADOBA_RESERVE.center[1] + 10}
                textAnchor="middle"
                fill="#166534"
                fontSize="5.2"
                fontWeight="900"
                style={{
                  textShadow: '0 0 3px #FFFFFF, 0 0 5px #FFFFFF',
                }}
              >
                ताडोबा व्याघ्र प्रकल्प
              </text>
            </g>
          )}

          {/* Layer: Major Rivers & Water Reservoirs */}
          {layers.rivers && (
            <g id="rivers-layer" pointerEvents="none">
              {(RIVERS_DATA || []).map((river) => (
                <g key={river.id}>
                  <path
                    d={river.path}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth={(river.width || 1) + 1}
                    opacity="0.35"
                    strokeLinecap="round"
                  />
                  <path
                    d={river.path}
                    fill="none"
                    stroke={river.color}
                    strokeWidth={river.width || 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x={river.labelPos[0]}
                    y={river.labelPos[1]}
                    fill="#0369A1"
                    fontSize="4.4"
                    fontWeight="800"
                    fontStyle="italic"
                    style={{
                      textShadow: '0 0 3px #FFFFFF, 0 0 5px #FFFFFF',
                    }}
                  >
                    {river.nameMr}
                  </text>
                </g>
              ))}

              {/* Lakes & Reservoirs */}
              {layers.reservoirs &&
                (RESERVOIRS || []).map((res) => (
                  <g key={res.id}>
                    <ellipse
                      cx={res.pos[0]}
                      cy={res.pos[1]}
                      rx={res.rx}
                      ry={res.ry}
                      fill="#38BDF8"
                      fillOpacity="0.8"
                      stroke="#0284C7"
                      strokeWidth="0.6"
                    />
                    <text
                      x={res.pos[0]}
                      y={res.pos[1] - res.ry - 1.5}
                      textAnchor="middle"
                      fill="#0369A1"
                      fontSize="4.2"
                      fontWeight="800"
                      style={{
                        textShadow: '0 0 3px #FFFFFF',
                      }}
                    >
                      {res.nameMr}
                    </text>
                  </g>
                ))}
            </g>
          )}

          {/* Layer: Railway Line */}
          {layers.railways && RAILWAY_ROUTE && (
            <g id="railways-layer" pointerEvents="none">
              <path
                d={RAILWAY_ROUTE.path}
                fill="none"
                stroke="#334155"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d={RAILWAY_ROUTE.path}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              {(RAILWAY_ROUTE.stations || []).map((st, sidx) => (
                <g key={sidx} transform={`translate(${st.pos[0]}, ${st.pos[1]})`}>
                  <circle r="1.4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.4" />
                </g>
              ))}
            </g>
          )}

          {/* Layer: Points of Interest (POIs) */}
          <g id="pois-layer">
            {(GIS_POIS || []).map((poi) => {
              if (poi.type === 'power' && !layers.industries) return null;
              if (poi.type === 'paper' && !layers.industries) return null;
              if (poi.type === 'cement' && !layers.industries) return null;
              if (poi.type === 'mine' && !layers.mines) return null;
              if (poi.type === 'fort' && !layers.forts) return null;
              if (poi.type === 'heritage' && !layers.heritage) return null;

              const isPoiHovered = hoveredPoi && hoveredPoi.id === poi.id;

              return (
                <g
                  key={poi.id}
                  transform={`translate(${poi.pos[0]}, ${poi.pos[1]})`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredPoi(poi)}
                  onMouseLeave={() => setHoveredPoi(null)}
                >
                  {isPoiHovered && (
                    <circle r="6" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.8" />
                  )}

                  <circle
                    r={isPoiHovered ? 4.5 : 3.2}
                    fill={
                      poi.type === 'power'
                        ? '#D97706'
                        : poi.type === 'mine'
                        ? '#44403C'
                        : poi.type === 'cement'
                        ? '#0284C7'
                        : poi.type === 'paper'
                        ? '#15803D'
                        : poi.type === 'fort'
                        ? '#BE123C'
                        : '#7C3AED'
                    }
                    stroke="#FFFFFF"
                    strokeWidth="0.6"
                    className="drop-shadow-sm"
                  />

                  <text
                    y="1.2"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={poi.type === 'power' ? '3.6' : '3.2'}
                    fontWeight="bold"
                    className="select-none"
                  >
                    {poi.type === 'power'
                      ? '⚡'
                      : poi.type === 'mine'
                      ? '⛏'
                      : poi.type === 'cement'
                      ? '🏭'
                      : poi.type === 'paper'
                      ? '📄'
                      : poi.type === 'fort'
                      ? '🏰'
                      : '🛕'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Layer: Neighboring Region & State Labels (Foreground - Always visible on top of map) */}
          {layers.neighbors && (
            <g className="neighboring-labels pointer-events-none select-none">
              {(NEIGHBORING_REGIONS || []).map((region, idx) => (
                <g key={`label-${idx}`}>
                  <text
                    x={region.pos[0]}
                    y={region.pos[1]}
                    textAnchor={region.anchor || 'middle'}
                    fill="#334155"
                    fontSize="6.2"
                    fontWeight="900"
                    letterSpacing="0.6"
                    className="select-none uppercase font-black"
                    style={{
                      textShadow:
                        '0 0 3px #FFFFFF, 0 0 6px #FFFFFF, 0 1px 2px #FFFFFF',
                    }}
                  >
                    {region.nameMr}
                  </text>
                  {region.subText && (
                    <text
                      x={region.pos[0]}
                      y={region.pos[1] + 5.5}
                      textAnchor={region.anchor || 'middle'}
                      fill="#64748B"
                      fontSize="4.2"
                      fontWeight="700"
                      style={{
                        textShadow: '0 0 3px #FFFFFF, 0 0 5px #FFFFFF',
                      }}
                    >
                      {region.subText}
                    </text>
                  )}
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Clean Hover HUD Tooltip (Bright Modern Card with 4-Quadrant Collision Avoidance) */}
        {hoveredTaluka && !hoveredPoi && (
          <div
            className="absolute z-50 pointer-events-none transition-all duration-75 ease-out w-[310px] sm:w-[340px] max-w-[calc(100%-24px)]"
            style={getSmartTooltipStyle(340, 310)}
          >
            <div className="bg-white/98 text-slate-900 p-3.5 rounded-xl border border-slate-200/90 shadow-2xl backdrop-blur-md max-h-[calc(100%-24px)] overflow-y-auto scrollbar-none ring-1 ring-slate-900/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                      तालुका {hoveredTaluka.nameMr}
                    </h3>
                    <span className="text-xs text-blue-900 font-bold block truncate">
                      {hoveredTaluka.nameEn} • {hoveredTaluka.sdoSubdivision}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-bold shrink-0 shadow-2xs">
                  {hoveredTaluka.villagesCount} गावे
                </span>
              </div>

              {/* Live Revenue Statistics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                <div className="bg-blue-50/70 border border-blue-200/80 p-2 rounded-lg">
                  <span className="text-blue-900/80 text-[11px] block font-semibold">नोंदणीकृत भूखंड:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    {(
                      talukaDataMap.get(hoveredTaluka.id.toLowerCase())?.liveParcelCount ||
                      hoveredTaluka.total712
                    ).toLocaleString('mr-IN')}
                  </span>
                </div>
                <div className="bg-amber-50/90 border border-amber-200 p-2 rounded-lg">
                  <span className="text-amber-900 text-[11px] block font-bold">शर्तभंग चौकशी:</span>
                  <span className="font-black text-amber-800 text-sm sm:text-base">
                    {(
                      talukaDataMap.get(hoveredTaluka.id.toLowerCase())?.liveViolationCount ||
                      hoveredTaluka.shartbhang
                    ).toLocaleString('mr-IN')}{' '}
                    प्रकरणे
                  </span>
                </div>
                <div className="bg-rose-50/90 border border-rose-200 p-2 rounded-lg">
                  <span className="text-rose-900 text-[11px] block font-semibold">शासकीय जमीन:</span>
                  <span className="font-black text-rose-800 text-sm sm:text-base">
                    {hoveredTaluka.govtLand || hoveredTaluka.govtEncroached} गट
                  </span>
                </div>
                <div className="bg-emerald-50/90 border border-emerald-200 p-2 rounded-lg">
                  <span className="text-emerald-900 text-[11px] block font-semibold">एकूण क्षेत्र:</span>
                  <span className="font-black text-emerald-800 text-sm sm:text-base">
                    {Number(hoveredTaluka.cultivableHa).toLocaleString('mr-IN')} Ha
                  </span>
                </div>
              </div>

              {/* Economic & Cultural Highlight */}
              <div className="bg-slate-50/90 rounded-lg p-2 border border-slate-200/70 mb-2">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="text-slate-900 font-bold">वैशिष्ट्ये: </span>
                  {hoveredTaluka.keyHighlights}
                </p>
              </div>

              {/* Rivers */}
              {hoveredTaluka.rivers?.length > 0 && (
                <div className="text-xs text-sky-900 font-semibold flex items-center gap-1.5 mb-2 px-1">
                  <Waves className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                  <span className="truncate">{hoveredTaluka.rivers.join(', ')}</span>
                </div>
              )}

              {/* Action Hint */}
              <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>क्लिक करून डॅशबोर्ड डेटा फिल्टर करा</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Tooltip for POIs with Smart Placement */}
        {hoveredPoi && (
          <div
            className="absolute z-50 pointer-events-none transition-all duration-75 ease-out w-[270px] sm:w-[290px] max-w-[calc(100%-24px)]"
            style={getSmartTooltipStyle(290, 160)}
          >
            <div className="bg-white/98 text-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xl backdrop-blur-md ring-1 ring-slate-900/10">
              <div className="flex items-center gap-2 mb-1.5 font-bold">
                <span className="text-amber-600 text-base">📍</span>
                <span className="text-slate-900 text-sm sm:text-base font-black">{hoveredPoi.nameMr}</span>
              </div>
              <div className="text-xs text-blue-900 font-bold mb-1.5">
                {hoveredPoi.badge} • {hoveredPoi.taluka}
              </div>
              {hoveredPoi.description && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {hoveredPoi.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Clean Marathi Reference Legend (संदर्भ सूची) */}
        {showLegend && (
          <div className="absolute bottom-2 left-2 z-30 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl shadow-md max-w-[230px] hidden sm:block text-[10px] text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
              <span className="font-black text-blue-950 uppercase tracking-wider text-[10px]">
                संदर्भ सूची (Map Legend)
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
                title="बंद करा"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900 border border-white shadow-2xs"></span>
                <span>जिल्हा मुख्यालय (HQ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                <span>तालुका केंद्र</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-600"></span>
                <span>प्रमुख नद्या</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-slate-700"></span>
                <span>रेल्वे मार्ग</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">⛏</span>
                <span>कोळसा खाणी</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">🏭</span>
                <span>सिमेंट उद्योग</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">⚡</span>
                <span>CSTPS वीज केंद्र</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">🐅</span>
                <span>ताडोबा अभयारण्य</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">🏰</span>
                <span>ऐतिहासिक किल्ले</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">📄</span>
                <span>कागद उद्योग (BILT)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Taluka Executive Inspector Drawer (Clean Light Card) */}
      {activeTalukaProfile && (
        <div className="relative z-20 bg-gradient-to-r from-blue-50/90 via-white to-slate-50 border-t border-blue-200 p-3 sm:p-4 text-slate-900">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            {/* Taluka Title & SDO Information */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  निवडलेला तालुका
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>तालुका {activeTalukaProfile.nameMr}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({activeTalukaProfile.nameEn})
                  </span>
                </h3>
                <span className="text-xs text-blue-900 font-bold">
                  • {activeTalukaProfile.sdoSubdivision}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                <span className="text-slate-500">{activeTalukaProfile.tehsildarOffice} | </span>
                {activeTalukaProfile.keyHighlights}
              </p>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0 w-full lg:w-auto">
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-medium">नोंदणीकृत ७/१२</span>
                <span className="font-black text-slate-900 text-sm">
                  {activeTalukaProfile.liveParcelCount?.toLocaleString('mr-IN')}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                <span className="text-[10px] text-amber-800 block font-bold">शर्तभंग चौकशी</span>
                <span className="font-black text-amber-700 text-sm">
                  {activeTalukaProfile.liveViolationCount?.toLocaleString('mr-IN')}
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                <span className="text-[10px] text-rose-800 block font-medium">शासकीय जमीन</span>
                <span className="font-black text-rose-700 text-sm">
                  {activeTalukaProfile.govtLand} गट
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                <span className="text-[10px] text-emerald-800 block font-medium">एकूण क्षेत्र</span>
                <span className="font-black text-emerald-700 text-sm">
                  {Number(activeTalukaProfile.liveTotalAreaHa).toFixed(0)} Ha
                </span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                href={`/parcels?taluka=${encodeURIComponent(activeTalukaProfile.id)}`}
                className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <span>भूखंड यादी</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/cases?taluka=${encodeURIComponent(activeTalukaProfile.id)}`}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <span>सुनावण्या</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => onSelectTaluka && onSelectTaluka('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1 transition cursor-pointer"
              >
                सर्व तालुके दाखवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
