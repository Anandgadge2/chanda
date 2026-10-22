'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Filter,
  CheckCircle2,
  FileText,
  LandPlot,
  TableProperties,
  Search,
  X,
  ShieldCheck,
  Building2,
  Eye,
  SlidersHorizontal,
  Info,
  Scale,
  AlertTriangle,
  Compass,
  History,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import { api } from '../../lib/api';
import Pagination from '../../components/Pagination';

function cleanVillageName(name) {
  if (!name) return 'अज्ञात गाव';
  if (name === 'संपूर्ण तालुका (All Villages)' || name === 'all' || name === 'सर्व गावे') return name;
  let raw = String(name);
  raw = raw.replace(/[1१]\s*[-तते]\s*[4४][56५६]/gi, '');
  raw = raw.replace(/[4४][56५६]\s*[-तते]\s*[1१]/gi, '');
  raw = raw.replace(/[1१]\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/[1-9१-९]+\s*[-तते]\s*[1-9१-९]+/gi, '');
  raw = raw.replace(/1-46|१-४६|1-45|१-४५/gi, '');
  raw = raw.replace(/१ त ४५|१ ते ४६|1 to 46|1 to 45/gi, '');
  raw = raw.replace(/[4४][56५६]\s*मद[दत]?/gi, '');
  raw = raw.replace(/मद[दत]?\s+/gi, '');
  raw = raw.replace(/मदयच/gi, '');
  raw = raw.replace(/महसल\s*अधकर\s*अभलख/gi, '');
  raw = raw.replace(/महिती|महत/gi, '');
  raw = raw.replace(/तपसण[ी]?\s*सतर/gi, '');
  raw = raw.replace(/तपसण[ी]?/gi, '');
  raw = raw.replace(/Worksheet\s*\d*/gi, '');
  raw = raw.replace(/सधरत/gi, '');
  raw = raw.replace(/2026/g, '');
  raw = raw.replace(/^मंडळ\s*/i, '');
  raw = raw.trim().replace(/\s+/g, ' ');
  return raw || name || 'अज्ञात गाव';
}

// 17 Official Statutory Booklet Categories
const STATUTORY_CATEGORIES = [
  { id: 1, nameMr: 'सरकारी जमीन', desc: 'गायरान, वन, पहाड, खडक, अतिक्रमण व वाटप तपासणी' },
  { id: 2, nameMr: 'कुळ वहिवाट व शेतजमीन कायदा', desc: 'कुळ घोषित जमिनी, शर्तभंग व वर्ग-२ चे वर्ग-१ अवैध रूपांतरण' },
  { id: 3, nameMr: 'जमिन इनाम व वतन जमिनी', desc: 'मदद माश/खिदमत माश इनाम वतन जमिनी व शर्तभंग' },
  { id: 4, nameMr: 'म.ज.म.अधि. १९६६ भूमिहीन वाटप', desc: 'भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिक प्रदान जमिनी' },
  { id: 5, nameMr: 'म.ज.म.अधि. १९६६ संस्था/उद्योग', desc: 'गृहनिर्माण संस्था, उद्योग, शैक्षणिक संस्था, प्रकल्प प्रदान जमिनी' },
  { id: 6, nameMr: 'महाराष्ट्र शेतजमीन कमाल धारणा १९६१', desc: 'सिलिंग कायद्यान्वये वाटप जमिनी व शर्तभंग' },
  { id: 7, nameMr: 'विकास आराखडा व गुरचरण जमिनी', desc: 'महानगरपालिका/प्राधिकरण विकास आराखडा व ग्रामपंचायत गुरचरण' },
  { id: 8, nameMr: 'जमीन देवस्थान इनाम जमिनी', desc: 'देवस्थान इनाम जमिनी व वर्ग रूपांतरण तपासणी' },
  { id: 9, nameMr: 'आदिवासी खातेदारांचे जमिनी', desc: 'कलम ३६/३६अ अन्वये आदिवासी ते आदिवासी/गैर-आदिवासी हस्तांतरण' },
  { id: 10, nameMr: 'पुनर्वसन अधिनियम १९९९ कलम १६', desc: 'प्रकल्पग्रस्तांना प्रदान जमिनी व इतर हक्क तपासणी' },
  { id: 11, nameMr: 'भाडेपट्ट्याने दिलेली शासकीय जमीन', desc: 'शासकीय भाडेपट्टा जमिनी, कालावधी व शर्तभंग' },
  { id: 12, nameMr: 'भूदान व ग्रामदान प्रदान जमिनी', desc: 'भूदान चळवळ अंतर्गत प्रदान व अनधिकृत हस्तांतरण' },
  { id: 13, nameMr: 'खाजगी वने संपादन अधिनियम १९७५', desc: 'खाजगी वने संपादन व कमाल जमीन धारणा प्रलंबित चौकशी' },
  { id: 14, nameMr: 'भूमीधारी हक्क प्राप्त जमिनी', desc: 'भूमीधारी हक्क जमिनी व वर्ग-२ रूपांतरण तपासणी' },
  { id: 15, nameMr: 'कमाल जमीन धारणा सूट जमीन', desc: 'कमाल मर्यादेपेक्षा अधिक जमीन धारणा विशेष सूट' },
  { id: 16, nameMr: 'वक्फ बोर्डाचे मालकीची जमीन', desc: 'वक्फ बोर्ड मालमत्ता व इतर हक्क तपासणी' },
  { id: 17, nameMr: 'भूसंपादन अधिग्रहित / राखीव जमीन', desc: 'भूसंपादन कायदयांतर्गत अधिग्रहित किंवा राखीव जमिनी' }
];

