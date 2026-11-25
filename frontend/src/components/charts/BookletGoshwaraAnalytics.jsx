'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  LandPlot,
  Scale,
  Building2,
  FileSpreadsheet,
  Activity,
  AlertOctagon,
  Percent,
  CheckCircle,
  Landmark,
  Trees,
  ShieldAlert,
  Users,
  FileText,
  ArrowRight,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { formatTalukaName, formatVillageName, formatScopeText } from '../../lib/villageUtils';
import { getBookletKpiSpecs } from '../../lib/booklet18Config';
import MetricCard from '../MetricCard';

// Accessible, distinctive color scheme
const TENURE_PALETTE = {
  class1: { color: '#2563eb', labelMr: 'भोगवटदार वर्ग १', labelEn: 'Class-1 Freehold' },
  class2: { color: '#059669', labelMr: 'भोगवटदार वर्ग २', labelEn: 'Class-2 Restricted' },
  sarkar: { color: '#475569', labelMr: 'शासन / इतर जमिनी', labelEn: 'Govt / Other Lands' },
  companyPermit: { color: '#059669', labelMr: 'कंपनी परवानगी घेतलेली', labelEn: 'Company With Permit' },
  companyNoPermit: { color: '#e11d48', labelMr: 'कंपनी विनापरवानगी', labelEn: 'Company Without Permit' },
  other: { color: '#64748b', labelMr: 'इतर जमिनी', labelEn: 'Other Holdings' }
};

const ICON_MAP = {
  Landmark,
  LandPlot,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  Scale,
  FileText,
  Trees,
  AlertOctagon
};

