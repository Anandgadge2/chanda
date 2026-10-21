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
  const [selectedSdo, setSelectedSdo] = useState('all'); // 'all' | 'chandrapur' | 'warora' | ...
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
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

  // Industry-Standard GIS Cartographic Risk Classification for Shartbhang
  const getRiskCategory = (violations = 0) => {
    const v = Number(violations) || 0;
    if (v >= 250) {
      return {
        level: 'critical',
        labelMr: 'अती-गंभीर जोखीम',
        fullLabelMr: 'अती-गंभीर जोखीम (Critical Red Zone)',
        tagMr: 'रेड झोन',
        rangeMr: '२५०+ प्रकरणे',
        fill: '#FECDD3', // Rose-200
        fillHover: '#FDA4AF', // Rose-300
        stroke: '#BE123C', // Rose-700
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-900 border-rose-300',
        icon: '🚨',
        guidanceMr: 'तातडीने SDO / जिल्हाधिकारी स्तरावर सुनावणी व MLRC कलम ५९ अन्वये नोटीस आवश्यक.',
      };
    }
    if (v >= 51) {
      return {
        level: 'high',
        labelMr: 'उच्च जोखीम',
        fullLabelMr: 'उच्च जोखीम (High Risk Orange)',
        tagMr: 'ऑरेंज झोन',
        rangeMr: '५१ - २५० प्रकरणे',
        fill: '#FFEDD5', // Orange-100
        fillHover: '#FED7AA', // Orange-200
        stroke: '#C2410C', // Orange-700
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-900 border-orange-300',
        icon: '⚠️',
        guidanceMr: 'तहसीलदार व मंडळ अधिकारी यांनी पंचनामे पूर्ण करून विल्हेवाट अहवाल सादर करावा.',
      };
    }
    if (v >= 15) {
      return {
        level: 'medium',
        labelMr: 'मध्यम जोखीम',
        fullLabelMr: 'मध्यम जोखीम (Moderate Risk Yellow)',
        tagMr: 'यलो झोन',
        rangeMr: '१५ - ५० प्रकरणे',
        fill: '#FEF9C3', // Yellow-100
        fillHover: '#FEF08A', // Yellow-200
        stroke: '#A16207', // Yellow-700
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900 border-amber-300',
        icon: '⚡',
        guidanceMr: 'तलाठी स्तरावर फेरफार नोंदी व अकृषिक परवानगीची नियमित तपासणी सुरू ठेवावी.',
      };
    }
    return {
      level: 'low',
      labelMr: 'कमी जोखीम / सुरक्षित',
      fullLabelMr: 'कमी जोखीम / सुरक्षित (Low Risk Green)',
      tagMr: 'ग्रीन झोन',
      rangeMr: '० - १४ प्रकरणे',
      fill: '#DCFCE7', // Green-100
      fillHover: '#BBF7D0', // Green-200
      stroke: '#15803D', // Green-700
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900 border-emerald-300',
      icon: '✅',
      guidanceMr: 'नियंत्रित व सुरक्षित क्षेत्र. सामान्य महसूल फेरफार नियमांनुसार संनियंत्रण.',
    };
  };

  const getSdoInfo = (sdoId) => {
    return SUB_DIVISIONS.find((s) => s.id === sdoId) || null;
  };

  // Merge dynamic backend analytics into taluka GIS items
  const talukaDataMap = useMemo(() => {
    const map = new Map();
    TALUKA_GIS_DATA.forEach((t) => {
      const analyticMatch = (analyticsData || []).find(
        (a) => (a.taluka || '').toLowerCase() === t.id.toLowerCase()
      );
      map.set(t.id.toLowerCase(), {
        ...t,
        liveParcelCount: analyticMatch?.parcelCount !== undefined ? analyticMatch.parcelCount : (t.total712 || 0),
        liveViolationCount: analyticMatch?.violationCount !== undefined ? analyticMatch.violationCount : (t.shartbhang || 0),
        liveDisputeCount: analyticMatch?.disputeCount !== undefined ? analyticMatch.disputeCount : (t.govtLand || t.govtEncroached || 0),
        liveTotalAreaHa: analyticMatch?.totalAreaHa !== undefined ? analyticMatch.totalAreaHa : (t.cultivableHa || 0),
        liveCultivableAreaHa: analyticMatch?.cultivableAreaHa !== undefined ? analyticMatch.cultivableAreaHa : (t.cultivableHa || 0),
        liveDisputedAreaHa: analyticMatch?.disputedAreaHa !== undefined ? analyticMatch.disputedAreaHa : (t.govtEncroached || 0),
      });
    });
    return map;
  }, [analyticsData]);

  // Aggregate District Risk Breakdown
  const riskStats = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let totalViolations = 0;

    TALUKA_GIS_DATA.forEach((t) => {
      const item = talukaDataMap.get(t.id.toLowerCase());
      const v = item ? item.liveViolationCount : t.shartbhang;
      totalViolations += v;
      const r = getRiskCategory(v);
      if (r.level === 'critical') critical++;
      else if (r.level === 'high') high++;
      else if (r.level === 'medium') medium++;
      else low++;
    });

    return { critical, high, medium, low, totalViolations };
  }, [talukaDataMap]);

  // Aggregate SDO-Level Statistics
  const sdoStats = useMemo(() => {
    const map = new Map();
    SUB_DIVISIONS.forEach((s) => {
      let parcels = 0;
      let violations = 0;
      let area = 0;
      let villages = 0;
      s.talukas.forEach((tId) => {
        const item = talukaDataMap.get(tId.toLowerCase());
        if (item) {
          parcels += item.liveParcelCount || 0;
          violations += item.liveViolationCount || 0;
          area += Number(item.liveTotalAreaHa || 0);
          villages += item.villagesCount || 0;
        }
      });
      map.set(s.id, { parcels, violations, area, villages });
    });
    return map;
  }, [talukaDataMap]);

  // Determine Taluka Fill Color based on View Mode and Selection
  const getTalukaFill = (taluka) => {
    const isSelected = selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
    const isHovered = hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();
    const item = talukaDataMap.get(taluka.id.toLowerCase());
    const violations = item ? item.liveViolationCount : taluka.shartbhang;
    const risk = getRiskCategory(violations);
    const sdo = getSdoInfo(taluka.sdoId);

    // 1. Shartbhang Heatmap Mode (Industry-Standard Choropleth)
    if (viewMode === 'risk') {
      if (selectedRiskLevel !== 'all' && risk.level !== selectedRiskLevel) {
        return '#F8FAFC';
      }
      if (isSelected) return '#F43F5E';
      return isHovered ? risk.fillHover : risk.fill;
    }

    // 2. Sub-Division (SDO) Mode (Qualitative Regional Palette)
    if (viewMode === 'sdo') {
      if (selectedSdo !== 'all' && taluka.sdoId !== selectedSdo) {
        return '#F8FAFC';
      }
      if (isSelected) return '#93C5FD';
      if (!sdo) return taluka.colorAdmin;
      return isHovered ? sdo.fillHover : sdo.fill;
    }

    // 3. Official Administrative Map Mode
    if (isSelected) return '#FEF08A';
    return isHovered ? taluka.colorAdmin : taluka.colorAdmin;
  };

  // Determine Taluka Stroke Color
  const getTalukaStroke = (taluka) => {
    const isSelected = selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
    const isHovered = hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();
    const item = talukaDataMap.get(taluka.id.toLowerCase());
    const violations = item ? item.liveViolationCount : taluka.shartbhang;
    const risk = getRiskCategory(violations);
    const sdo = getSdoInfo(taluka.sdoId);

    if (isSelected) return '#1D4ED8'; // Bold royal blue outline
    if (isHovered) return '#D97706'; // Vibrant amber glow on hover

    if (viewMode === 'risk') {
      if (selectedRiskLevel !== 'all' && risk.level !== selectedRiskLevel) {
        return '#E2E8F0';
      }
      return risk.stroke;
    }

    if (viewMode === 'sdo') {
      if (selectedSdo !== 'all' && taluka.sdoId !== selectedSdo) {
        return '#CBD5E1';
      }
      return sdo ? sdo.border : '#475569';
    }

    return taluka.colorBorder || '#1E293B';
  };

  // Determine Taluka Opacity for Selective Filtering
  const getTalukaOpacity = (taluka) => {
    if (viewMode === 'risk' && selectedRiskLevel !== 'all') {
      const item = talukaDataMap.get(taluka.id.toLowerCase());
      const v = item ? item.liveViolationCount : 0;
      const risk = getRiskCategory(v);
      return risk.level === selectedRiskLevel ? 1 : 0.35;
    }
    if (viewMode === 'sdo' && selectedSdo !== 'all') {
      return taluka.sdoId === selectedSdo ? 1 : 0.35;
    }
    return 1;
  };

  // Determine Taluka Stroke Width
  const getTalukaStrokeWidth = (taluka) => {
    const isSelected = selectedTaluka && selectedTaluka.toLowerCase() === taluka.id.toLowerCase();
    const isHovered = hoveredTaluka && hoveredTaluka.id.toLowerCase() === taluka.id.toLowerCase();
    if (isSelected) return 2.2;
    if (isHovered) return 1.8;
    if (viewMode === 'risk') return 1.35;
    if (viewMode === 'sdo') {
      if (selectedSdo !== 'all' && taluka.sdoId === selectedSdo) return 1.8;
      return 1.25;
    }
    return 0.85;
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

  // Determine if hovered item is on the Right or Left half of the map
  const isHoverOnRightSide = useMemo(() => {
    if (hoveredPoi && hoveredPoi.pos) {
      return hoveredPoi.pos[0] >= 170;
    }
    if (hoveredTaluka && hoveredTaluka.center) {
      return hoveredTaluka.center[0] >= 170;
    }
    const el = canvasRef.current || mapContainerRef.current;
    const containerW = el ? el.getBoundingClientRect().width : 800;
    return tooltipPos.x >= containerW * 0.5;
  }, [hoveredTaluka, hoveredPoi, tooltipPos.x]);

  // Executive Corner Docked HUD Style:
  // If hovering on RIGHT side -> open in LEFT corner (so right map stays 100% visible)
  // If hovering on LEFT side -> open in RIGHT corner (so left map stays 100% visible)
  const getCornerDockStyle = (cardWidth = 380) => {
    const isRight = isHoverOnRightSide;
    return {
      top: '14px',
      ...(isRight
        ? { left: '14px', right: 'auto' }
        : { right: '14px', left: 'auto' }),
      maxHeight: isRight && showLegend ? 'calc(100% - 150px)' : 'calc(100% - 28px)',
    };
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

  const selectedSdoData = useMemo(() => {
    if (selectedSdo === 'all') return null;
    return SUB_DIVISIONS.find((s) => s.id === selectedSdo) || null;
  }, [selectedSdo]);

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

      {/* Dynamic Contextual Bar for SDO Mode */}
      {viewMode === 'sdo' && (
        <div className="relative z-10 bg-gradient-to-r from-indigo-50/95 via-white to-blue-50/85 border-b border-indigo-200/90 px-3 py-1.5 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none shadow-2xs">
          <div className="flex items-center gap-1.5 shrink-0 text-indigo-950 font-bold">
            <Landmark className="w-3.5 h-3.5 text-indigo-700" />
            <span className="text-xs font-black">उपविभाग (SDO):</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            <button
              onClick={() => setSelectedSdo('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer ${
                selectedSdo === 'all'
                  ? 'bg-indigo-900 text-white border-indigo-950 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/60'
              }`}
            >
              सर्व ६ उपविभाग
            </button>

            {SUB_DIVISIONS.map((sdo) => {
              const isAct = selectedSdo === sdo.id;
              return (
                <button
                  key={sdo.id}
                  onClick={() => setSelectedSdo(isAct ? 'all' : sdo.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    isAct
                      ? 'text-white border-transparent shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  style={{
                    backgroundColor: isAct ? sdo.border : undefined,
                  }}
                  title={`${sdo.nameMr} • ${sdo.sdoOfficer}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isAct ? '#FFFFFF' : sdo.color }}
                  />
                  <span>{sdo.shortNameMr || sdo.nameMr}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isAct ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sdo.talukas.length} तालुके
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Contextual Bar for Heatmap Mode */}
      {viewMode === 'risk' && (
        <div className="relative z-10 bg-gradient-to-r from-rose-50/95 via-white to-amber-50/85 border-b border-rose-200/90 px-3 py-1.5 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none shadow-2xs">
          <div className="flex items-center gap-1.5 shrink-0 text-rose-950 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-xs font-black">शर्तभंग जोखीम स्तर:</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            <button
              onClick={() => setSelectedRiskLevel('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer ${
                selectedRiskLevel === 'all'
                  ? 'bg-rose-900 text-white border-rose-950 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50/60'
              }`}
            >
              सर्व तालुके ({riskStats.totalViolations.toLocaleString('mr-IN')} प्रकरणे)
            </button>

            <button
              onClick={() => setSelectedRiskLevel(selectedRiskLevel === 'critical' ? 'all' : 'critical')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                selectedRiskLevel === 'critical'
                  ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                  : 'bg-white text-rose-950 border-rose-300 hover:bg-rose-50'
              }`}
            >
              <span>🔴 अती-गंभीर</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${selectedRiskLevel === 'critical' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'}`}>
                {riskStats.critical} तालुके • २५०+
              </span>
            </button>

            <button
              onClick={() => setSelectedRiskLevel(selectedRiskLevel === 'high' ? 'all' : 'high')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                selectedRiskLevel === 'high'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                  : 'bg-white text-orange-950 border-orange-300 hover:bg-orange-50'
              }`}
            >
              <span>🟠 उच्च जोखीम</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${selectedRiskLevel === 'high' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-900'}`}>
                {riskStats.high} तालुके • ५१-२५०
              </span>
            </button>

            <button
              onClick={() => setSelectedRiskLevel(selectedRiskLevel === 'medium' ? 'all' : 'medium')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                selectedRiskLevel === 'medium'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span>🟡 मध्यम</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${selectedRiskLevel === 'medium' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                {riskStats.medium} तालुके • १५-५०
              </span>
            </button>

            <button
              onClick={() => setSelectedRiskLevel(selectedRiskLevel === 'low' ? 'all' : 'low')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                selectedRiskLevel === 'low'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>🟢 कमी / सुरक्षित</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${selectedRiskLevel === 'low' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                {riskStats.low} तालुके • ०-१४
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Layer Visibility Toggles Bar (Clean Light Badges) */}
      <div className="relative z-10 bg-slate-50/80 border-b border-slate-200 px-3 py-1.5 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-700">
          <Layers className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-bold text-slate-800 text-xs">नकाशा स्तर:</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          <button
            onClick={() =>
              setLayers((p) => {
                const nextVal = !p.rivers;
                return { ...p, rivers: nextVal, reservoirs: nextVal };
              })
            }
            className={`px-2.5 py-1 rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
              layers.rivers || layers.reservoirs
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
                    strokeWidth={getTalukaStrokeWidth(taluka)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={getTalukaOpacity(taluka)}
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
                    opacity={getTalukaOpacity(taluka)}
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
                      opacity={getTalukaOpacity(taluka)}
                    />
                  )}

                  {/* Taluka Labels (Clean, High-Contrast Text with Crisp White Halo - Pure Marathi Only) */}
                  {layers.labels && (
                    <g pointerEvents="none" opacity={getTalukaOpacity(taluka)}>
                      {/* Primary Marathi Label */}
                      <text
                        x={taluka.center[0]}
                        y={taluka.center[1] + (viewMode === 'risk' || viewMode === 'sdo' ? -1.8 : 2.0)}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize={isSelected ? '8.8' : isHovered ? '8.4' : '7.4'}
                        fontWeight="900"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="select-none tracking-tight font-black"
                      >
                        {taluka.nameMr}
                      </text>

                      {/* Direct Violation Count Pill in Risk Heatmap Mode */}
                      {viewMode === 'risk' && (() => {
                        const vItem = talukaDataMap.get(taluka.id.toLowerCase());
                        const vCount = vItem ? vItem.liveViolationCount : taluka.shartbhang;
                        const vRisk = getRiskCategory(vCount);
                        return (
                          <g transform={`translate(${taluka.center[0]}, ${taluka.center[1] + 9.6})`}>
                            <rect
                              x="-14"
                              y="-4.2"
                              width="28"
                              height="8.4"
                              rx="4.2"
                              fill={vRisk.stroke}
                              stroke="#FFFFFF"
                              strokeWidth="0.8"
                            />
                            <text
                              x="0"
                              y="1.8"
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="4.5"
                              fontWeight="900"
                              className="select-none font-sans"
                            >
                              {vCount.toLocaleString('mr-IN')}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Direct SDO Tag Pill in SDO Circle Mode */}
                      {viewMode === 'sdo' && (() => {
                        const sdo = getSdoInfo(taluka.sdoId);
                        if (!sdo) return null;
                        return (
                          <g transform={`translate(${taluka.center[0]}, ${taluka.center[1] + 9.6})`}>
                            <rect
                              x="-17"
                              y="-3.8"
                              width="34"
                              height="7.6"
                              rx="3.8"
                              fill="#FFFFFF"
                              stroke={sdo.border}
                              strokeWidth="0.8"
                            />
                            <text
                              x="0"
                              y="1.7"
                              textAnchor="middle"
                              fill={sdo.border}
                              fontSize="3.8"
                              fontWeight="900"
                              className="select-none font-bold"
                            >
                              {sdo.shortNameMr || sdo.nameMr.replace(' उपविभाग', '')} प्रांत
                            </text>
                          </g>
                        );
                      })()}
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

          {/* Layer: Major Rivers & Water Reservoirs (High-Contrast, Prominent Labels with Halos) */}
          {(layers.rivers || layers.reservoirs) && (
            <g id="rivers-layer">
              {/* Rivers Layer */}
              {layers.rivers &&
                (RIVERS_DATA || []).map((river) => (
                  <g
                    key={river.id}
                    className="cursor-pointer"
                    pointerEvents="auto"
                    onMouseEnter={() =>
                      setHoveredPoi({
                        id: river.id,
                        pos: river.labels?.[0]?.pos || [150, 150],
                        nameMr: river.nameMr,
                        badge: 'प्रमुख जीवनदायिनी नदी (River)',
                        description: river.description || 'शेती, सिंचन व उद्योगांसाठी अत्यंत महत्त्वाची जलवाहिनी.',
                        taluka: river.talukas || 'चंद्रपूर जिल्हा',
                      })
                    }
                    onMouseLeave={() => setHoveredPoi(null)}
                  >
                    {/* River Ambient Cyan Glow */}
                    <path
                      d={river.path}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth={(river.width || 1.2) + 1.8}
                      opacity="0.5"
                      strokeLinecap="round"
                    />
                    {/* Main River Stream */}
                    <path
                      d={river.path}
                      fill="none"
                      stroke={river.color || '#0284C7'}
                      strokeWidth={river.width || 1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Prominent River Labels with Crisp White Halo */}
                    {(river.labels || []).map((lbl, lidx) => (
                      <text
                        key={lidx}
                        x={lbl.pos[0]}
                        y={lbl.pos[1]}
                        textAnchor={lbl.anchor || 'middle'}
                        fill="#0284C7"
                        fontSize="5.6"
                        fontWeight="900"
                        fontStyle="italic"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="select-none tracking-tight font-black"
                      >
                        {lbl.text}
                      </text>
                    ))}
                  </g>
                ))}

              {/* Lakes & Water Reservoirs (तलाव व धरणे) */}
              {layers.reservoirs &&
                (RESERVOIRS || []).map((res) => (
                  <g
                    key={res.id}
                    className="cursor-pointer"
                    pointerEvents="auto"
                    onMouseEnter={() =>
                      setHoveredPoi({
                        id: res.id,
                        pos: res.pos,
                        nameMr: res.nameMr,
                        badge: 'प्रमुख जलसाठा / तलाव (Lake & Reservoir)',
                        description: res.description || 'पिण्याच्या व सिंचनाच्या पाण्याचा मुख्य आधार.',
                        taluka: res.taluka || 'चंद्रपूर',
                      })
                    }
                    onMouseLeave={() => setHoveredPoi(null)}
                  >
                    {/* Reservoir Ambient Glow */}
                    <ellipse
                      cx={res.pos[0]}
                      cy={res.pos[1]}
                      rx={res.rx + 1.4}
                      ry={res.ry + 1.2}
                      fill="#38BDF8"
                      fillOpacity="0.4"
                    />
                    {/* Reservoir Water Body */}
                    <ellipse
                      cx={res.pos[0]}
                      cy={res.pos[1]}
                      rx={res.rx}
                      ry={res.ry}
                      fill="#0284C7"
                      fillOpacity="0.85"
                      stroke="#FFFFFF"
                      strokeWidth="0.8"
                    />
                    {/* Water Ripple Ring */}
                    <ellipse
                      cx={res.pos[0]}
                      cy={res.pos[1]}
                      rx={res.rx * 0.55}
                      ry={res.ry * 0.55}
                      fill="none"
                      stroke="#BAE6FD"
                      strokeWidth="0.5"
                      strokeDasharray="1.5,1.5"
                    />
                    {/* Reservoir Label (Bold, High-Contrast White Halo) */}
                    <text
                      x={res.pos[0] + (res.labelOffset?.x || 0)}
                      y={res.pos[1] + (res.labelOffset?.y || (res.ry + 4.5))}
                      textAnchor={res.labelOffset?.anchor || 'middle'}
                      fill="#0369A1"
                      fontSize="5.4"
                      fontWeight="900"
                      stroke="#FFFFFF"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                      className="select-none tracking-tight font-black"
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

        {/* Clean Hover HUD Tooltip (Comprehensive, Fully Readable, Zero Truncation) */}
        {hoveredTaluka && !hoveredPoi && (() => {
          const item = talukaDataMap.get(hoveredTaluka.id.toLowerCase());
          const liveViolations = Number(item ? item.liveViolationCount : (hoveredTaluka.shartbhang || 0));
          const liveParcels = Number(item ? item.liveParcelCount : (hoveredTaluka.total712 || 0));
          const liveArea = Number(item ? item.liveTotalAreaHa : (hoveredTaluka.cultivableHa || 0));
          const liveGovtLand = Number(item ? item.liveDisputeCount : (hoveredTaluka.govtLand || hoveredTaluka.govtEncroached || 0));
          const risk = getRiskCategory(liveViolations);
          const sdo = getSdoInfo(hoveredTaluka.sdoId);
          const isRight = isHoverOnRightSide;

          return (
            <div
              className={`absolute z-40 pointer-events-none transition-all duration-200 ease-out w-[340px] sm:w-[395px] max-w-[calc(100%-28px)] ${
                isRight ? 'slide-in-from-left-3' : 'slide-in-from-right-3'
              }`}
              style={getCornerDockStyle(395)}
            >
              {/* Ultra-luxurious Frosted Glassmorphism Container with map shine-through */}
              <div className="bg-white/70 backdrop-blur-2xl text-slate-900 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 overflow-y-auto max-h-[inherit]">
                {/* Header: Taluka Name + SDO Sub-Division with Translucent Glass Sheen */}
                <div className="bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-sky-500/15 -mx-3.5 -mt-3.5 sm:-mx-4 sm:-mt-4 p-3.5 sm:p-4 rounded-t-2xl border-b border-white/60 backdrop-blur-md mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-900/90 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            तालुका {hoveredTaluka.nameMr}
                          </h3>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 bg-white/75 backdrop-blur-sm border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                            <Landmark className="w-3 h-3 text-indigo-700" />
                            <span>{hoveredTaluka.sdoSubdivision}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50/80 backdrop-blur-sm text-blue-950 border border-blue-200/80 font-bold shrink-0 shadow-2xs whitespace-nowrap">
                      {hoveredTaluka.villagesCount} महसूल गावे
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-semibold mt-2 flex items-center gap-1.5 break-words">
                    <span className="text-slate-500">🏛️</span>
                    <span>{hoveredTaluka.tehsildarOffice}</span>
                  </div>
                </div>

                {/* Mode-Specific Contextual Alert Banner */}
                {viewMode === 'risk' && (
                  <div className={`p-2.5 rounded-xl border mb-2.5 backdrop-blur-sm ${risk.badgeBg} ${risk.badgeText}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="text-sm">{risk.icon}</span>
                        <span>{risk.fullLabelMr}</span>
                      </span>
                      <span className="text-xs font-black font-mono">
                        {liveViolations.toLocaleString('mr-IN')} प्रकरणे
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed break-words font-medium opacity-90">
                      {risk.guidanceMr}
                    </p>
                  </div>
                )}

                {viewMode === 'sdo' && sdo && (
                  <div className="p-2.5 rounded-xl border mb-2.5 bg-indigo-50/80 backdrop-blur-sm border-indigo-200 text-indigo-950">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-indigo-700" />
                        <span>{sdo.nameMr} (SDO Jurisdiction)</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 text-indigo-900 border border-indigo-200">
                        प्रांत कार्यालय
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-indigo-900/90 break-words font-medium">
                      सक्षम अधिकारी: {sdo.sdoOfficer}
                    </p>
                    <p className="text-[10px] text-indigo-800/80 mt-1">
                      या उपविभागातील तालुके: {sdo.talukas.join(', ')}
                    </p>
                  </div>
                )}

                {/* Live Revenue Statistics Grid with Frosted Glass Tiles */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                  <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-200/80 p-2 rounded-xl shadow-2xs">
                    <span className="text-blue-900/80 text-[11px] block font-semibold">नोंदणीकृत ७/१२ भूखंड:</span>
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      {liveParcels.toLocaleString('mr-IN')}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border backdrop-blur-sm shadow-2xs ${viewMode === 'risk' ? risk.badgeBg : 'bg-amber-50/70 border-amber-200/80'}`}>
                    <span className="text-amber-900 text-[11px] block font-bold">शर्तभंग चौकशी:</span>
                    <span className="font-black text-amber-900 text-sm sm:text-base">
                      {liveViolations.toLocaleString('mr-IN')} प्रकरणे
                    </span>
                  </div>
                  <div className="bg-rose-50/70 backdrop-blur-sm border border-rose-200/80 p-2 rounded-xl shadow-2xs">
                    <span className="text-rose-900 text-[11px] block font-semibold">शासकीय जमीन / वाद:</span>
                    <span className="font-black text-rose-800 text-sm sm:text-base">
                      {liveGovtLand.toLocaleString('mr-IN')} गट
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 backdrop-blur-sm border border-emerald-200/80 p-2 rounded-xl shadow-2xs">
                    <span className="text-emerald-900 text-[11px] block font-semibold">एकूण भौगोलिक क्षेत्र:</span>
                    <span className="font-black text-emerald-800 text-sm sm:text-base">
                      {liveArea.toLocaleString('mr-IN', { maximumFractionDigits: 1 })} Ha
                    </span>
                  </div>
                </div>

                {/* Features (Full Text without Truncation) */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/80 mb-2 shadow-2xs">
                  <p className="text-xs text-slate-700 leading-relaxed break-words">
                    <span className="text-slate-900 font-bold">वैशिष्ट्ये: </span>
                    {hoveredTaluka.keyHighlights}
                  </p>
                </div>

                {/* Rivers List */}
                {hoveredTaluka.rivers?.length > 0 && (
                  <div className="text-xs text-sky-900 font-semibold flex items-center gap-1.5 mb-2 px-1 break-words">
                    <Waves className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                    <span className="text-slate-700 font-bold">प्रमुख नद्या:</span>
                    <span className="text-sky-800">{hoveredTaluka.rivers.join(', ')}</span>
                  </div>
                )}

                {/* Action Hint */}
                <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200/60 flex items-center justify-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>क्लिक करून डॅशबोर्ड डेटा फिल्टर करा</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Floating Tooltip for POIs with Smart Placement and Glass Effect */}
        {hoveredPoi && (
          <div
            className={`absolute z-40 pointer-events-none transition-all duration-200 ease-out w-[270px] sm:w-[320px] max-w-[calc(100%-24px)] ${
              isHoverOnRightSide ? 'slide-in-from-left-3' : 'slide-in-from-right-3'
            }`}
            style={getCornerDockStyle(320)}
          >
            <div className="bg-white/75 backdrop-blur-2xl text-slate-900 p-3 sm:p-4 rounded-2xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10">
              <div className="flex items-center gap-2 mb-1.5 font-bold">
                <span className="text-blue-600 text-base">📍</span>
                <span className="text-slate-900 text-sm sm:text-base font-black">{hoveredPoi.nameMr}</span>
              </div>
              <div className="text-xs text-blue-900 font-bold mb-1.5 bg-blue-50/70 border border-blue-200/70 px-2 py-0.5 rounded-md inline-block shadow-2xs">
                {hoveredPoi.badge} {hoveredPoi.taluka ? `• ${hoveredPoi.taluka}` : ''}
              </div>
              {hoveredPoi.description && (
                <p className="text-xs text-slate-700 leading-relaxed font-medium break-words mt-1">
                  {hoveredPoi.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Multi-Mode Reference Legend (संदर्भ सूची) */}
        {showLegend && (
          <div className="absolute bottom-2 left-2 z-30 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl shadow-md max-w-[260px] hidden sm:block text-[11px] text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <span className="font-black text-blue-950 uppercase tracking-wider text-[10px]">
                {viewMode === 'risk'
                  ? 'शर्तभंग जोखीम दर्शक (Risk Scale)'
                  : viewMode === 'sdo'
                  ? '६ उपविभाग संदर्भ (SDO Circles)'
                  : 'संदर्भ सूची (Map Legend)'}
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer font-bold"
                title="बंद करा"
              >
                ✕
              </button>
            </div>

            {/* 1. Risk Mode Legend */}
            {viewMode === 'risk' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-200 border border-rose-700 shrink-0"></span>
                    <span className="font-bold text-rose-950">अती-गंभीर (Critical)</span>
                  </div>
                  <span className="font-mono font-bold text-rose-800">२५०+</span>
                </div>

                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-orange-100 border border-orange-700 shrink-0"></span>
                    <span className="font-bold text-orange-950">उच्च जोखीम (High)</span>
                  </div>
                  <span className="font-mono font-bold text-orange-800">५१-२५०</span>
                </div>

                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-700 shrink-0"></span>
                    <span className="font-bold text-amber-950">मध्यम जोखीम (Medium)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">१५-५०</span>
                </div>

                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-700 shrink-0"></span>
                    <span className="font-bold text-emerald-950">कमी / सुरक्षित (Low)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800">०-१४</span>
                </div>

                <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>जिल्हा एकूण:</span>
                  <span className="font-bold text-rose-700 font-mono">
                    {riskStats.totalViolations.toLocaleString('mr-IN')} प्रकरणे
                  </span>
                </div>
              </div>
            )}

            {/* 2. SDO Mode Legend */}
            {viewMode === 'sdo' && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                {SUB_DIVISIONS.map((sdo) => (
                  <button
                    key={sdo.id}
                    onClick={() => setSelectedSdo(selectedSdo === sdo.id ? 'all' : sdo.id)}
                    className="flex items-center gap-1.5 text-left hover:bg-slate-50 rounded p-0.5 cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sdo.color }}
                    />
                    <span className={`font-bold ${selectedSdo === sdo.id ? 'text-indigo-950 underline' : 'text-slate-700'}`}>
                      {sdo.shortNameMr}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 3. Administrative Mode Legend */}
            {viewMode === 'admin' && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-slate-700 text-[10px]">
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
            )}
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
                  {Number(activeTalukaProfile.liveParcelCount || activeTalukaProfile.total712).toLocaleString('mr-IN')}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                <span className="text-[10px] text-amber-800 block font-bold">शर्तभंग चौकशी</span>
                <span className="font-black text-amber-700 text-sm">
                  {Number(activeTalukaProfile.liveViolationCount || activeTalukaProfile.shartbhang).toLocaleString('mr-IN')}
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

      {/* Selected SDO Jurisdiction Inspector Drawer (When SDO is selected and no single taluka selected) */}
      {!activeTalukaProfile && selectedSdoData && (
        <div className="relative z-20 bg-gradient-to-r from-indigo-50/95 via-white to-slate-50 border-t border-indigo-200 p-3 sm:p-4 text-slate-900">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                  निवडलेला उपविभाग (SDO Circle)
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{selectedSdoData.nameMr}</span>
                </h3>
              </div>
              <p className="text-xs text-indigo-950 font-semibold leading-snug">
                <span className="text-slate-600">सक्षम अधिकारी: </span>
                {selectedSdoData.sdoOfficer}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-bold text-slate-700">समाविष्ट तालुके: </span>
                {selectedSdoData.talukas.join(', ')}
              </p>
            </div>

            {/* Micro Stats for SDO */}
            {(() => {
              const stats = sdoStats.get(selectedSdoData.id) || {
                parcels: 0,
                violations: 0,
                area: 0,
                villages: 0,
              };
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0 w-full lg:w-auto">
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-medium">महसूल गावे</span>
                    <span className="font-black text-slate-900 text-sm">
                      {stats.villages} गावे
                    </span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                    <span className="text-[10px] text-blue-900 block font-medium">नोंदणीकृत ७/१२</span>
                    <span className="font-black text-blue-950 text-sm">
                      {stats.parcels.toLocaleString('mr-IN')}
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                    <span className="text-[10px] text-amber-800 block font-bold">शर्तभंग प्रकरणे</span>
                    <span className="font-black text-amber-700 text-sm">
                      {stats.violations.toLocaleString('mr-IN')}
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-center shadow-2xs">
                    <span className="text-[10px] text-emerald-800 block font-medium">एकूण क्षेत्र</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {Math.round(stats.area).toLocaleString('mr-IN')} Ha
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setSelectedSdo('all')}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1 transition cursor-pointer"
              >
                सर्व उपविभाग दाखवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