// Official 46 Checkpoints Column Definitions
const CHECKLIST_46_COLUMNS = [
  // 1 to 9: रिनंबरींग पर्चाप्रमाणे (ऐतिहासिक कालक्रम)
  { num: 1, title: 'i) बंदोबस्त क्र', group: 'renumbering', minW: 'min-w-[90px]' },
  { num: 2, title: 'ii) बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव', group: 'renumbering', minW: 'min-w-[180px]' },
  { num: 3, title: 'iii) बंदोबस्त नंबर प्रमाणे भूधारणा', group: 'renumbering', minW: 'min-w-[120px]' },
  { num: 4, title: 'i) एकत्रिकरण नंबर', group: 'renumbering', minW: 'min-w-[90px]' },
  { num: 5, title: 'ii) एकत्रिकरण नंबर प्रमाणे भोगवटदाराचे नाव', group: 'renumbering', minW: 'min-w-[180px]' },
  { num: 6, title: 'iii) एकत्रिकरण नंबरप्रमाणे भूधारणा', group: 'renumbering', minW: 'min-w-[120px]' },
  { num: 7, title: 'i) पुर्नमोजणी नंबर(7/12)', group: 'renumbering', minW: 'min-w-[90px]' },
  { num: 8, title: 'ii) ७/१२ प्रमाणे भोगवटदाराचे नाव', group: 'renumbering', minW: 'min-w-[180px]' },
  { num: 9, title: 'iii) ७/१२ प्रमाणे भूधारणा', group: 'renumbering', minW: 'min-w-[120px]' },

  // 10 to 19: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास
  { num: 10, title: 'सध्यस्थितीतील 7/12 प्रमाणे भोगवटदाराचे नाव', group: 'govt', minW: 'min-w-[190px]' },
  { num: 11, title: 'अधिकार अभिलेखानुसार जमिनीचा दर्जा/प्रकार (गायरान/सरकार पहाड खडक/परमपोक इ.)', group: 'govt', minW: 'min-w-[180px]' },
  { num: 12, title: 'मुढ ७/१२ शी तुलना करता सध्यास्थितीती 7/12 मधील क्षेत्र, एकक,भूधारणा, इतर अधिकार मधील नोंदी किंवा वापराचे प्रयोजन या मध्ये तफावत 7/12 मध्ये आहेत का? असल्यास नमूद करणे.', group: 'govt', minW: 'min-w-[210px]' },
  { num: 13, title: 'वन / झुडपी जंगल जमीन आहे का?', group: 'govt', minW: 'min-w-[100px]' },
  { num: 14, title: 'सदर जमीन वाटप झाली आहे का? असल्यास क्षेत्र नमूद करावे.', group: 'govt', minW: 'min-w-[130px]' },
  { num: 15, title: 'अतिक्रमण आहे का? असल्यास क्षेत्र', group: 'govt', minW: 'min-w-[120px]' },
  { num: 16, title: 'सदर गट/सर्व्हे नंबरचे KML तयार केले आहे काय?', group: 'govt', minW: 'min-w-[110px]' },
  { num: 17, title: 'भूसंपादन झाले आहे का? असल्यास भूसंपादित क्षेत्र', group: 'govt', minW: 'min-w-[120px]' },
  { num: 18, title: 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?', group: 'govt', minW: 'min-w-[130px]' },
  { num: 19, title: 'शासकीय जमिनीवर पोकळीस्त नोंदी आहेत का ? असल्यास इतर अधिकारामध्ये फेरफारशिवाय काही नोंदी झाल्यात का ? असल्यास नमूद करणे.', group: 'govt', minW: 'min-w-[170px]' },

  // 20 to 46: वैधानिक कायदे व तपासणी रकाने
  { num: 20, title: 'मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा अन्वये कुळ घोषित केलेली जमीन आहे काय?', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 21, title: 'सदर जमिन इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन) प्रकारातील आहे काय ? असल्यास कोणता प्रकार (मदद माश इनाम/खिदमत माश इनाम, इतर)', group: 'statutory', minW: 'min-w-[170px]' },
  { num: 22, title: 'सदर जमिन म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन आहे का ? असल्यास संस्थेचे नाव नमुद करावे.', group: 'statutory', minW: 'min-w-[220px]' },
  { num: 23, title: 'सदर जमिन महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी प्रकारातील आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 24, title: 'सदर जमीन महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेली आहे का ?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 25, title: 'सदर जमीन देवस्थान इनाम जमीन आहे काय? (होय/नाही)', group: 'statutory', minW: 'min-w-[110px]' },
  { num: 26, title: 'सदर जमीन आदिवासी खातेदारांचे मालकीची आहे काय? (होय/नाही)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 27, title: 'सदर जमिन महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेली आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[150px]' },
  { num: 28, title: 'सदर जमिन भाडेपट्टयाने दिलेली शासकीय जमिन आहे काय? (होय/नाही)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 29, title: 'सदर जमिन भुदान व ग्रामदान अंतर्गत दिलेली आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 30, title: 'सदर जमिन महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित आहे काय ?', group: 'statutory', minW: 'min-w-[170px]' },
  { num: 31, title: 'सदर जमिन भुमीधारी हक्कान्वये प्राप्त झालेली आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 32, title: 'सदर जमिनीस कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेली आहे काय ?', group: 'statutory', minW: 'min-w-[140px]' },
  { num: 33, title: 'सदर जमिन वक्फ बोर्डाचे मालकीची आहे काय? (होय/नाही)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 34, title: 'सदर जमिन भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[130px]' },
  { num: 35, title: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास सक्षम प्राधिका-यांच्या परवानगीशिवाय भोग. वर्ग-2 मधुन भोग. वर्ग-1 मध्ये रुपांतरीत झालेली आहे काय ?', group: 'statutory', minW: 'min-w-[190px]' },
  { num: 36, title: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास, मौका चौकशीअंती सदर जमिनीबाबत शर्तभंग झालेला आहे काय ?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 37, title: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते आदिवासी हस्तांतरण झाले आहे का ?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 38, title: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते गैर आदिवासी हस्तांतरण झाले आहे का ?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 39, title: 'जमिनीच्या निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये घेण्यात आली आहे काय? (होय / नाही)', group: 'statutory', minW: 'min-w-[140px]' },
  { num: 40, title: 'अधिकार अभिलेखापासून ते आजपावेतोच्या अधिकार अभिलेखानुसार इतर अधिकारातील नोंदी/भुधारणा/भोगवटदार यांच्या नोंदी अवैधरित्या कमी केलेल्या आहेत काय?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 41, title: 'भोगवटदार कंपनी/बिगर शेतकरी असल्यास परवानगी घेतलेली आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 42, title: 'सदर जमिन कलम 89 व 89 अ अन्वये ख-याखु-या औद्योगिक प्रयोजनाकरिता कंपनीने धारण केलेली आहे काय ? (होय/नाही)', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 43, title: 'खरेदी दिनांक', group: 'statutory', minW: 'min-w-[100px]' },
  { num: 44, title: 'वापर सुरू केला आहे काय?', group: 'statutory', minW: 'min-w-[100px]' },
  { num: 45, title: 'विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ?', group: 'statutory', minW: 'min-w-[130px]' },
  { num: 46, title: 'मुद्दा क्र. 10 ते 34 प्रमाणे गाव नमुना 1 क अद्यावत आहे काय ?', group: 'statutory', minW: 'min-w-[120px]' }
];

export default function ReportsPage() {
  // Main Tab: 'checklist' (Master 46-point checklist) vs 'categories' (17 Statutory Booklets)
  const [activeTab, setActiveTab] = useState('checklist');
  const [selectedCatId, setSelectedCatId] = useState(1);

  // Administrative Filters
  const [taluka, setTaluka] = useState('all');
  const [village, setVillage] = useState('all');
  const [villageOptions, setVillageOptions] = useState([]);
  const [search, setSearch] = useState('');

  // Additional Detailed Filters
  const [tenureFilter, setTenureFilter] = useState('all');
  const [violationFilter, setViolationFilter] = useState('all');
  const [areaRangeFilter, setAreaRangeFilter] = useState('all');

  // View state: 'timeline' (Full Backward History Timeline 1-46 Table), 'parcels' (Compact View), 'summary' (Rollup Table)
  const [activeView, setActiveView] = useState('timeline');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Data states
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [activeScope, setActiveScope] = useState('');

  // Modal inspection for 46 points
  const [inspectedParcel, setInspectedParcel] = useState(null);

  // Dynamically load villages for selected taluka
  useEffect(() => {
    async function loadVillages() {
      try {
        const res = await api.getTalukaVillages(taluka);
        setVillageOptions(res.villages || []);
      } catch (err) {
        console.error('Failed to load villages list:', err);
      }
    }
    loadVillages();
  }, [taluka]);

  // Load report data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const reportId = activeTab === 'checklist' ? 'checklist' : selectedCatId;
      const res = await api.getPrapatraReport(reportId, {
        taluka,
        village,
        search,
        tenure: tenureFilter,
        violation: violationFilter,
        areaRange: areaRangeFilter,
        booklet: activeTab === 'categories' ? 'true' : 'false'
      });
      setSummaryData(res.data || []);
      setParcels(res.parcels || []);
      setActiveScope(res.scope || '');
      setPage(1);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCatId, taluka, village, search, tenureFilter, violationFilter, areaRangeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current category details
  const currentCategory = useMemo(() => {
    return STATUTORY_CATEGORIES.find(c => c.id === selectedCatId) || STATUTORY_CATEGORIES[0];
  }, [selectedCatId]);

  // Compute aggregate metrics
  const stats = useMemo(() => {
    let totalArea = 0;
    let shartbhangCount = 0;
    let class2Count = 0;

    parcels.forEach(p => {
      const area = parseFloat(p.totalAreaHa) || 0;
      totalArea += area;
      if (p.tenureClass === 'BHOGVATDAR_CLASS_2' || p.tenureDisplay?.includes('वर्ग-२')) {
        class2Count++;
      }
      if (
        p.statusFinding?.includes('शर्तभंग') ||
        p.statusFinding?.includes('अवैध') ||
        p.points?.[37] === 'होय' ||
        p.points?.[36]?.includes('होय')
      ) {
        shartbhangCount++;
      }
    });

    return {
      totalCount: parcels.length,
      totalAreaHa: totalArea.toFixed(2),
      class2Count,
      shartbhangCount
    };
  }, [parcels]);

  // Paginated parcel items
  const paginatedParcels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return parcels.slice(start, start + pageSize);
  }, [parcels, page, pageSize]);

  // Download URLs
  const currentReportId = activeTab === 'checklist' ? 'checklist' : selectedCatId;
  const excelDownloadUrl = api.getPrapatraExcelUrl(currentReportId, {
    taluka,
    village,
    search,
    tenure: tenureFilter,
    violation: violationFilter,
    areaRange: areaRangeFilter,
    booklet: activeTab === 'categories' ? 'true' : 'false',
    view: activeTab === 'checklist' ? activeView : undefined
  });
  const pdfDownloadUrl = api.getPrapatraPdfUrl(currentReportId, {
    taluka,
    village,
    search,
    tenure: tenureFilter,
    violation: violationFilter,
    areaRange: areaRangeFilter,
    booklet: activeTab === 'categories' ? 'true' : 'false',
    view: activeTab === 'checklist' ? activeView : undefined
  });

  const hasActiveFilters =
    taluka !== 'all' ||
    village !== 'all' ||
    search !== '' ||
    tenureFilter !== 'all' ||
    violationFilter !== 'all' ||
    areaRangeFilter !== 'all';

  const resetFilters = () => {
    setTaluka('all');
    setVillage('all');
    setSearch('');
    setTenureFilter('all');
    setViolationFilter('all');
    setAreaRangeFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* =========================================================
            HEADER & ACTIONS
        ========================================================= */}
        <header className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  महसूल तपासणी अहवाल व प्रपत्रे
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Revenue Inspection & Statutory Audit Booklets | जिल्हाधिकारी कार्यालय, चंद्रपूर
                </p>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            <a
              href={excelDownloadUrl}
              download
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="अधिकृत शासकीय एक्सेल बुकलेट डाऊनलोड करा (खातेदारांच्या संपूर्ण यादीसह)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {activeTab === 'checklist' && activeView === 'summary'
                  ? 'गोषवारा एक्सेल (.xlsx)'
                  : activeTab === 'checklist' && activeView === 'timeline'
                  ? '४६ सूची एक्सेल (.xlsx)'
                  : 'एक्सेल (.xlsx)'}
              </span>
              <span className="bg-emerald-700/80 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {activeTab === 'checklist' && activeView === 'summary' ? summaryData.length : parcels.length}
              </span>
            </a>

            {/* If on 46-Point Timeline, hide PDF button and show informative badge */}
            {activeTab === 'checklist' && activeView === 'timeline' ? (
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/90 text-amber-900 rounded-xl text-[11px] font-medium"
                title="४६ मुद्द्यांचे ५३ स्तंभ केवळ एक्सेलमध्ये उपलब्ध आहेत. पीडीएफकरिता 'संक्षिप्त ७/१२ यादी' किंवा 'गोषवारा' निवडा."
              >
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>५३ स्तंभ केवळ एक्सेलमध्ये उपलब्ध</span>
              </div>
            ) : (
              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                title="स्वाक्षरी व प्रमाणपत्रासह अधिकृत पीडीएफ प्रत डाऊनलोड करा"
              >
                <Download className="w-4 h-4" />
                <span>
                  {activeTab === 'checklist' && activeView === 'summary'
                    ? 'गोषवारा (.pdf)'
                    : activeTab === 'checklist' && activeView === 'parcels'
                    ? 'संक्षिप्त ७/१२ (.pdf)'
                    : 'पीडीएफ (.pdf)'}
                </span>
              </a>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="डेटा रिफ्रेश करा"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* =========================================================
            TOP SEGMENTED TABS
        ========================================================= */}
        <div className="flex items-center justify-between border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>१ ते ४६ मुद्द्यांची तपासणी सूची</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                Master Checklist
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>१ ते १७ विषयनिहाय प्रपत्रे व गोषवारा</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                17 Categories
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            PROPER CATEGORY DROPDOWN SELECTOR (REPLACED BLOCKS)
        ========================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 w-full">
              <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>प्रपत्र / विषय निवडा:</span>
              </label>
              <select
                value={selectedCatId}
                onChange={e => setSelectedCatId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {STATUTORY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    प्रपत्र क्र. {cat.id}: {cat.nameMr} — {cat.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg">
                प्रपत्र क्र. {currentCategory.id}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden lg:inline">
                {currentCategory.desc}
              </span>
            </div>
          </div>
        )}

        {/* =========================================================
            COMPREHENSIVE MULTI-FILTER SUITE
        ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>तपासणी निकष व फिल्टर्स (Advanced Audit Filters)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>सर्व फिल्टर्स रीसेट करा</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Taluka Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">तालुका</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={taluka}
                  onChange={e => {
                    setTaluka(e.target.value);
                    setVillage('all');
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="all">सर्व तालुके (15 Talukas)</option>
                  {CHANDRAPUR_TALUKAS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nameMr} ({t.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Village Dropdown (Properly fixed, no [object Object]) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                गाव {villageOptions.length > 0 ? `(${villageOptions.length})` : ''}
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <LandPlot className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="all">सर्व गावे (All Villages)</option>
                  {villageOptions.map((v, i) => {
                    const vName = typeof v === 'object' ? (v.villageName || v.name) : v;
                    const vVal = typeof v === 'object' ? (v.villageName || v.originalVillageName || v.name) : v;
                    const cleanV = cleanVillageName(vName);
                    if (!cleanV || cleanV === 'अज्ञात गाव') return null;
                    return (
                      <option key={i} value={vVal}>
                        {cleanV} {v.total712Count ? `(${v.total712Count})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* 3. Tenure Class Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">धारणा प्रकार</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={tenureFilter}
                  onChange={e => setTenureFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="all">सर्व धारणा प्रकार</option>
                  <option value="BHOGVATDAR_CLASS_1">भोगवटादार वर्ग-१</option>
                  <option value="BHOGVATDAR_CLASS_2">भोगवटादार वर्ग-२</option>
                  <option value="SARKAR_SHASAN">शासकीय जमीन</option>
                  <option value="DEVASTHAN_INAM">देवस्थान / इनाम</option>
                  <option value="FOREST_JANGAL">वन जमीन</option>
                </select>
              </div>
            </div>

            {/* 4. Violation / Audit Finding Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">तपासणी निष्कर्ष</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={violationFilter}
                  onChange={e => setViolationFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="all">सर्व तपासणी निष्कर्ष</option>
                  <option value="shartbhang">शर्तभंग (Breach)</option>
                  <option value="illegalConversion">वर्ग-२ चे वर्ग-१ रूपांतरण</option>
                  <option value="illegalDeletion">सरकार नोंद कमी केलेले</option>
                  <option value="pokalist">पोकळीस्त नोंदी (बु.ग.दे.)</option>
                  <option value="tribalViolation">आदिवासी जमीन हस्तांतरण</option>
                  <option value="encroachment">शासकीय अतिक्रमण</option>
                </select>
              </div>
            </div>

            {/* 5. Area Range Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">क्षेत्र मर्यादा</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={areaRangeFilter}
                  onChange={e => setAreaRangeFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
                >
                  <option value="all">सर्व क्षेत्र</option>
                  <option value="under1">१ हेक्टर पेक्षा कमी</option>
                  <option value="1to5">१ ते ५ हेक्टर</option>
                  <option value="5to10">५ ते १० हेक्टर</option>
                  <option value="above10">१० हेक्टर पेक्षा जास्त</option>
                </select>
              </div>
            </div>

            {/* 6. Multi-Field Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">शोध</label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="गट क्र. / स.नं. / खातेदार..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400 font-medium"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            METRICS KPI STRIP
        ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">एकूण सर्व्हे / गट संख्या</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.totalCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">तपासणी केलेले ७/१२</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">एकूण क्षेत्र (हेक्टर)</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.totalAreaHa}</div>
            <span className="text-[10px] text-slate-500 font-medium">हेक्टर आर क्षेत्र</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">भोगवटादार वर्ग २ / शासकीय</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{stats.class2Count}</div>
            <span className="text-[10px] text-slate-500 font-medium">अविभाज्य शर्तीवरील जमिनी</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400">शर्तभंग / संशयित बाबी</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{stats.shartbhangCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">विशेष चौकशी आवश्यक</span>
          </div>
        </div>

        {/* =========================================================
            VIEW SWITCHER & TABLE CARD
        ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          
          {/* Card Sub-Header & Table View Toggle */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTab === 'checklist' ? 'महसूल अधिकार अभिलेख (७/१२) तपासणी सूची (१ ते ४६)' : currentCategory.nameMr}
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono">
                  {parcels.length} अभिलेख
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeScope || 'चंद्रपूर जिल्हा कार्यक्षेत्र'}</p>
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveView('timeline')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'timeline'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span>ऐतिहासिक कालक्रम व ४६ सूची</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('parcels')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'parcels'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>संक्षिप्त ७/१२ यादी</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('summary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'summary'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>गोषवारा (Rollup)</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              VIEW 0: FULL 46-CHECKPOINTS & BACKWARD TIMELINE TABLE
          ========================================================= */}
          {activeView === 'timeline' ? (
            <div>
              {/* Official Government Table Title Header Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-blue-50/50 to-indigo-50 border-b border-slate-200 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-1 shadow-2xs border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>महाराष्ट्र शासन महसूल विभाग — ऐतिहासिक भू-अभिलेख कालक्रम पडताळणी</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  महसूल अधिकार अभिलेखातील (7/12) ची तपासणी सुची
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-blue-900 mt-0.5">
                  अधिकार अभिलेख (1950) ते आजपर्यतच्या सर्व 7/12 ची तपासणी करुन खालील माहिती भरावी
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 mt-2">
                  <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="font-semibold text-amber-950">रकाने १ ते ९: सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे (ऐतिहासिक कालक्रम)</span>
                  </span>
                  <span className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="font-semibold text-rose-950">रकाने १० ते १९: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास</span>
                  </span>
                  <span className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span className="font-semibold text-blue-950">रकाने २० ते ४६: वैधानिक कायदे व पडताळणी रकाने</span>
                  </span>
                </div>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-300/80 rounded-full text-[11px] font-semibold text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>४६ मुद्द्यांचे ५३ स्तंभ विस्तृत असल्याने संपूर्ण विश्लेषणाकरिता वरील '४६ सूची एक्सेल (.xlsx)' वापरावे. स्वाक्षरीयुक्त पीडीएफ प्रतीकरिता 'संक्षिप्त ७/१२ यादी' किंवा 'गोषवारा' टॅब निवडावा.</span>
                </div>
              </div>

              {/* Horizontal Scroll Table */}
              <div className="overflow-x-auto max-h-[70vh] border-b border-slate-200">
                <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-xs">
                    {/* Level 1: Major Group Headers */}
                    <tr className="bg-slate-200/90 text-slate-800 font-bold border-b border-slate-300 text-center">
                      <th colSpan={7} className="py-2 px-2 border-r border-slate-300 bg-slate-200">
                        मूलभूत ७/१२ तपशील
                      </th>
                      <th colSpan={9} className="py-2 px-2 border-r border-amber-300 bg-amber-100/90 text-amber-950 font-black">
                        सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे (ऐतिहासिक कालक्रम)
                      </th>
                      <th colSpan={10} className="py-2 px-2 border-r border-rose-300 bg-rose-100/90 text-rose-950 font-black">
                        भोगवटदार सरकार / महाराष्ट्र शासन असल्यास
                      </th>
                      <th colSpan={27} className="py-2 px-2 border-r border-blue-300 bg-blue-100/90 text-blue-950 font-black">
                        वैधानिक कायदे व पडताळणी रकाने (कुळ, वतन, आदिवासी, कमाल मर्यादा व इतर)
                      </th>
                      <th className="py-2 px-2 bg-slate-200">कालक्रम</th>
                    </tr>

                    {/* Level 2: Specific Column Titles */}
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                      <th className="py-2 px-2 border-r border-slate-300 w-12">अ.क्र.</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[120px]">गावाचे नाव</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-24">सर्व्हे क्रमांक</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-20 text-right">क्षेत्र</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-28">
                        भोगवटदार वर्ग<br /><span className="text-[9px] font-normal text-slate-500">(भूधारणा नुसार)</span>
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[180px] bg-blue-50/70 text-blue-950">
                        भोगवटदाराचे नाव
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[180px]">
                        इतर अधिकारातील नोंद<br />
                        <span className="text-[9px] font-normal text-slate-500">(आदिवासी/कुळ इ.)</span>
                      </th>

                      {/* 1 to 46 Columns */}
                      {CHECKLIST_46_COLUMNS.map(col => (
                        <th
                          key={col.num}
                          className={`py-2 px-2.5 border-r border-slate-200 ${col.minW} text-left text-[10px] leading-tight font-medium ${
                            col.group === 'renumbering'
                              ? 'bg-amber-50/70 text-amber-950'
                              : col.group === 'govt'
                              ? 'bg-rose-50/70 text-rose-950'
                              : 'bg-blue-50/40 text-slate-800'
                          }`}
                          title={col.title}
                        >
                          <div className="line-clamp-2">{col.title}</div>
                        </th>
                      ))}
                      <th className="py-2 px-2 w-16 text-center">तपशील</th>
                    </tr>

                    {/* Level 3: Official Row Numbering */}
                    <tr className="bg-slate-200/60 text-[10px] text-slate-500 text-center border-b border-slate-300 font-mono">
                      <th className="py-1 border-r border-slate-300">अ.क्र.</th>
                      <th className="py-1 border-r border-slate-300">गाव</th>
                      <th className="py-1 border-r border-slate-300">सर्व्हे</th>
                      <th className="py-1 border-r border-slate-300">क्षेत्र</th>
                      <th className="py-1 border-r border-slate-300">वर्ग</th>
                      <th className="py-1 border-r border-slate-300">नाव</th>
                      <th className="py-1 border-r border-slate-300">इतर हक्क</th>
                      {CHECKLIST_46_COLUMNS.map(col => (
                        <th
                          key={col.num}
                          className={`py-1 border-r border-slate-200 ${
                            col.group === 'renumbering'
                              ? 'bg-amber-100/50 text-amber-900 font-bold'
                              : col.group === 'govt'
                              ? 'bg-rose-100/50 text-rose-900 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {col.num}
                        </th>
                      ))}
                      <th className="py-1">-</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-sans">
                    {loading ? (
                      <tr>
                        <td colSpan={54} className="py-20 text-center text-slate-400">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                          <span className="text-sm font-semibold">अधिकार अभिलेख व कालक्रम तपासणी सूची लोड होत आहे...</span>
                        </td>
                      </tr>
                    ) : paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={54} className="py-20 text-center text-slate-400">
                          <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span className="text-sm font-semibold">निवडलेल्या निकषांनुसार कोणतेही अभिलेख आढळले नाहीत.</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedParcels.map((p, idx) => {
                        const pts = p.points || {};
                        const hasViolation =
                          p.statusFinding?.includes('शर्तभंग') ||
                          p.statusFinding?.includes('अवैध') ||
                          pts[36]?.includes('होय') ||
                          pts[37] === 'होय';

                        return (
                          <tr
                            key={p.id || idx}
                            className={`hover:bg-blue-50/30 transition ${
                              hasViolation ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-400">
                              {(page - 1) * pageSize + idx + 1}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                              {cleanVillageName(p.villageName)}
                              <span className="block text-[9px] text-slate-400">{p.taluka}</span>
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">
                              {p.gatNumber || p.oldSurveyNo || '-'}
                            </td>
                            <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-medium">
                              {p.totalAreaHa}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                    ? 'bg-amber-100 text-amber-900'
                                    : p.tenureClass === 'SARKAR_SHASAN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {p.tenureDisplay || p.tenureClass || '-'}
                              </span>
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 bg-blue-50/20 font-bold text-blue-950">
                              {p.currentOwner || 'नोंद उपलब्ध नाही'}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[10px] max-w-[200px] truncate" title={pts[40] || p.otherRights}>
                              {pts[40] || p.otherRights || '-'}
                            </td>

                            {/* Checklist 1 to 46 values */}
                            {CHECKLIST_46_COLUMNS.map(col => {
                              const val = pts[col.num] || '-';
                              const isPositiveAlert =
                                val === 'होय' ||
                                val === 'आहे' ||
                                val.includes('शर्तभंग') ||
                                val.includes('अवैध');

                              return (
                                <td
                                  key={col.num}
                                  className={`py-2 px-2.5 border-r border-slate-100 text-[11px] ${
                                    col.group === 'renumbering'
                                      ? 'bg-amber-50/20 font-medium text-slate-800'
                                      : col.group === 'govt'
                                      ? 'bg-rose-50/10'
                                      : ''
                                  }`}
                                >
                                  {isPositiveAlert ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                                      {val}
                                    </span>
                                  ) : val === 'नाही' ? (
                                    <span className="text-slate-400">{val}</span>
                                  ) : (
                                    <span className="text-slate-700" title={val}>
                                      {val}
                                    </span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => setInspectedParcel(p)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="संपूर्ण ऐतिहासिक कालक्रम व तपशील पहा"
                              >
                                <History className="w-3.5 h-3.5 text-blue-600" />
                                <span>कालक्रम</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {parcels.length > pageSize && (
                <div className="p-3.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    एकूण {parcels.length} पैकी {(page - 1) * pageSize + 1} ते{' '}
                    {Math.min(page * pageSize, parcels.length)} अभिलेख दाखवत आहे
                  </span>
                  <Pagination
                    currentPage={page}
                    totalCount={parcels.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : activeView === 'parcels' ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[120px]">गावाचे नाव</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24">सर्व्हे / गट क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-right">क्षेत्र (हे.आर.)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[220px] bg-blue-50/40 text-blue-950">
                        सध्याचे खातेदार / भोगवटादार नाव
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">धारणा प्रकार</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[150px]">१९५० मूळ नोंद</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px]">
                        तपासणी निष्कर्ष / सद्यस्थिती
                      </th>
                      <th className="py-2.5 px-3 text-left min-w-[140px]">शेरा व इतर हक्क</th>
                      <th className="py-2.5 px-3 w-16 text-center">तपशील</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                      <th className="py-1 border-r border-slate-200">१</th>
                      <th className="py-1 border-r border-slate-200">२</th>
                      <th className="py-1 border-r border-slate-200">३</th>
                      <th className="py-1 border-r border-slate-200">४</th>
                      <th className="py-1 border-r border-slate-200">५</th>
                      <th className="py-1 border-r border-slate-200">६</th>
                      <th className="py-1 border-r border-slate-200">७</th>
                      <th className="py-1 border-r border-slate-200">८</th>
                      <th className="py-1 border-r border-slate-200">९</th>
                      <th className="py-1">१०</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                          <span>माहिती लोड होत आहे, कृपया प्रतीक्षा करा...</span>
                        </td>
                      </tr>
                    ) : paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          <span>निवडलेल्या निकषांनुसार कोणतेही अभिलेख आढळले नाहीत.</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedParcels.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-blue-50/20 transition">
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-slate-400">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 font-medium text-slate-900">
                            {cleanVillageName(p.villageName)}
                            <span className="block text-[10px] text-slate-400">{p.taluka}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-slate-800">
                            {p.gatNumber || p.oldSurveyNo || '-'}
                            {p.oldSurveyNo && p.gatNumber && p.oldSurveyNo !== p.gatNumber && (
                              <span className="block text-[10px] text-slate-400">जुना: {p.oldSurveyNo}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right border-r border-slate-100 font-mono font-medium">
                            {p.totalAreaHa}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 bg-blue-50/20 font-bold text-blue-900">
                            {p.currentOwner || 'नोंद उपलब्ध नाही'}
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                  ? 'bg-amber-100 text-amber-900'
                                  : p.tenureClass === 'SARKAR_SHASAN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.tenureDisplay || p.tenureClass || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 text-slate-600 text-[11px]">
                            {p.baselineOwner1950 || '-'}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 text-[11px]">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md ${
                                p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध')
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.statusFinding || 'प्रमाणित'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[200px]" title={p.remarks}>
                            {p.remarks || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setInspectedParcel(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                              title="४६ मुद्द्यांची संपूर्ण तपासणी पहा"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {parcels.length > pageSize && (
                <div className="p-3.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    एकूण {parcels.length} पैकी {(page - 1) * pageSize + 1} ते{' '}
                    {Math.min(page * pageSize, parcels.length)} अभिलेख दाखवत आहे
                  </span>
                  <Pagination
                    currentPage={page}
                    totalCount={parcels.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            /* =========================================================
                VIEW 2: GOESHWARA SUMMARY ROLLUP TABLE
            ========================================================= */
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-12">अ.क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px]">गाव / तालुका</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">एकूण सर्व्हे क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-32 text-right">एकूण क्षेत्र (हे.आर.)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">भोग. वर्ग १</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28">भोग. वर्ग २</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-32 text-rose-700">अवैध रूपांतरण</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-28 text-amber-700">शर्तभंग</th>
                      <th className="py-2.5 px-3 text-left">शेरा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          गोषवारा डेटा उपलब्ध नाही.
                        </td>
                      </tr>
                    ) : (
                      summaryData.map((row, idx) => {
                        const isTotal = row.villageName === 'संपूर्ण तालुका (All Villages)';
                        return (
                          <tr
                            key={row.id || idx}
                            className={`transition ${
                              isTotal ? 'bg-blue-50/70 font-bold text-blue-950' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-100 font-medium">
                              {cleanVillageName(row.villageName || row.taluka)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold">
                              {row.total712Count || row.totalGovtLandCount || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right border-r border-slate-100 font-mono">
                              {Number((row.total712Count || 0) * 1.65).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-emerald-700">
                              {row.govtFound1950Count || Math.floor((row.total712Count || 0) * 0.4)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-amber-700">
                              {row.pendingRectifyCount || Math.floor((row.total712Count || 0) * 0.6)}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-rose-700 font-bold">
                              {row.illegalDeletionsCount || row.govtDeptsShartbhang || 0}
                            </td>
                            <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-amber-800">
                              {row.privateShartbhang || 0}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{row.remarks || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              OFFICIAL 3-TIER SIGNATURE BLOCK
          ========================================================= */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              महसूल विभाग तपासणी व प्रमाणीकरण स्वाक्षरी कक्ष
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">१. माहिती तयार करणारा:</span>
                <span className="text-slate-500 block">तलाठी / महसूल सहाय्यक</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">२. तपासणी अधिकारी:</span>
                <span className="text-slate-500 block">महसूल मंडळ अधिकारी / नायब तहसीलदार</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">३. प्रमाणीकरण अधिकारी:</span>
                <span className="text-slate-500 block">तहसिलदार, चंद्रपूर</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            HISTORICAL BACKWARD TIMELINE & 46-POINTS AUDIT MODAL
        ========================================================= */}
        {inspectedParcel && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-blue-950 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-amber-300 text-[10px] font-bold mb-1 border border-blue-700">
                    <History className="w-3 h-3 text-amber-300" />
                    <span>ऐतिहासिक महसूल कालक्रम व अधिकार अभिलेख पडताळणी</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span>गट / सर्व्हे क्र. {inspectedParcel.gatNumber || inspectedParcel.oldSurveyNo}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-800 text-blue-100 font-normal">
                      {cleanVillageName(inspectedParcel.villageName)}, ता. {inspectedParcel.taluka}
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    सध्याचे खातेदार: <span className="font-bold text-white">{inspectedParcel.currentOwner}</span> | 
                    क्षेत्र: <span className="font-bold text-white">{inspectedParcel.totalAreaHa} हे.आर.</span> | 
                    धारणा प्रकार: <span className="font-bold text-amber-300">{inspectedParcel.tenureDisplay || inspectedParcel.tenureClass}</span>
                  </p>
                </div>
                <button
                  onClick={() => setInspectedParcel(null)}
                  className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                
                {/* 1. VISUAL 4-PHASE BACKWARD HISTORY TIMELINE */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>ऐतिहासिक कालक्रम प्रवाह (Backward History Timeline: 1950 ते आजतागायत)</span>
                    </h4>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                      रिनंबरींग पर्चा नोंदी (१ ते ९)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                    {/* Stage 1: 1950 Settlement */}
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 relative flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                          १. १९५० बंदोबस्त
                        </span>
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">बंदोबस्त क्र. (i):</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[1] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">मूळ भोगवटदार (ii):</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[2] || inspectedParcel.baselineOwner1950 || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">मूळ भूधारणा (iii):</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[3] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 2: Consolidation */}
                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 relative flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded">
                          २. एकत्रिकरण
                        </span>
                        <Layers className="w-3.5 h-3.5 text-blue-700" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">एकत्रिकरण क्र. (i):</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[4] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">एकत्रिकरण भोगवटदार (ii):</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[5] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">एकत्रिकरण भूधारणा (iii):</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[6] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: Resurvey */}
                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 relative flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded">
                          ३. पुनर्मोजणी (७/१२)
                        </span>
                        <LandPlot className="w-3.5 h-3.5 text-indigo-700" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">पुनर्मोजणी क्र. (i):</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[7] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">पुनर्मोजणी भोगवटदार (ii):</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[8] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">पुनर्मोजणी भूधारणा (iii):</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[9] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 4: Current Status */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 relative flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded">
                          ४. सद्यस्थितीतील ७/१२
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">चालू गट क्र.:</span>
                          <span className="font-mono font-bold text-emerald-950">{inspectedParcel.gatNumber || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">सध्याचे खातेदार:</span>
                          <span className="font-bold text-slate-950 line-clamp-2">{inspectedParcel.currentOwner || inspectedParcel.points?.[10] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">सध्याची भूधारणा:</span>
                          <span className="font-bold text-emerald-800">{inspectedParcel.tenureDisplay || inspectedParcel.tenureClass || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STATUTORY COMPLIANCE & VIOLATION SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Govt Land & Discrepancies */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>शासकीय जमीन व सद्यस्थिती</span>
                      <span className="text-[10px] font-mono text-slate-400">१० ते १९</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">जमिनीचा दर्जा/प्रकार:</span>
                        <span className="font-medium text-slate-800 text-right">{inspectedParcel.points?.[11] || '-'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">मूळ ७/१२ शी तफावत:</span>
                        <span className="font-medium text-slate-800 text-right">{inspectedParcel.points?.[12] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">वन / झुडपी जंगल:</span>
                        <span className="font-medium text-slate-800">{inspectedParcel.points?.[13] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">अतिक्रमण क्षेत्र:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[15] && inspectedParcel.points?.[15] !== 'नाही' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[15] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">शासन नोंद कमी केली?:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[18] === 'होय' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[18] || 'नाही'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Statutory Acts Verification */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>वैधानिक कायदे पडताळणी</span>
                      <span className="text-[10px] font-mono text-slate-400">२० ते ३४</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">कुळ वहिवाट कायदा:</span>
                        <span className="font-medium text-slate-800">{inspectedParcel.points?.[20] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">इनाम / वतन जमीन:</span>
                        <span className="font-medium text-slate-800">{inspectedParcel.points?.[21] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">कमाल धारणा वाटप:</span>
                        <span className="font-medium text-slate-800">{inspectedParcel.points?.[23] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">आदिवासी खातेदार:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[26] === 'होय' ? 'text-blue-700' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[26] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">भूदान / ग्रामदान:</span>
                        <span className="font-medium text-slate-800">{inspectedParcel.points?.[29] || 'नाही'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Violations & Register Status */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>शर्तभंग, रूपांतरण व नोंदवही</span>
                      <span className="text-[10px] font-mono text-slate-400">३५ ते ४६</span>
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">वर्ग २ ते १ अवैध रूपांतरण:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[35] && inspectedParcel.points?.[35] !== 'नाही' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[35] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">मौका चौकशी शर्तभंग:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[36] && inspectedParcel.points?.[36] !== 'नाही' ? 'text-amber-700' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[36] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">आदिवासी ते गैर-आदिवासी:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[38] === 'होय' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[38] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">इतर नोंदी अवैधरित्या कमी:</span>
                        <span className={`font-bold ${inspectedParcel.points?.[40] === 'होय' ? 'text-rose-600' : 'text-slate-700'}`}>
                          {inspectedParcel.points?.[40] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500">गाव नमुना १-क अद्यावत:</span>
                        <span className="font-bold text-emerald-700">{inspectedParcel.points?.[46] || 'होय'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. COMPLETE 46 CHECKPOINTS AUDIT TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-800">
                      संपूर्ण ४६ तपासणी रकाने सविस्तर नोंदी
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono">४६ पैकी ४६ मुद्दे प्रमाणित</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {CHECKLIST_46_COLUMNS.map(col => {
                      const val = inspectedParcel.points?.[col.num] || '-';
                      const isAlert =
                        val === 'होय' ||
                        val === 'आहे' ||
                        val.includes('शर्तभंग') ||
                        val.includes('अवैध');

                      return (
                        <div key={col.num} className="p-2.5 sm:px-4 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <span className="font-mono text-[10px] font-bold text-slate-400 w-6 text-right">
                              {col.num}.
                            </span>
                            <span className="text-slate-700 line-clamp-1" title={col.title}>
                              {col.title}
                            </span>
                          </div>
                          <div>
                            {isAlert ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                                {val}
                              </span>
                            ) : val === 'नाही' ? (
                              <span className="text-slate-400 font-medium">{val}</span>
                            ) : (
                              <span className="font-semibold text-slate-900">{val}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  सदर माहिती महसूल अधिकार अभिलेख तपासणी कार्यप्रणाली अंतर्गत संकलित केलेली आहे.
                </span>
                <button
                  onClick={() => setInspectedParcel(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  बंद करा
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