export default function BookletGoshwaraAnalytics({
  selectedCatId = 1,
  category = null,
  goshDef = null,
  talukaRows = [],
  villageRows = [],
  districtRows = [],
  categoryRollupRows = [],
  activeTier = 'all',
  taluka = 'all',
  village = 'all',
  isMarathi = true,
  parcels = [],
  isDetailedView = false,
  activeScope = '',
  dynamicBookletKpis = null,
  selectedKpiFilter = 'all',
  onKpiFilterSelect = null,
  loading = false,
}) {
  const metricType = 'count';
  const [chartStyle, setChartStyle] = useState('donut'); // 'donut' | 'pie'
  const [pieMode, setPieMode] = useState('tenure'); // 'tenure' | 'compliance'
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [barSortMode, setBarSortMode] = useState('breach'); // 'breach' | 'riskPct' | 'total' | 'name'

  const isCompanyBooklet = Number(selectedCatId) === 18 || goshDef?.type === 'COMPANY_HOLDING';

  // Statutory Revenue Legal Basis lookup for each audit item
  const getAuditLegalTag = (key, catId) => {
    const k = (key || '').toLowerCase();
    if (k.includes('del')) return isMarathi ? 'MLRC कलम ५०/५३ शासन नोंद संरक्षण' : 'Sec 50/53 Govt Name Protection';
    if (k.includes('noother')) return isMarathi ? '७/१२ इतर अधिकार रकाना नोंद' : 'Record of Rights Sec 148';
    if (k.includes('conv')) return isMarathi ? 'कलम २९/४४ वर्ग रूपांतरण पडताळणी' : 'Sec 29/44 Tenure Conversion';
    if (k.includes('shart') || k.includes('breach')) return isMarathi ? 'कलम ४३ कुळ कायदा शर्तभंग' : 'Sec 43 Tenancy Breach';
    if (k.includes('tribal')) return isMarathi ? 'कलम ३६/३६अ आदिवासी संरक्षण' : 'Sec 36/36A Tribal Land Protection';
    if (k.includes('encroach')) return isMarathi ? 'कलम ५० अतिक्रमण निष्कासन' : 'Sec 50 Encroachment Removal';
    if (k.includes('forest')) return isMarathi ? 'भारतीय वन अधिनियम १९२७' : 'Indian Forest Act 1927';
    if (k.includes('allot')) return isMarathi ? 'भूमिहीन प्रदान शर्ती नियम' : 'Landless Grant Rules';
    if (k.includes('gurcharan')) return isMarathi ? 'ग्रामपंचायत गुरचरण संरक्षण नियम' : 'Gurcharan Grazing Rules';
    return isMarathi ? 'वैधानिक महसूल तपासणी निकष' : 'Statutory Revenue Criterion';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHoveredSlice(null);
  }, [selectedCatId, taluka, village, pieMode]);

  // Compute base rows corresponding strictly to the user's active filter & tier
  const baseRows = useMemo(() => {
    const isSingleVillage = village && village !== 'all' && village !== 'सर्व गावे';
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके' && !isSingleVillage;

    if (isSingleVillage) {
      const targetV = String(village).toLowerCase().trim();
      const matched = (villageRows || []).filter(r => {
        const vName = (r.villageName || '').toLowerCase().trim();
        return vName === targetV || vName.includes(targetV) || targetV.includes(vName);
      });
      if (matched.length > 0) return matched;

      // Fallback from categoryRollupRows
      const rollupMatched = (categoryRollupRows || []).filter(r => {
        const vName = (r.villageName || '').toLowerCase().trim();
        return vName === targetV || vName.includes(targetV) || targetV.includes(vName);
      });
      if (rollupMatched.length > 0) return rollupMatched;

      if (villageRows && villageRows.length === 1) return villageRows;
      return villageRows || [];
    }

    if (isSingleTaluka) {
      const targetT = String(taluka).toLowerCase().trim();
      const matched = (talukaRows || []).filter(r => {
        const tName = (r.taluka || '').toLowerCase().trim();
        return tName === targetT || tName.includes(targetT) || targetT.includes(tName);
      });
      if (matched.length > 0) return matched;
      if (villageRows && villageRows.length > 0) return villageRows;
      return talukaRows || [];
    }

    // Whole District
    if (districtRows && districtRows.length > 0 && Number(districtRows[0]?.total712Count || 0) > 0) {
      return districtRows;
    }
    if (talukaRows && talukaRows.length > 0) {
      return talukaRows;
    }
    return categoryRollupRows || [];
  }, [village, taluka, villageRows, talukaRows, districtRows, categoryRollupRows]);

  // Exact, non-duplicating total counts and metric calculations
  const analyticsData = useMemo(() => {
    let totalSurveys = 0;
    let totalArea = 0;

    if (baseRows === districtRows && districtRows.length > 0) {
      totalSurveys = Number(districtRows[0].total712Count || 0);
      totalArea = Number(districtRows[0].totalArea || districtRows[0].totalAreaHa || 0);
    } else {
      totalSurveys = baseRows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
      totalArea = baseRows.reduce((a, b) => a + Number(b.totalArea || b.totalAreaHa || 0), 0);
    }

    // Fallback if data is currently hydrating
    if (totalSurveys === 0 && parcels && parcels.length > 0) {
      totalSurveys = parcels.length;
      totalArea = parcels.reduce((a, b) => a + Number(b.totalAreaHa || 0), 0);
    }

    // 1. Tenurial Composition (Pure Mutually Exclusive Non-Overlapping Partition)
    let c1Count = 0;
    let c1Area = 0;
    let c2Count = 0;
    let c2Area = 0;
    let companyPermittedCount = 0;
    let companyPermittedArea = 0;
    let companyUnpermittedCount = 0;
    let companyUnpermittedArea = 0;

    baseRows.forEach(r => {
      c1Count += Number(r.c1Count || 0);
      c1Area += Number(r.c1Area || 0);
      c2Count += Number(r.c2Count || 0);
      c2Area += Number(r.c2Area || 0);
      companyPermittedCount += Number(r.companyPermittedCount || 0);
      companyPermittedArea += Number(r.companyPermittedArea || 0);
      companyUnpermittedCount += Number(r.companyUnpermittedCount || 0);
      companyUnpermittedArea += Number(r.companyUnpermittedArea || 0);
    });

    c1Area = Number(c1Area.toFixed(2));
    c2Area = Number(c2Area.toFixed(2));
    companyPermittedArea = Number(companyPermittedArea.toFixed(2));
    companyUnpermittedArea = Number(companyUnpermittedArea.toFixed(2));

    // Other/Residual holdings (Govt/Forest/Other) to guarantee exact 100% total
    const otherCount = Math.max(0, totalSurveys - (c1Count + c2Count));
    const otherArea = Math.max(0, Number((totalArea - (c1Area + c2Area)).toFixed(2)));

    // Booklet-Specific Mutually Exclusive Composition Slices for Pie/Donut Chart
    let tenureSlices = [];

    if (selectedCatId === 1) {
      // 1) Government Land
      let forestCount = 0, forestArea = 0;
      let encroachedCount = 0, encroachedArea = 0;
      let allottedCount = 0, allottedArea = 0;

      baseRows.forEach(r => {
        forestCount += Number(r.forestCount || 0);
        forestArea += Number(r.forestArea || 0);
        encroachedCount += Number(r.encroachedCount || 0);
        encroachedArea += Number(r.encroachedArea || 0);
        allottedCount += Number(r.allottedCount || 0);
        allottedArea += Number(r.allottedArea || 0);
      });

      if (forestCount === 0 && encroachedCount === 0 && parcels && parcels.length > 0) {
        forestCount = parcels.filter(p => p.auditPoints?.point_13 === 'आहे' || p.tenureClass === 'FOREST_JANGAL').length;
        forestArea = parcels.filter(p => p.auditPoints?.point_13 === 'आहे' || p.tenureClass === 'FOREST_JANGAL').reduce((acc, p) => acc + (parseFloat(p.totalAreaHa) || 0), 0);
        encroachedCount = parcels.filter(p => p.auditPoints?.point_15 === 'आहे' || p.metadata?.flags?.isEncroached).length;
        encroachedArea = parcels.filter(p => p.auditPoints?.point_15 === 'आहे' || p.metadata?.flags?.isEncroached).reduce((acc, p) => acc + (parseFloat(p.totalAreaHa) || 0), 0);
        allottedCount = parcels.filter(p => p.auditPoints?.point_14 === 'होय' || p.metadata?.flags?.isCorpAllot).length;
        allottedArea = parcels.filter(p => p.auditPoints?.point_14 === 'होय' || p.metadata?.flags?.isCorpAllot).reduce((acc, p) => acc + (parseFloat(p.totalAreaHa) || 0), 0);
      }

      const otherGovtCount = Math.max(0, totalSurveys - (forestCount + encroachedCount + allottedCount));
      const otherGovtArea = Math.max(0, Number((totalArea - (forestArea + encroachedArea + allottedArea)).toFixed(2)));

      tenureSlices = [
        {
          key: 'forest',
          name: isMarathi ? 'वन / झुडपी जंगल' : 'Forest / Scrub Lands',
          count: forestCount,
          area: Number(forestArea.toFixed(2)),
          value: metricType === 'area' ? Number(forestArea.toFixed(2)) : forestCount,
          color: '#059669',
          pct: totalSurveys > 0 ? Number(((forestCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((forestArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'encroached',
          name: isMarathi ? 'अतिक्रमण जमिनी' : 'Encroached Lands',
          count: encroachedCount,
          area: Number(encroachedArea.toFixed(2)),
          value: metricType === 'area' ? Number(encroachedArea.toFixed(2)) : encroachedCount,
          color: '#e11d48',
          pct: totalSurveys > 0 ? Number(((encroachedCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((encroachedArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'allotted',
          name: isMarathi ? 'वाटप झालेल्या जमिनी' : 'Allotted Lands',
          count: allottedCount,
          area: Number(allottedArea.toFixed(2)),
          value: metricType === 'area' ? Number(allottedArea.toFixed(2)) : allottedCount,
          color: '#4f46e5',
          pct: totalSurveys > 0 ? Number(((allottedCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((allottedArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'otherGovt',
          name: isMarathi ? 'गायरान / इतर शासकीय' : 'Gairan / Other Govt',
          count: otherGovtCount,
          area: otherGovtArea,
          value: metricType === 'area' ? otherGovtArea : otherGovtCount,
          color: '#2563eb',
          pct: totalSurveys > 0 ? Number(((otherGovtCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((otherGovtArea / totalArea) * 100).toFixed(1)) : 0
        }
      ].filter(s => s.value > 0);
    } else if (selectedCatId === 7) {
      // 7) DP & Gurcharan
      const gurcharanCount = c2Count || 0;
      const gurcharanArea = c2Area || 0;
      const authorityCount = c1Count || 0;
      const authorityArea = c1Area || 0;
      const resCount = Math.max(0, totalSurveys - (gurcharanCount + authorityCount));
      const resArea = Math.max(0, Number((totalArea - (gurcharanArea + authorityArea)).toFixed(2)));

      tenureSlices = [
        {
          key: 'gurcharan',
          name: isMarathi ? 'ग्रामपंचायत गुरचरण / चराई' : 'GP Grazing Lands',
          count: gurcharanCount,
          area: Number(gurcharanArea.toFixed(2)),
          value: metricType === 'area' ? Number(gurcharanArea.toFixed(2)) : gurcharanCount,
          color: '#059669',
          pct: totalSurveys > 0 ? Number(((gurcharanCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((gurcharanArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'authority',
          name: isMarathi ? 'प्राधिकरण / मनपा आरक्षण' : 'Authority / DP Reserved',
          count: authorityCount,
          area: Number(authorityArea.toFixed(2)),
          value: metricType === 'area' ? Number(authorityArea.toFixed(2)) : authorityCount,
          color: '#4f46e5',
          pct: totalSurveys > 0 ? Number(((authorityCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((authorityArea / totalArea) * 100).toFixed(1)) : 0
        },
        ...(resCount > 0 ? [{
          key: 'other',
          name: isMarathi ? 'इतर सार्वजनिक प्रयोजन' : 'Other Public Use',
          count: resCount,
          area: resArea,
          value: metricType === 'area' ? resArea : resCount,
          color: '#64748b',
          pct: totalSurveys > 0 ? Number(((resCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((resArea / totalArea) * 100).toFixed(1)) : 0
        }] : [])
      ].filter(s => s.value > 0);
    } else if (selectedCatId === 9) {
      // 9) Tribal Lands (Mutually Exclusive Tenure Partition: Class 1, Class 2 Protected, Other)
      tenureSlices = [
        {
          key: 'class1',
          name: isMarathi ? 'आदिवासी वर्ग १' : 'Tribal Class-1',
          count: c1Count,
          area: c1Area,
          value: metricType === 'area' ? c1Area : c1Count,
          color: '#2563eb',
          pct: totalSurveys > 0 ? Number(((c1Count / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((c1Area / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'class2',
          name: isMarathi ? 'आदिवासी वर्ग २ (संरक्षित)' : 'Tribal Class-2 (Protected)',
          count: c2Count,
          area: c2Area,
          value: metricType === 'area' ? c2Area : c2Count,
          color: '#059669',
          pct: totalSurveys > 0 ? Number(((c2Count / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((c2Area / totalArea) * 100).toFixed(1)) : 0
        },
        ...(otherCount > 0 ? [{
          key: 'other',
          name: isMarathi ? 'इतर नोंदणीकृत' : 'Other Registered',
          count: otherCount,
          area: otherArea,
          value: metricType === 'area' ? otherArea : otherCount,
          color: '#64748b',
          pct: totalSurveys > 0 ? Number(((otherCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((otherArea / totalArea) * 100).toFixed(1)) : 0
        }] : [])
      ].filter(s => s.value > 0);
    } else if (selectedCatId === 18) {
      // 18) Company Holdings
      tenureSlices = [
        {
          key: 'companyPermit',
          name: isMarathi ? 'कंपनी परवानगी घेतलेली' : 'Company With Permit',
          count: companyPermittedCount,
          area: companyPermittedArea,
          value: metricType === 'area' ? companyPermittedArea : companyPermittedCount,
          color: '#059669',
          pct: totalSurveys > 0 ? Number(((companyPermittedCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((companyPermittedArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'companyNoPermit',
          name: isMarathi ? 'कंपनी विनापरवानगी' : 'Company Without Permit',
          count: companyUnpermittedCount,
          area: companyUnpermittedArea,
          value: metricType === 'area' ? companyUnpermittedArea : companyUnpermittedCount,
          color: '#e11d48',
          pct: totalSurveys > 0 ? Number(((companyUnpermittedCount / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((companyUnpermittedArea / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'other',
          name: isMarathi ? 'इतर नोंदणीकृत जमिनी' : 'Other Registered Lands',
          count: Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)),
          area: Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2))),
          value: metricType === 'area'
            ? Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2)))
            : Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)),
          color: '#64748b',
          pct: totalSurveys > 0 ? Number(((Math.max(0, totalSurveys - (companyPermittedCount + companyUnpermittedCount)) / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((Math.max(0, Number((totalArea - (companyPermittedArea + companyUnpermittedArea)).toFixed(2))) / totalArea) * 100).toFixed(1)) : 0
        }
      ].filter(s => s.value > 0);
    } else {
      // Standard: Booklets 2-6, 8, 10-17
      tenureSlices = [
        {
          key: 'class1',
          name: isMarathi ? 'भोगवटदार वर्ग १' : 'Class-1 Freehold',
          count: c1Count,
          area: c1Area,
          value: metricType === 'area' ? c1Area : c1Count,
          color: '#2563eb',
          pct: totalSurveys > 0 ? Number(((c1Count / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((c1Area / totalArea) * 100).toFixed(1)) : 0
        },
        {
          key: 'class2',
          name: isMarathi ? 'भोगवटदार वर्ग २' : 'Class-2 Restricted',
          count: c2Count,
          area: c2Area,
          value: metricType === 'area' ? c2Area : c2Count,
          color: '#059669',
          pct: totalSurveys > 0 ? Number(((c2Count / totalSurveys) * 100).toFixed(1)) : 0,
          areaPct: totalArea > 0 ? Number(((c2Area / totalArea) * 100).toFixed(1)) : 0
        },
        ...(otherCount > 0 || otherArea > 0
          ? [{
              key: 'sarkar',
              name: isMarathi ? 'शासन / इतर जमिनी' : 'Govt / Other Lands',
              count: otherCount,
              area: otherArea,
              value: metricType === 'area' ? otherArea : otherCount,
              color: '#475569',
              pct: totalSurveys > 0 ? Number(((otherCount / totalSurveys) * 100).toFixed(1)) : 0,
              areaPct: totalArea > 0 ? Number(((otherArea / totalArea) * 100).toFixed(1)) : 0
            }]
          : [])
      ].filter(s => s.value > 0);
    }

    // 2. Statutory Audit Findings & Breaches Checklist Items (Specific to this Booklet)
    const statutoryAuditItems = (goshDef?.superHeaders || [])
      .map(sh => {
        let count = 0;
        let area = 0;
        baseRows.forEach(r => {
          count += Number(r[sh.countKey] || 0);
          area += Number(r[sh.areaKey] || 0);
        });
        area = Number(area.toFixed(2));

        const countPct = totalSurveys > 0 ? Number(((count / totalSurveys) * 100).toFixed(1)) : 0;
        const areaPct = totalArea > 0 ? Number(((area / totalArea) * 100).toFixed(1)) : 0;

        // Categorize severity
        const k = (sh.countKey || '').toLowerCase();
        const isBreach = k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal');
        const isWarning = k.includes('noother') || k.includes('unpermitted');

        return {
          key: sh.countKey,
          label: sh.label,
          count,
          area,
          countPct,
          areaPct,
          isBreach,
          isWarning,
          colorClass: sh.colorClass
        };
      })
      // Only include specific statutory violation/audit columns (exclude base Class 1 / Class 2 counts which belong in the composition pie)
      .filter(item => {
        if (!isCompanyBooklet && (item.key === 'c1Count' || item.key === 'c2Count')) return false;
        return true;
      });

    // Compute overall condition breach / severe violation totals
    let totalBreachCount = 0;
    let totalBreachArea = 0;

    statutoryAuditItems.forEach(item => {
      if (item.isBreach) {
        totalBreachCount = Math.max(totalBreachCount, item.count);
        totalBreachArea = Math.max(totalBreachArea, item.area);
      }
    });

    const compliantCount = Math.max(0, totalSurveys - totalBreachCount);
    const compliantPct = totalSurveys > 0 ? Number(((compliantCount / totalSurveys) * 100).toFixed(1)) : 0;
    const breachPct = totalSurveys > 0 ? Number(((totalBreachCount / totalSurveys) * 100).toFixed(1)) : 0;

    // Alternative Pie: Compliance Status (Compliant vs Flagged)
    const complianceSlices = [
      {
        key: 'compliant',
        name: isMarathi ? 'नियमित नोंदी' : 'Compliant Holdings',
        count: compliantCount,
        area: Number(Math.max(0, totalArea - totalBreachArea).toFixed(2)),
        value: metricType === 'area' ? Number(Math.max(0, totalArea - totalBreachArea).toFixed(2)) : compliantCount,
        color: '#059669',
        pct: compliantPct,
        areaPct: totalArea > 0 ? Number((((totalArea - totalBreachArea) / totalArea) * 100).toFixed(1)) : 100
      },
      {
        key: 'breach',
        name: isMarathi ? 'शर्तभंग / संशयित बाबी' : 'Breach / Inquiries',
        count: totalBreachCount,
        area: Number(totalBreachArea.toFixed(2)),
        value: metricType === 'area' ? Number(totalBreachArea.toFixed(2)) : totalBreachCount,
        color: '#e11d48',
        pct: breachPct,
        areaPct: totalArea > 0 ? Number(((totalBreachArea / totalArea) * 100).toFixed(1)) : 0
      }
    ].filter(s => s.value > 0);

    return {
      totalSurveys,
      totalArea: Number(totalArea.toFixed(2)),
      c1Count,
      c1Area,
      c2Count,
      c2Area,
      otherCount,
      otherArea,
      tenureSlices,
      complianceSlices,
      statutoryAuditItems,
      totalBreachCount,
      totalBreachArea: Number(totalBreachArea.toFixed(2)),
      compliantCount,
      compliantPct,
      breachPct
    };
  }, [baseRows, districtRows, parcels, selectedCatId, goshDef, isCompanyBooklet, metricType, isMarathi]);

  // Selected Pie Slices based on active toggle (Tenure vs Compliance)
  const activePieSlices = useMemo(() => {
    return pieMode === 'tenure' ? analyticsData.tenureSlices : analyticsData.complianceSlices;
  }, [pieMode, analyticsData.tenureSlices, analyticsData.complianceSlices]);

  // Compliant statutory items count for graphical summary badge
  const compliantAuditItems = useMemo(() => {
    return (analyticsData.statutoryAuditItems || [])
      .filter(item => item.count === 0);
  }, [analyticsData.statutoryAuditItems]);

  const formatStatutoryLabel = (label = '', isMr = true) => {
    if (!isMr) {
      return label
        .replace(/Illegal\s*/gi, '')
        .replace(/Holdings\s*/gi, '')
        .replace(/Lands\s*/gi, '')
        .trim();
    }
    return label
      .replace(/^अवैधरित्या\s*/, '')
      .replace(/झालेल्या\s*जमिनी$/, '')
      .replace(/झालेले$/, '')
      .replace(/केलेल्या\s*जमिनी$/, '')
      .replace(/जमिनी$/, '')
      .trim();
  };

  const statutoryChartData = useMemo(() => {
    const items = (analyticsData.statutoryAuditItems || []).map(item => {
      const short = formatStatutoryLabel(item.label, isMarathi);
      const count = Number(item.count || 0);
      const pct = item.countPct || 0;
      const displayValue = count > 0 
        ? `${count.toLocaleString('en-IN')} ${isMarathi ? 'गट' : 'p.'} (${pct}%)` 
        : (isMarathi ? '० (निर्दोष)' : '0 (clean)');
      return {
        fullName: item.label,
        shortName: short.length > 18 ? short.slice(0, 17) + '…' : short,
        legalTag: getAuditLegalTag(item.key, selectedCatId),
        count,
        area: item.area || 0,
        pct,
        isBreach: item.isBreach,
        isWarning: item.isWarning,
        displayValue
      };
    });

    return items.sort((a, b) => b.count - a.count || b.pct - a.pct);
  }, [analyticsData.statutoryAuditItems, isMarathi, selectedCatId]);

  // Regional Comparison Bar Chart Data with Intelligent Sorting
  const comparisonBarData = useMemo(() => {
    const isSingleTaluka = taluka && taluka !== 'all' && taluka !== 'सर्व तालुके';
    let list = [];

    if (isSingleTaluka && villageRows && villageRows.length > 0) {
      list = villageRows.map(v => {
        const totCnt = Number(v.total712Count || 0);
        const totAr = Number(Number(v.totalArea || v.totalAreaHa || 0).toFixed(2));
        let brCnt = 0;
        let brAr = 0;
        (goshDef?.superHeaders || []).forEach(sh => {
          const k = (sh.countKey || '').toLowerCase();
          if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal')) {
            brCnt = Math.max(brCnt, Number(v[sh.countKey] || 0));
            brAr = Math.max(brAr, Number(v[sh.areaKey] || 0));
          }
        });
        const compCnt = Math.max(0, totCnt - brCnt);
        const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));
        const breachPct = totCnt > 0 ? Number(((brCnt / totCnt) * 100).toFixed(1)) : 0;

        return {
          name: formatVillageName(v.villageName, isMarathi),
          rawVillage: v.villageName,
          total: totCnt,
          totalArea: totAr,
          compliant: compCnt,
          compliantArea: compAr,
          breach: brCnt,
          breachArea: Number(brAr.toFixed(2)),
          breachPct
        };
      }).filter(d => d.total > 0);
    } else if (talukaRows && talukaRows.length > 0) {
      list = talukaRows.map(t => {
        const rawName = (t.taluka || t.villageName || '')
          .replace(/\s*\((?:संपूर्ण|Whole|All)[^)]*\)/gi, '')
          .trim();
        const dispName = formatTalukaName(rawName, isMarathi);
        const totCnt = Number(t.total712Count || 0);
        const totAr = Number(Number(t.totalArea || t.totalAreaHa || 0).toFixed(2));
        let brCnt = 0;
        let brAr = 0;
        (goshDef?.superHeaders || []).forEach(sh => {
          const k = (sh.countKey || '').toLowerCase();
          if (k.includes('conv') || k.includes('shart') || k.includes('breach') || k.includes('del') || k.includes('unauthorized') || k.includes('tribal')) {
            brCnt = Math.max(brCnt, Number(t[sh.countKey] || 0));
            brAr = Math.max(brAr, Number(t[sh.areaKey] || 0));
          }
        });
        const compCnt = Math.max(0, totCnt - brCnt);
        const compAr = Math.max(0, Number((totAr - brAr).toFixed(2)));
        const breachPct = totCnt > 0 ? Number(((brCnt / totCnt) * 100).toFixed(1)) : 0;

        return {
          name: dispName,
          rawTaluka: rawName,
          total: totCnt,
          totalArea: totAr,
          compliant: compCnt,
          compliantArea: compAr,
          breach: brCnt,
          breachArea: Number(brAr.toFixed(2)),
          breachPct
        };
      }).filter(d => d.total > 0);
    }

    if (barSortMode === 'breach') {
      list.sort((a, b) => b.breach - a.breach || b.breachPct - a.breachPct || b.total - a.total);
    } else if (barSortMode === 'riskPct') {
      list.sort((a, b) => b.breachPct - a.breachPct || b.breach - a.breach);
    } else if (barSortMode === 'total') {
      list.sort((a, b) => b.total - a.total);
    } else if (barSortMode === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, isMarathi ? 'mr' : 'en'));
    }

    return list.slice(0, 16);
  }, [taluka, villageRows, talukaRows, goshDef, isMarathi, barSortMode]);

  // Executive Hotspot Insights computed from the comparison data
  const hotspotInsights = useMemo(() => {
    const listWithBreach = comparisonBarData.filter(d => d.breach > 0);
    const totalBreaches = listWithBreach.reduce((acc, d) => acc + d.breach, 0);
    const top3 = listWithBreach.slice(0, 3);
    const top3Sum = top3.reduce((acc, d) => acc + d.breach, 0);
    const top3Pct = totalBreaches > 0 ? Math.round((top3Sum / totalBreaches) * 100) : 0;

    return {
      totalBreaches,
      top3,
      top3Pct,
      hasHotspots: top3.length > 0,
      hotspotCount: listWithBreach.length
    };
  }, [comparisonBarData]);

  // Active slice for dynamic center display in Donut mode
  const currentHoveredItem = hoveredSlice !== null ? activePieSlices[hoveredSlice] : null;

  // Dynamic 5 KPI cards matching the exact statutory headers of this booklet
  const bookletKpiCards = useMemo(() => {
    const specs = getBookletKpiSpecs(selectedCatId, isMarathi);
    return specs.map((spec, sIdx) => {
      let count = 0;
      let area = 0;
      if (spec.key === 'all') {
        count = analyticsData.totalSurveys;
        area = analyticsData.totalArea;
      } else {
        baseRows.forEach(r => {
          count += Number(r[spec.countKey] || 0);
          area += Number(r[spec.areaKey] || 0);
        });
        if (count === 0 && parcels && parcels.length > 0 && spec.filterPredicate) {
          const matched = parcels.filter(spec.filterPredicate);
          count = matched.length;
          area = matched.reduce((acc, p) => acc + (parseFloat(p.totalAreaHa) || 0), 0);
        }
      }
      area = Number(area.toFixed(2));
      const pct = analyticsData.totalSurveys > 0 ? Number(((count / analyticsData.totalSurveys) * 100).toFixed(1)) : 0;
      const areaPct = analyticsData.totalArea > 0 ? Number(((area / analyticsData.totalArea) * 100).toFixed(1)) : 0;
      const IconCmp = ICON_MAP[spec.icon] || Layers;

      return {
        ...spec,
        count,
        area,
        pct,
        areaPct,
        IconCmp,
        isFirst: sIdx === 0
      };
    });
  }, [selectedCatId, isMarathi, analyticsData.totalSurveys, analyticsData.totalArea, baseRows, parcels]);

  // Graphical Tooltip for Statutory Audit Horizontal Bar Chart
  const CustomStatutoryTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-white/20 text-xs backdrop-blur-md min-w-[220px] space-y-1.5 z-50">
        <div className="border-b border-white/15 pb-1.5">
          <span className="font-bold text-xs text-white block leading-snug">{data.fullName}</span>
          <span className="text-[10px] font-medium text-indigo-300 block mt-0.5">{data.legalTag}</span>
        </div>
        <div className="space-y-1 text-[11px] font-mono">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-sans">{isMarathi ? 'अभिलेख संख्या:' : 'Holdings:'}</span>
            <span className={clsx('font-bold', data.count > 0 ? 'text-rose-400' : 'text-emerald-400')}>
              {data.count.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'parcels'} ({data.pct}%)
            </span>
          </div>
          {data.area > 0 && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-sans">{isMarathi ? 'बाधित क्षेत्र:' : 'Affected Area:'}</span>
              <span className="font-bold text-amber-300">{data.area} Ha</span>
            </div>
          )}
        </div>
        <div className="pt-1 border-t border-white/10 text-[10px] font-semibold">
          {data.count > 0 ? (
            <span className="text-rose-300 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{isMarathi ? 'शर्तभंग / तपासणी आवश्यक' : 'Breach / Inquiry required'}</span>
            </span>
          ) : (
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{isMarathi ? '१००% नियमानुकूल (निर्दोष)' : '100% Compliant'}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  // Executive Tooltip for Regional Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;
    const total = data.total || ((data.compliant || 0) + (data.breach || 0));
    const compPct = total > 0 ? (((data.compliant || 0) / total) * 100).toFixed(1) : 100;
    const brPct = data.breachPct !== undefined ? data.breachPct : (total > 0 ? (((data.breach || 0) / total) * 100).toFixed(1) : 0);

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-white/20 text-xs backdrop-blur-md min-w-[220px] space-y-2 z-50">
        <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
          <span className="font-black text-sm text-white">{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
            {total.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'parcels'}
          </span>
        </div>
        <div className="space-y-1.5 font-medium">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isMarathi ? 'नियमित नोंदी:' : 'Compliant:'}</span>
            </span>
            <span className="font-mono font-bold">
              {data.compliant.toLocaleString('en-IN')} ({compPct}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-rose-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{isMarathi ? 'शर्तभंग/तपासणी:' : 'Breach/Inquiry:'}</span>
            </span>
            <span className="font-mono font-bold">
              {data.breach.toLocaleString('en-IN')} ({brPct}%)
            </span>
          </div>
          {data.totalArea > 0 && (
            <div className="flex items-center justify-between text-indigo-300 text-[10px] pt-0.5">
              <span>{isMarathi ? 'एकूण क्षेत्र:' : 'Total Area:'}</span>
              <span className="font-mono font-bold">{data.totalArea} Ha</span>
            </div>
          )}
        </div>
        <div className="pt-1.5 border-t border-white/10 text-[10px] font-semibold">
          {data.breach > 0 ? (
            <span className="text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isMarathi ? 'कारणे दाखवा नोटीस व सुनावणी आवश्यक' : 'Inquiry hearing required'}</span>
            </span>
          ) : (
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isMarathi ? '१००% नियमानुकूल व निर्वेध अभिलेख' : '100% Compliant holdings'}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!category) return null;

  return (
    <div className="mb-5 bg-white rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden transition-all">
      {/* 1. Header Banner (Distinct Royal Indigo-Blue Portal Brand Header) */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-500">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0 shadow-xs border border-white/25 backdrop-blur-xs">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                {isMarathi ? `पुस्तिका क्र. ${selectedCatId}` : `Booklet ${selectedCatId}`}
              </span>
              <span className="text-[11px] font-semibold text-indigo-100 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{formatScopeText(activeScope, isMarathi) || (isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District')}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              {isMarathi ? category.nameMr : category.nameEn}
              <span className="text-xs sm:text-sm font-medium text-indigo-100 ml-2">
                — {isMarathi ? 'आलेख व वैधानिक गोषवारा विश्लेषण' : 'Analytics & Statutory Insights'}
              </span>
            </h2>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(p => !p)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 transition-all cursor-pointer border border-white/60 flex items-center gap-1.5 text-xs font-extrabold shadow-xs active:scale-95"
            title={isExpanded ? (isMarathi ? 'आलेख व केपीआय संकुचित करा' : 'Collapse Graphics & KPIs') : (isMarathi ? 'आलेख व केपीआय उघडा' : 'Expand Graphics & KPIs')}
          >
            <span>
              {isExpanded ? (isMarathi ? 'संकुचित करा' : 'Collapse') : (isMarathi ? 'आलेख व केपीआय उघडा' : 'Expand Charts & KPIs')}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-5 space-y-5 bg-slate-50/40">
          {/* 2. Primary Dynamic KPI Cards Grid (Matches the exact statutory headers of Booklet sheet) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {(dynamicBookletKpis && dynamicBookletKpis.length > 0 ? dynamicBookletKpis : bookletKpiCards).map((kpi, idx) => (
              <MetricCard
                key={`booklet-kpi-${selectedCatId}-${kpi.key || idx}`}
                variant={kpi.variant || (kpi.isFirst ? 'blue' : kpi.isAlert ? 'rose' : 'indigo')}
                titleMr={kpi.titleMr}
                titleEn={kpi.titleEn}
                value={kpi.value ?? kpi.count}
                area={kpi.area ? (typeof kpi.area === 'number' ? `${kpi.area.toLocaleString('en-IN')} Ha` : kpi.area) : undefined}
                areaEn={kpi.areaEn || (typeof kpi.area === 'number' ? `${kpi.area.toLocaleString('en-IN')} Ha` : kpi.area)}
                subtext={kpi.subtext || (isMarathi ? kpi.subtextMr : kpi.subtextEn)}
                subtextEn={kpi.subtextEn || kpi.subtext}
                unit={isMarathi ? 'गट' : 'parcels'}
                icon={kpi.iconComponent || kpi.IconCmp}
                isActive={selectedKpiFilter === kpi.key}
                onClick={() => onKpiFilterSelect?.(kpi.key)}
                compact={true}
                loading={loading}
              />
            ))}
          </div>

          {/* 3. Statutory Compliance Progress Meter */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {isMarathi ? 'वैधानिक पूर्तता व जोखीम स्थिती' : 'Statutory Compliance & Risk Status'}
                  </span>
                </div>
                <span className={clsx(
                  'inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs',
                  analyticsData.totalSurveys === 0
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : analyticsData.breachPct > 15
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : analyticsData.breachPct > 5
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                )}>
                  <span className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    analyticsData.totalSurveys === 0
                      ? 'bg-slate-400'
                      : analyticsData.breachPct > 15
                      ? 'bg-rose-600'
                      : analyticsData.breachPct > 5
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  )} />
                  <span>
                    {analyticsData.totalSurveys === 0
                      ? (isMarathi ? 'निरंक (० अभिलेख)' : 'No Records (0)')
                      : analyticsData.breachPct > 15
                      ? (isMarathi ? 'उच्च महसूल जोखीम (तातडीने चौकशी आवश्यक)' : 'High Risk - Priority Inquiry')
                      : analyticsData.breachPct > 5
                      ? (isMarathi ? 'मध्यम जोखीम (पडताळणी आवश्यक)' : 'Moderate Risk - Verification Needed')
                      : (isMarathi ? 'समाधानकारक स्थिती (अल्प जोखीम)' : 'Satisfactory - Low Risk')}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{isMarathi ? `नियमित: ${analyticsData.compliantPct}%` : `Compliant: ${analyticsData.compliantPct}%`}</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{isMarathi ? `शर्तभंग/चौकशी: ${analyticsData.breachPct}%` : `Breach/Inquiry: ${analyticsData.breachPct}%`}</span>
                </span>
              </div>
            </div>

            {/* 100% Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${analyticsData.compliantPct}%` }}
                title={`${isMarathi ? 'नियमित' : 'Compliant'}: ${analyticsData.compliantCount} (${analyticsData.compliantPct}%)`}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                style={{ width: `${analyticsData.breachPct}%` }}
                title={`${isMarathi ? 'शर्तभंग / चौकशी' : 'Breach / Inquiry'}: ${analyticsData.totalBreachCount} (${analyticsData.breachPct}%)`}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
              <span>
                {isMarathi
                  ? `एकूण ${analyticsData.totalSurveys.toLocaleString('en-IN')} अभिलेखांपैकी ${analyticsData.compliantCount.toLocaleString('en-IN')} नियमित व ${analyticsData.totalBreachCount.toLocaleString('en-IN')} शर्तभंग/तपासणी आवश्यक.`
                  : `Out of ${analyticsData.totalSurveys.toLocaleString('en-IN')} records, ${analyticsData.compliantCount.toLocaleString('en-IN')} are compliant and ${analyticsData.totalBreachCount.toLocaleString('en-IN')} require inquiry.`}
              </span>
              <span className="font-mono font-bold text-slate-700">
                {analyticsData.totalArea.toLocaleString('en-IN')} Ha
              </span>
            </div>
          </div>

          {/* 4. Two Primary Visual Charts: Mutually Exclusive Pie/Donut + Statutory Audit Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Pure Mutually Exclusive Composition Pie / Donut Chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0">
                    <PieIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    {pieMode === 'tenure'
                      ? (isMarathi ? 'भूधारणा वर्गवारी रचना (१००%)' : 'Tenure Composition (100%)')
                      : (isMarathi ? 'पूर्तता व जोखीम विभागणी (१००%)' : 'Compliance & Risk Split (100%)')}
                  </h3>
                </div>

                {/* View Switchers */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPieMode('tenure')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        pieMode === 'tenure'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'भूधारणा वर्ग १/२' : 'Tenure Class'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPieMode('compliance')}
                      className={clsx(
                        'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                        pieMode === 'compliance'
                          ? 'bg-white text-indigo-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      {isMarathi ? 'नियमित वि. शर्तभंग' : 'Compliance'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Donut Render with Live Interactive Center */}
              <div className="relative w-full h-[200px] flex items-center justify-center">
                {mounted && activePieSlices.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activePieSlices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={chartStyle === 'donut' ? 56 : 0}
                        outerRadius={80}
                        paddingAngle={2}
                        onMouseEnter={(_, index) => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        {activePieSlices.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={hoveredSlice === index ? 3 : 1.5}
                            className="cursor-pointer transition-all duration-150"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <Info className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs">{isMarathi ? 'आलेख डेटा उपलब्ध नाही' : 'No chart data'}</span>
                  </div>
                )}

                {/* Donut Center Label (Zero Tooltip Collision) */}
                {chartStyle === 'donut' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
                    {currentHoveredItem ? (
                      <div className="animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                        <span className="text-[11px] font-black block truncate max-w-[130px] mx-auto" style={{ color: currentHoveredItem.color }}>
                          {currentHoveredItem.name}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-950 font-mono block">
                          {currentHoveredItem.count.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">{isMarathi ? 'गट' : 'parcels'}</span>
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 font-mono block">
                          {currentHoveredItem.area} Ha • {currentHoveredItem.pct}%
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {isMarathi ? 'एकूण अभिलेख' : 'Total Holdings'}
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900 font-mono block">
                          {analyticsData.totalSurveys.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">{isMarathi ? 'गट' : 'parcels'}</span>
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-emerald-600 block">
                          {analyticsData.totalArea.toLocaleString('en-IN')} Ha
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Clean Streamlined Legend */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                {activePieSlices.map((slice, idx) => (
                  <div
                    key={`slice-legend-${idx}`}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={clsx(
                      'flex items-center justify-between py-1 px-2 rounded-md text-xs transition-colors cursor-pointer',
                      hoveredSlice === idx
                        ? 'bg-slate-100 font-bold'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-slate-800 font-semibold truncate text-[11px] sm:text-xs">{slice.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                      <span className="text-slate-900 font-bold">
                        {slice.count.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">{isMarathi ? 'गट' : 'p.'}</span>
                      </span>
                      <span className="text-slate-500 font-medium text-[10px]">
                        ({slice.area} Ha)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 min-w-[38px] text-right">
                        {slice.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Statutory Audit Findings Horizontal Bar Chart (100% Graphical) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {isMarathi ? 'वैधानिक तपासणी व शर्तभंग आलेख' : 'Statutory Audit & Breach Chart'}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isMarathi ? 'पुस्तिकेतील निकषनिहाय जोखीम व पूर्तता प्रमाण' : 'Rule-wise risk & compliance breakdown'}
                    </span>
                  </div>
                </div>

                {/* Pure Graphical Status Badges */}
                <div className="flex items-center gap-3 text-[10.5px] font-bold">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                    <span>{isMarathi ? 'शर्तभंग' : 'Breach'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-mono">
                      {analyticsData.totalBreachCount}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                    <span>{isMarathi ? 'निर्दोष' : 'Clean'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                      {compliantAuditItems.length}
                    </span>
                  </span>
                </div>
              </div>

              {/* Pure Graphical Horizontal Bar Chart */}
              <div className="w-full h-[220px]">
                {mounted && statutoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={statutoryChartData}
                      margin={{ top: 5, right: 85, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        width={145}
                        tick={{ fill: '#334155', fontWeight: 600 }}
                      />
                      <RechartsTooltip content={<CustomStatutoryTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                        {statutoryChartData.map((entry, index) => (
                          <Cell
                            key={`stat-bar-${index}`}
                            fill={entry.count > 0 ? (entry.isBreach ? '#e11d48' : '#f59e0b') : '#10b981'}
                          />
                        ))}
                        <LabelList
                          dataKey="displayValue"
                          position="right"
                          fontSize={9.5}
                          fontWeight={700}
                          fill="#475569"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {isMarathi ? 'आलेख उपलब्ध नाही.' : 'No chart data available.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Regional Comparison Bar Chart (Talukas across District or Villages across Taluka) */}
          {comparisonBarData.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके'
                          ? (isMarathi ? `${formatTalukaName(taluka, true)} — गावनिहाय तुलनात्मक आलेख` : `${taluka} — Village Breakdown`)
                          : (isMarathi ? 'तालुकानिहाय तुलनात्मक आलेख (चंद्रपूर जिल्हा)' : 'Taluka Comparison (Chandrapur District)')}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 font-mono">
                        {comparisonBarData.length} {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके'
                          ? (isMarathi ? (comparisonBarData.length === 1 ? 'गाव' : 'गावे') : (comparisonBarData.length === 1 ? 'Village' : 'Villages'))
                          : (isMarathi ? 'तालुके' : 'Talukas')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isMarathi ? 'या निवडलेल्या पुस्तिकेतील नोंदींचे प्रादेशिक वितरण व जोखीम वर्गीकरण' : 'Regional breakdown & risk distribution for this booklet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                      <span>{isMarathi ? 'नियमित' : 'Compliant'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-rose-600" />
                      <span>{isMarathi ? 'शर्तभंग/तपासणी' : 'Breach/Inquiry'}</span>
                    </div>
                  </div>

                  {/* Sort Controls (shown when more than 1 item) */}
                  {comparisonBarData.length > 1 && (
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px]">
                      <span className="px-1.5 text-slate-500 font-semibold flex items-center gap-0.5">
                        <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        <span>{isMarathi ? 'क्रम:' : 'Sort:'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setBarSortMode('breach')}
                        className={clsx(
                          'px-2 py-0.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1',
                          barSortMode === 'breach'
                            ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                        title={isMarathi ? 'सर्वाधिक शर्तभंग असलेले क्षेत्र आधी दाखवा' : 'Sort by highest breaches first'}
                      >
                        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', barSortMode === 'breach' ? 'bg-white' : 'bg-rose-500')} />
                        <span>{isMarathi ? 'शर्तभंग प्रथम' : 'High Breach'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarSortMode('riskPct')}
                        className={clsx(
                          'px-2 py-0.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1',
                          barSortMode === 'riskPct'
                            ? 'bg-amber-600 text-white shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                        title={isMarathi ? 'शर्तभंग टक्केवारीनुसार क्रमवारी' : 'Sort by breach percentage'}
                      >
                        <AlertTriangle className={clsx('w-2.5 h-2.5 shrink-0', barSortMode === 'riskPct' ? 'text-white' : 'text-amber-600')} />
                        <span>{isMarathi ? 'जोखीम %' : 'Risk %'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarSortMode('total')}
                        className={clsx(
                          'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                          barSortMode === 'total'
                            ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                        title={isMarathi ? 'एकूण गट संख्येनुसार क्रमवारी' : 'Sort by total parcels'}
                      >
                        <span>{isMarathi ? 'एकूण गट' : 'Total'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarSortMode('name')}
                        className={clsx(
                          'px-2 py-0.5 rounded-md font-bold transition cursor-pointer',
                          barSortMode === 'name'
                            ? 'bg-slate-700 text-white shadow-2xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                        title={isMarathi ? 'अकारविल्हे क्रमवारी' : 'Sort alphabetically'}
                      >
                        <span>{isMarathi ? 'नाव' : 'A-Z'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot Risk Briefing Banner */}
              {hotspotInsights.hasHotspots && hotspotInsights.totalBreaches > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-rose-50/50 to-amber-50/30 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 text-xs text-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-950 uppercase tracking-wide text-[11px] flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isMarathi ? 'महसूल जोखीम व चौकशी हॉटस्पॉट निष्कर्ष' : 'Executive Revenue Hotspot Briefing'}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-mono">
                        {hotspotInsights.totalBreaches.toLocaleString('en-IN')} {isMarathi ? 'शर्तभंग गट' : 'Breach Parcels'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {isMarathi ? (
                        <>
                          {hotspotInsights.hotspotCount === 1 ? (
                            <>
                              या क्षेत्रातील सर्व <strong className="text-slate-950">{hotspotInsights.totalBreaches}</strong> शर्तभंग नोंदी या एकाच गावात (<strong className="text-rose-700">{hotspotInsights.top3[0]?.name}</strong> – {hotspotInsights.top3[0]?.breach} गट, {hotspotInsights.top3[0]?.breachPct}%) एकवटल्या आहेत.
                            </>
                          ) : (
                            <>
                              या क्षेत्रातील एकूण <strong className="text-slate-950">{hotspotInsights.totalBreaches}</strong> शर्तभंग नोंदींपैकी <strong className="text-rose-700">{hotspotInsights.top3Pct}%</strong> नोंदी {hotspotInsights.top3.length === 2 ? 'शीर्ष २' : 'शीर्ष ३'} क्षेत्रांमध्ये एकवटल्या आहेत:
                              {' '}
                              <span className="font-bold text-slate-900">
                                {hotspotInsights.top3.map((h, i) => `${h.name} (${h.breach} गट, ${h.breachPct}%)`).join(', ')}
                              </span>
                              .
                            </>
                          )}
                          {' '}
                          {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके'
                            ? 'मंडळ अधिकारी व तलाठी यांना या गावात प्राधान्याने प्रत्यक्ष स्थळ पंचनामा व अहवाल सादर करण्याचे निर्देश द्यावेत.'
                            : 'संबंधित उपविभागीय अधिकारी (SDO) व तहसीलदार यांनी या तालुक्यांमध्ये तात्काळ सुनावणी व अहवाल सादर करण्याचे निर्देश द्यावेत.'}
                        </>
                      ) : (
                        <>
                          {hotspotInsights.hotspotCount === 1 ? (
                            <>
                              All <strong className="text-slate-950">{hotspotInsights.totalBreaches}</strong> breach records are concentrated in a single village: <strong className="text-rose-700">{hotspotInsights.top3[0]?.name}</strong> ({hotspotInsights.top3[0]?.breach} parcels, {hotspotInsights.top3[0]?.breachPct}%).
                            </>
                          ) : (
                            <>
                              Out of <strong className="text-slate-950">{hotspotInsights.totalBreaches}</strong> total breaches, <strong className="text-rose-700">{hotspotInsights.top3Pct}%</strong> are concentrated in the {hotspotInsights.top3.length === 2 ? 'top 2' : 'top 3'} areas:
                              {' '}
                              <span className="font-bold text-slate-900">
                                {hotspotInsights.top3.map((h, i) => `${h.name} (${h.breach} parcels, ${h.breachPct}%)`).join(', ')}
                              </span>
                              .
                            </>
                          )}
                          {' '}
                          Priority field inspection and inquiry hearings should be scheduled here immediately.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Content: 1 item vs Multiple items */}
              {comparisonBarData.length === 1 ? (
                (() => {
                  const singleItem = comparisonBarData[0];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                      {/* Left: Village Detailed Overview Card */}
                      <div className="md:col-span-5 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-3 shadow-2xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {isMarathi ? 'गावनिहाय तपशील' : 'Village Overview'}
                            </span>
                            <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{singleItem.name}</span>
                              {taluka && taluka !== 'all' && taluka !== 'सर्व तालुके' && (
                                <span className="text-xs font-semibold text-slate-500">
                                  ({formatTalukaName(taluka, isMarathi)})
                                </span>
                              )}
                            </h4>
                          </div>
                          <span className={clsx(
                            "text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs",
                            singleItem.breach > 0
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          )}>
                            {singleItem.breach > 0
                              ? (isMarathi ? `${singleItem.breachPct}% जोखीम` : `${singleItem.breachPct}% Risk`)
                              : (isMarathi ? '१००% नियमित' : '100% Compliant')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              {isMarathi ? 'एकूण अभिलेख' : 'Total Holdings'}
                            </span>
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {singleItem.total.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'parcels'}
                            </span>
                            {singleItem.totalArea > 0 && (
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                                {singleItem.totalArea} Ha
                              </span>
                            )}
                          </div>
                          <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block font-medium">
                              {isMarathi ? 'शर्तभंग / तपासणी' : 'Breach / Flagged'}
                            </span>
                            <span className="text-sm font-black text-rose-600 font-mono">
                              {singleItem.breach.toLocaleString('en-IN')} {isMarathi ? 'गट' : 'parcels'}
                            </span>
                            <span className="text-[10px] text-rose-500 block font-semibold mt-0.5">
                              ({singleItem.breachPct}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress distribution */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-emerald-700">
                              {isMarathi ? `नियमित: ${singleItem.compliant} (${(100 - singleItem.breachPct).toFixed(1)}%)` : `Compliant: ${singleItem.compliant}`}
                            </span>
                            <span className="text-rose-700">
                              {isMarathi ? `शर्तभंग: ${singleItem.breach} (${singleItem.breachPct}%)` : `Breach: ${singleItem.breach}`}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${100 - singleItem.breachPct}%` }} />
                            <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${singleItem.breachPct}%` }} />
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1.5 border-t border-slate-200/60">
                          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {isMarathi
                              ? 'या निवडलेल्या पुस्तिकेतील सर्व अभिलेख केवळ याच गावात नोंदणीकृत आहेत.'
                              : 'All booklet records in this scope are registered within this village.'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Focused Bar Chart Container */}
                      <div className="md:col-span-7 h-[220px]">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={comparisonBarData}
                              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                              maxBarSize={52}
                              barSize={52}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={11}
                                interval={0}
                                angle={0}
                                textAnchor="middle"
                                height={25}
                                tick={{ fill: '#334155', fontWeight: 600 }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                              />
                              <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                tick={{ fill: '#475569', fontWeight: 600 }}
                                width={36}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                                allowDecimals={false}
                              />
                              <RechartsTooltip content={<CustomBarTooltip />} cursor={false} />
                              <Bar
                                dataKey="compliant"
                                name={isMarathi ? 'नियमित' : 'Compliant'}
                                fill="#059669"
                                stackId="a"
                                maxBarSize={52}
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="breach"
                                name={isMarathi ? 'शर्तभंग/चौकशी' : 'Breach/Inquiry'}
                                fill="#e11d48"
                                stackId="a"
                                maxBarSize={52}
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Multiple items: Standard full width bar chart */
                <div className="w-full h-[220px]">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonBarData}
                        margin={{ top: 10, right: 16, left: 0, bottom: comparisonBarData.length > 6 ? 28 : 10 }}
                        maxBarSize={44}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={10}
                          interval={0}
                          angle={comparisonBarData.length > 6 ? -30 : 0}
                          textAnchor={comparisonBarData.length > 6 ? 'end' : 'middle'}
                          height={comparisonBarData.length > 6 ? 45 : 25}
                          tick={{ fill: '#334155', fontWeight: 600 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tick={{ fill: '#475569', fontWeight: 600 }}
                          width={36}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                          allowDecimals={false}
                        />
                        <RechartsTooltip content={<CustomBarTooltip />} cursor={false} />
                        <Bar
                          dataKey="compliant"
                          name={isMarathi ? 'नियमित' : 'Compliant'}
                          fill="#059669"
                          stackId="a"
                          maxBarSize={44}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="breach"
                          name={isMarathi ? 'शर्तभंग/चौकशी' : 'Breach/Inquiry'}
                          fill="#e11d48"
                          stackId="a"
                          maxBarSize={44}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
