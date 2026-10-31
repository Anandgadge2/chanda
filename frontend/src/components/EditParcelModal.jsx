'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  Hash,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  MapPin,
  LandPlot,
  Scale,
  AlertTriangle,
  Building2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from './LanguageContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { formatVillageName } from '../lib/villageUtils';

export const TENURE_OPTIONS = [
  {
    value: 'BHOGVATDAR_CLASS_1',
    labelMr: 'भोगवटादार वर्ग-१ (खाजगी/विनामूल्य)',
    labelEn: 'Occupant Class-1 (Freehold)',
    label: 'भोगवटादार वर्ग-१ (Class-1 Freehold)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    descriptionMr: 'पूर्ण मालकी हक्क, विनामूल्य धारणाधिकार, खाजगी विक्री अनुज्ञेय.',
    descriptionEn: 'Full ownership rights, freehold tenure, private alienation permitted.',
  },
  {
    value: 'BHOGVATDAR_CLASS_2',
    labelMr: 'भोगवटादार वर्ग-२ (शर्तभंग/प्रतिबंधित)',
    labelEn: 'Occupant Class-2 (Restricted)',
    label: 'भोगवटादार वर्ग-२ (Class-2 Restricted)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    descriptionMr: 'शर्तयुक्त धारणाधिकार: सक्षम प्राधिकाऱ्याच्या (SDO/Collector) पूर्वपरवानगीशिवाय हस्तांतरण अमान्य.',
    descriptionEn: 'Restricted tenure: requires prior sanction from SDO/Collector for transfer.',
  },
  {
    value: 'SARKAR_SHASAN',
    labelMr: 'महाराष्ट्र शासन / शासकीय जमीन',
    labelEn: 'Government / State Land',
    label: 'महाराष्ट्र शासन / शासकीय जमीन (Govt Land)',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    descriptionMr: 'महाराष्ट्र शासनाकडे निहित (गायराण, नदीपात्र, ई-क्लास). खाजगी व्यक्तीस विक्रीस पूर्ण बंदी.',
    descriptionEn: 'Vested in State Government (Gairan, riverbed, public purpose). Strict ban on private sale.',
  },
  {
    value: 'DEVASTHAN_INAM',
    labelMr: 'देवस्थान / इनाम जमीन',
    labelEn: 'Devasthan / Inam Land',
    label: 'देवस्थान / इनाम जमीन (Devasthan / Inam)',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    descriptionMr: 'धार्मिक न्यास किंवा सेवा इनाम जमीन, हस्तांतरणास विशेष कायदेशीर निर्बंध.',
    descriptionEn: 'Religious trust or Inam land with statutory transfer restrictions.',
  },
  {
    value: 'FOREST_JANGAL',
    labelMr: 'राखीव वन / झुडपी जंगल',
    labelEn: 'Reserved Forest / Scrub Forest',
    label: 'राखीव वन / झुडपी जंगल (Forest Land)',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    descriptionMr: 'राखीव व संरक्षित वनजमीन (Forest Conservation Act अंतर्गत नियंत्रित).',
    descriptionEn: 'Reserved and protected forest land governed by Forest Conservation laws.',
  },
];

// 16 Official Statutory Sub-types per client's DROPDOWN & Sub-type Sheet
export const STATUTORY_SUB_TYPES = [
  { id: 1, nameMr: '१. कुळ वहिवाट व शेतजमीन (विदर्भ/हैदराबाद) कायदा अन्वये कुळ घोषित केलेली जमीन' },
  { id: 2, nameMr: '२. इनाम व वतन जमिनी (देवस्थान जमिनी वगळून) प्रकारातील जमिनी' },
  { id: 3, nameMr: '३. म.ज.म.अधि. १९६६ भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिक प्रदान/अतिक्रमण नियमानुकूल' },
  { id: 4, nameMr: '४. म.ज.म.अधि. १९६६ गृहनिर्माण, औद्योगिक, शैक्षणिक, प्रकल्प आस्थापना प्रदान जमीन' },
  { id: 5, nameMr: '५. महाराष्ट्र शेतजमीन कमाल धारणा अधिनियम १९६१ अंतर्गत वाटप केलेल्या जमिनी' },
  { id: 6, nameMr: '६. विकास आराखडा समाविष्ट अथवा ग्रामपंचायतकडे गुरचरण/इतर प्रयोजनासाठी वर्ग जमिनी' },
  { id: 7, nameMr: '७. जमीन देवस्थान इनाम जमिनी' },
  { id: 8, nameMr: '८. आदिवासी खातेदारांचे मालकीच्या जमिनी (कलम ३६/३६अ)' },
  { id: 9, nameMr: '९. महाराष्ट्र पुनर्वसन अधिनियम १९९९ च्या कलम १६ अन्वये प्रदान केलेल्या जमिनी' },
  { id: 10, nameMr: '१०. भाडेपट्ट्याने दिलेली शासकीय जमीन' },
  { id: 11, nameMr: '११. भूदान व ग्रामदान अंतर्गत प्रदान केलेल्या जमिनी' },
  { id: 12, nameMr: '१२. महाराष्ट्र खाजगी वने (संपादन) १९७५ व कमाल मर्यादा चौकशी प्रलंबित जमीन' },
  { id: 13, nameMr: '१३. भूमीधारी हक्कान्वये प्राप्त झालेल्या जमिनी' },
  { id: 14, nameMr: '१४. कमाल मर्यादेपेक्षा अधिक जमीन धारण करण्यास विशेष सूट दिलेल्या जमिनी' },
  { id: 15, nameMr: '१५. वक्फ बोर्डाचे मालकीची जमीन' },
  { id: 16, nameMr: '१६. भूसंपादन कायद्यांतर्गत अधिग्रहित / राखीव जमीन' },
  { id: 17, nameMr: '१७. सामान्य / इतर खाजगी कृषक जमीन' },
  { id: 18, nameMr: '१८. कुळ कायद्याचे कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन' }
];

const EPOCH_OPTIONS = [
  {
    yr: '1950',
    titleMr: '१. १९५० बंदोबस्त नोंद',
    titleEn: '1. 1950 Settlement',
    subtitleMr: 'स्वातंत्र्योत्तर मूळ अभिलेख (1950 Baseline)',
    subtitleEn: 'Post-Independence 1950 Baseline Record',
    defaultMutation: 'मूळ बंदोबस्त नोंद',
  },
  {
    yr: '1972',
    titleMr: '२. एकत्रिकरण नोंद',
    titleEn: '2. Consolidation Scheme',
    subtitleMr: 'जमीन एकत्रिकरण योजना (~१९७२ Consolidation)',
    subtitleEn: 'Land Consolidation Scheme (~1972)',
    defaultMutation: 'एकत्रिकरण योजना फेरफार',
  },
  {
    yr: '1995',
    titleMr: '३. पुनर्मोजणी ७/१२ नोंद',
    titleEn: '3. Resurvey 7/12 Record',
    subtitleMr: 'पुनर्मोजणी अधिकार अभिलेख (~१९९५ Resurvey)',
    subtitleEn: 'Resurvey Record of Rights (~1995)',
    defaultMutation: 'पुनर्मोजणी अधिकार नोंद',
  },
];

export default function EditParcelModal({ isOpen, onClose, parcel, onUpdateSuccess }) {
  const { isMarathi } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const trapRef = useFocusTrap(isOpen);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'timeline' | 'audit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  // Form State for Current 7/12
  const [ownerName, setOwnerName] = useState('');
  const [tenureClass, setTenureClass] = useState('BHOGVATDAR_CLASS_2');
  const [agriAreaHa, setAgriAreaHa] = useState('0.0000');
  const [naAreaSqM, setNaAreaSqM] = useState('0.00');
  const [totalAreaHa, setTotalAreaHa] = useState('0.0000');
  const [potkharabaAreaHa, setPotkharabaAreaHa] = useState('0.0000');
  const [oldSurveyNo, setOldSurveyNo] = useState('');
  const [otherRights, setOtherRights] = useState('');
  const [hasActiveDispute, setHasActiveDispute] = useState(false);

  // Form State for Statutory Sub-Type & 46 Checkpoint Audit Points
  const [subTypeCategory, setSubTypeCategory] = useState('');
  const [isShartbhang, setIsShartbhang] = useState(false);
  const [shartbhangDetail, setShartbhangDetail] = useState('');
  const [isClass2To1, setIsClass2To1] = useState(false);
  const [sanctionAuthority, setSanctionAuthority] = useState('');
  const [sanctionOrderNo, setSanctionOrderNo] = useState('');
  const [isIllegalDeletion, setIsIllegalDeletion] = useState(false);
  const [isPokalist, setIsPokalist] = useState(false);
  const [isEncroached, setIsEncroached] = useState(false);
  const [isMojaniDone, setIsMojaniDone] = useState(false);
  const [isTribalTransfer, setIsTribalTransfer] = useState(false);
  const [isForm1KUpdated, setIsForm1KUpdated] = useState(true);

  // Form State for Backward Timeline Milestone
  const [selectedEpochYear, setSelectedEpochYear] = useState('1950');
  const [epochOwner, setEpochOwner] = useState('');
  const [epochTenure, setEpochTenure] = useState('BHOGVATDAR_CLASS_1');
  const [epochFerfar, setEpochFerfar] = useState('');
  const [epochKhata, setEpochKhata] = useState('');
  const [epochAreaHa, setEpochAreaHa] = useState('');
  const [epochMutationType, setEpochMutationType] = useState('');
  const [epochWasGovtLand, setEpochWasGovtLand] = useState(false);
  const [epochRemarks, setEpochRemarks] = useState('');

  // Auto calculate total area when agri or na changes
  const handleAgriChange = (val) => {
    setAgriAreaHa(val);
    const agri = parseFloat(val) || 0;
    const na = parseFloat(naAreaSqM) || 0;
    setTotalAreaHa(String(Math.round((agri + (na / 10000.0)) * 10000) / 10000));
  };

  const handleNaChange = (val) => {
    setNaAreaSqM(val);
    const agri = parseFloat(agriAreaHa) || 0;
    const na = parseFloat(val) || 0;
    setTotalAreaHa(String(Math.round((agri + (na / 10000.0)) * 10000) / 10000));
  };

  // Helper to load epoch data for a specific year
  const loadEpochData = (yr, p) => {
    if (!p) return;
    const yearInt = parseInt(yr, 10);
    const existing = p.backwardHistories?.find((b) => b.epochYear === yearInt);

    if (existing) {
      setEpochOwner(existing.ownerName || '');
      setEpochTenure(existing.tenureClass || 'BHOGVATDAR_CLASS_1');
      setEpochFerfar(existing.ferfarNumber || '');
      setEpochKhata(existing.khataNumber || '');
      setEpochAreaHa(existing.areaHa != null ? String(Number(existing.areaHa).toFixed(4)) : (p.totalAreaHa ? String(p.totalAreaHa) : ''));
      setEpochMutationType(existing.mutationType || '');
      setEpochWasGovtLand(Boolean(existing.wasGovtLand || existing.tenureClass === 'SARKAR_SHASAN'));
      setEpochRemarks(existing.remarks || '');
    } else {
      const defaultOwner = yearInt === 1950 ? (p.baselineOwner1950 || '') : '';
      setEpochOwner(defaultOwner);
      setEpochTenure(yearInt === 1950 ? 'BHOGVATDAR_CLASS_1' : (p.tenureClass || 'BHOGVATDAR_CLASS_1'));
      setEpochFerfar(yearInt === 1950 ? 'F-1' : `F-${yr}`);
      setEpochKhata(yearInt === 1950 ? 'K-1' : `K-${yr}`);
      setEpochAreaHa(p.totalAreaHa ? String(p.totalAreaHa) : '');
      const defaultEpoch = EPOCH_OPTIONS.find((ep) => ep.yr === yr);
      setEpochMutationType(defaultEpoch?.defaultMutation || 'अधिकार अभिलेख नोंद');
      setEpochWasGovtLand(false);
      setEpochRemarks('');
    }
  };

  // Sync state when modal opens or parcel changes
  useEffect(() => {
    if (parcel && isOpen) {
      const meta = parcel.metadata || {};
      const flags = meta.flags || {};
      const audit = meta.auditPoints || {};

      setOwnerName(meta.ownerName || parcel.ownerName || parcel.currentOwner || '');
      setTenureClass(parcel.tenureClass || 'BHOGVATDAR_CLASS_2');
      setAgriAreaHa(meta.agriAreaHa != null ? String(meta.agriAreaHa) : String(parcel.totalAreaHa || '0.0000'));
      setNaAreaSqM(meta.naAreaSqM != null ? String(meta.naAreaSqM) : '0.00');
      setTotalAreaHa(String(parcel.totalAreaHa || '0.0000'));
      setPotkharabaAreaHa(String(parcel.potkharabaAreaHa || '0.0000'));
      setOldSurveyNo(parcel.oldSurveyNo || '');
      setOtherRights(meta.otherRights || parcel.otherRights || '');
      setHasActiveDispute(Boolean(parcel.hasActiveDispute));

      // Sub-type & 46 points audit
      setSubTypeCategory(meta.subTypeCategory || STATUTORY_SUB_TYPES[0].nameMr);
      setIsShartbhang(Boolean(flags.isShartbhang || audit.point_37 === 'होय'));
      setShartbhangDetail(audit.point_38 || '');
      setIsClass2To1(Boolean(flags.isClass2ToClass1 || audit.point_36 === 'होय'));
      setSanctionAuthority(audit.point_36_authority || '');
      setSanctionOrderNo(audit.point_36_order || '');
      setIsIllegalDeletion(Boolean(flags.isIllegalDeletion || audit.point_18 === 'होय'));
      setIsPokalist(Boolean(flags.isPokalist || audit.point_19 === 'होय'));
      setIsEncroached(Boolean(flags.isEncroached || audit.point_15 === 'आहे'));
      setIsMojaniDone(Boolean(flags.isMojaniDone || audit.point_16 === 'आहे'));
      setIsTribalTransfer(Boolean(flags.isTribal && (audit.point_39 === 'होय' || audit.point_40 === 'होय')));
      setIsForm1KUpdated(audit.point_46 !== 'नाही');

      loadEpochData(selectedEpochYear, parcel);
      setError(null);
      setSuccessMsg(null);
    }
  }, [parcel, isOpen]);

  const handleEpochSelect = (yr) => {
    setSelectedEpochYear(yr);
    loadEpochData(yr, parcel);
  };

  if (!isOpen || !parcel) return null;

  const selectedTenureConfig = TENURE_OPTIONS.find((opt) => opt.value === tenureClass) || TENURE_OPTIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const calcTotal = Math.round(((parseFloat(agriAreaHa) || 0) + ((parseFloat(naAreaSqM) || 0) / 10000.0)) * 10000) / 10000;

      const payload = {
        ownerName: ownerName.trim(),
        tenureClass,
        agriAreaHa: parseFloat(agriAreaHa) || 0,
        naAreaSqM: parseFloat(naAreaSqM) || 0,
        totalAreaHa: calcTotal || parseFloat(totalAreaHa) || 0,
        potkharabaAreaHa: parseFloat(potkharabaAreaHa) || 0,
        oldSurveyNo: oldSurveyNo.trim() || undefined,
        otherRights: otherRights.trim(),
        hasActiveDispute,
        subTypeCategory,
        flags: {
          isShartbhang,
          isClass2ToClass1: isClass2To1,
          isIllegalDeletion,
          isPokalist,
          isEncroached,
          isMojaniDone,
          isGovt: tenureClass === 'SARKAR_SHASAN',
          isTribal: otherRights.includes('आदिवासी') || subTypeCategory.includes('आदिवासी')
        },
        auditPoints: {
          point_10: ownerName.trim(),
          point_15: isEncroached ? 'आहे' : 'नाही',
          point_16: isMojaniDone ? 'आहे' : 'नाही',
          point_18: isIllegalDeletion ? 'होय' : 'नाही',
          point_19: isPokalist ? 'होय' : 'नाही',
          point_36: isClass2To1 ? (sanctionOrderNo ? `होय (${sanctionAuthority} आदेश क्र. ${sanctionOrderNo})` : 'होय') : 'नाही',
          point_36_authority: sanctionAuthority.trim(),
          point_36_order: sanctionOrderNo.trim(),
          point_37: isShartbhang ? (shartbhangDetail ? `होय (${shartbhangDetail})` : 'होय') : 'नाही',
          point_38: shartbhangDetail.trim(),
          point_46: isForm1KUpdated ? 'होय' : 'नाही'
        }
      };

      // If violation flagged, sync forward enforcement case
      if (isShartbhang || isEncroached || isIllegalDeletion || isPokalist) {
        let vType = 'SHARTBHANG';
        if (isEncroached) vType = 'ENCROACHMENT';
        else if (isIllegalDeletion) vType = 'GOVERNMENT_NAME_MISSING';
        else if (isPokalist) vType = 'POKALIST_NONDI';

        payload.forwardCaseUpdate = {
          violationType: vType,
          status: 'FLAGGED_IN_AUDIT',
          occupantName: ownerName.trim(),
          encroachedAreaHa: calcTotal || parseFloat(totalAreaHa) || 0,
          prapatraCategory: isShartbhang ? 'शर्तभंग चौकशी' : 'अतिक्रमण / गैरकायदेशीर फेरफार'
        };
      }

      // If user edited backward timeline
      if (epochOwner.trim()) {
        payload.backwardHistoryUpdate = {
          epochYear: parseInt(selectedEpochYear, 10),
          ownerName: epochOwner.trim(),
          tenureClass: epochTenure,
          ferfarNumber: epochFerfar.trim(),
          khataNumber: epochKhata.trim(),
          areaHa: parseFloat(epochAreaHa) || calcTotal || 0,
          mutationType: epochMutationType.trim() || undefined,
          wasGovtLand: Boolean(epochWasGovtLand || epochTenure === 'SARKAR_SHASAN'),
          remarks: epochRemarks.trim(),
        };
      }

      await api.updateParcel(parcel.upi, payload);
      setSuccessMsg(
        isMarathi
          ? 'अभिलेख, ४६ तपासणी मुद्दे व गोषवारा यशस्वीरीत्या अद्ययावत करण्यात आला.'
          : 'Parcel record, 46 audit checkpoints & village rollups updated successfully.'
      );

      setTimeout(() => {
        if (onUpdateSuccess) onUpdateSuccess(payload);
        onClose();
      }, 1100);
    } catch (err) {
      setError(err.message || (isMarathi ? 'अभिलेख दुरुस्ती अयशस्वी झाली.' : 'Failed to update parcel records.'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen || !parcel) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-parcel-modal-title"
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/30 border border-slate-200/90 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* National Tricolor Micro Accent Line (Portal Theme) */}
        <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shrink-0" />

        {/* Header - Portal Theme */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 id="edit-parcel-modal-title" className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                {isMarathi ? 'अभिलेख, तपासणी मुद्दे व कालक्रम दुरुस्ती' : 'Edit Parcel, 46-Point Audit & Timeline'}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {formatVillageName(parcel.villageName, isMarathi)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200/70 font-bold text-[11px]">
                  {isMarathi ? 'गट क्र.' : 'Gat No.'} {parcel.gatNumber}
                </span>
                {parcel.upi && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[10px] sm:text-[11px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
                      {parcel.upi}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer shrink-0 border border-slate-200/60"
            title={isMarathi ? 'बंद करा' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Tab Switcher - Responsive & Touch-friendly */}
        <div className="flex border-b border-slate-200/90 px-3 sm:px-6 bg-slate-50/70 gap-1.5 sm:gap-3 pt-2 overflow-x-auto no-scrollbar touch-scroll shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`pb-2.5 pt-1.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 rounded-t-lg ${
              activeTab === 'current'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <LandPlot className="w-4 h-4 shrink-0" />
            <span>{isMarathi ? '१. सद्यस्थितीतील ७/१२' : '1. Current 7/12'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 pt-1.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 rounded-t-lg ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>{isMarathi ? '२. तपासणी मुद्दे व वैधानिक उपप्रकार' : '2. 46 Audit Checkpoints & Category'}</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
              १६ उपप्रकार
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 pt-1.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 rounded-t-lg ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>{isMarathi ? '३. ऐतिहासिक कालक्रम (1950-1995)' : '3. Historical Timeline'}</span>
          </button>
        </div>

        {/* Form with flex-1 and min-h-0 so it doesn't push the footer off screen */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 bg-white">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{isMarathi ? 'त्रुटी:' : 'Error:'}</span> {error}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: CURRENT 7/12 (Dual Area Support) */}
            {activeTab === 'current' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                    {isMarathi ? 'भोगवटदाराचे नाव (सद्यस्थितीतील ७/१२ प्रमाणे)' : 'Current 7/12 Landholder / Occupant Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium transition placeholder:text-slate-400"
                    placeholder={isMarathi ? 'उदा. प्रशांत बाबा लिहितकर व इतर' : 'e.g. Prashant Baba Lihitkar and others'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                      {isMarathi ? 'भोगवटदार वर्ग (भूधारणा नुसार)' : 'Tenure Class'} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={tenureClass}
                      onChange={(e) => setTenureClass(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium cursor-pointer"
                    >
                      {TENURE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isMarathi ? opt.labelMr : `${opt.labelEn} — ${opt.labelMr}`}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{isMarathi ? selectedTenureConfig.descriptionMr : selectedTenureConfig.descriptionEn}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isMarathi ? 'जुना सर्व्हे क्रमांक (Old Survey No)' : 'Old Survey Number'}
                    </label>
                    <input
                      type="text"
                      value={oldSurveyNo}
                      onChange={(e) => setOldSurveyNo(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono transition placeholder:text-slate-400"
                      placeholder={isMarathi ? 'उदा. 12/1 किंवा 45' : 'e.g. 12/1 or 45'}
                    />
                  </div>
                </div>

                {/* DUAL AREA INPUTS (कृषक हे.आर. + अकृषक आर चौ.मी.) */}
                <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="flex items-center gap-1.5">
                      <LandPlot className="w-4 h-4 text-blue-600 shrink-0" />
                      {isMarathi ? 'जमिनीचे क्षेत्र विभाजन (कृषक व अकृषक)' : 'Land Area Breakdown (Agricultural & Non-Agricultural)'}
                    </span>
                    <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-mono font-medium">
                      {isMarathi ? 'एकूण क्षेत्र स्वयंचलित' : 'Total Area Auto-calculated'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'कृषक क्षेत्र (हेक्टर.आर)' : 'Agricultural Area (Ha.Are)'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        required
                        value={agriAreaHa}
                        onChange={(e) => handleAgriChange(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                        placeholder="0.0000"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'अकृषक क्षेत्र (आर चौ.मी)' : 'Non-Agricultural Area (R.Sq.M)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={naAreaSqM}
                        onChange={(e) => handleNaChange(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 mb-1">
                        {isMarathi ? 'एकूण क्षेत्र (हेक्टर मध्ये)' : 'Total Computed Area (Ha)'}
                      </label>
                      <div className="w-full h-[38px] px-3 bg-blue-50/80 border border-blue-200/90 rounded-lg flex items-center justify-between font-mono">
                        <span className="text-xs sm:text-sm font-bold text-blue-950">{totalAreaHa}</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Ha</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'पोटखराबा क्षेत्र (हेक्टर मध्ये)' : 'Potkharaba Area (Ha)'}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={potkharabaAreaHa}
                      onChange={(e) => setPotkharabaAreaHa(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                      placeholder="0.0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {isMarathi ? 'इतर अधिकारातील नोंद (कुळ, आदिवासी, बोजा, लीज इ.)' : 'Other Rights Entry (Tenancy, Tribal, Charges, Lease)'}
                  </label>
                  <textarea
                    rows={2}
                    value={otherRights}
                    onChange={(e) => setOtherRights(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400"
                    placeholder={isMarathi ? 'उदा. सक्षम प्राधिकाऱ्यांच्या पूर्व परवानगी शिवाय हस्तांतरास बंदी...' : 'e.g. Alienation barred without sanction of SDO...'}
                  />
                </div>

                <label className="flex items-center gap-3 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl cursor-pointer hover:bg-amber-100/50 transition select-none">
                  <input
                    type="checkbox"
                    id="hasActiveDispute"
                    checked={hasActiveDispute}
                    onChange={(e) => setHasActiveDispute(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-semibold text-amber-950 leading-snug">
                    {isMarathi
                      ? 'सदर जमिनीवर सक्रिय महसूल वाद / न्यायालयीन प्रकरण प्रलंबित आहे (Active Dispute Flag)'
                      : 'Active revenue dispute or court litigation pending for this parcel'}
                  </span>
                </label>
              </div>
            )}

            {/* TAB 2: AUDIT CHECKPOINTS & 16 STATUTORY SUB-TYPES */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                {/* Statutory Sub-Type Dropdown per Client's Sheet 2 & 4 */}
                <div className="p-3.5 sm:p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-indigo-950">
                    <Scale className="w-4 h-4 inline mr-1 text-indigo-600" />
                    {isMarathi ? 'जमिनीचा वैधानिक उपप्रकार (Dropdown Sheet प्रमाणे १६ उपप्रकार)' : 'Statutory Sub-Type Category (Per Dropdown Master)'}
                  </label>
                  <select
                    value={subTypeCategory}
                    onChange={(e) => setSubTypeCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  >
                    {STATUTORY_SUB_TYPES.map((sub) => (
                      <option key={sub.id} value={sub.nameMr}>
                        {sub.nameMr}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-indigo-800 leading-normal">
                    {isMarathi
                      ? 'हा उपप्रकार निवडल्यास हा सर्व्हे नंबर आपोआप संबंधित वैधानिक पुस्तकात (Booklet 1-18) आणि प्रपत्रात वर्गीकृत होईल.'
                      : 'Selecting this sub-type categorizes this parcel into the appropriate statutory booklet (Booklet 1-18) and Prapatra report.'}
                  </p>
                </div>

                {/* Breach of Condition (शर्तभंग) */}
                <div className="p-3.5 sm:p-4 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{isMarathi ? 'मुद्दा ३७: मौका चौकशीअंती शर्तभंग झालेला आहे काय?' : 'Point 37: Has Condition Breach Occurred?'}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                        isShartbhang ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="isShartbhang"
                          checked={isShartbhang}
                          onChange={() => setIsShartbhang(true)}
                          className="text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                        />
                        <span>{isMarathi ? 'होय (Yes)' : 'Yes'}</span>
                      </label>
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                        !isShartbhang ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="isShartbhang"
                          checked={!isShartbhang}
                          onChange={() => setIsShartbhang(false)}
                          className="text-slate-600 focus:ring-slate-500 w-3.5 h-3.5"
                        />
                        <span>{isMarathi ? 'नाही (No)' : 'No'}</span>
                      </label>
                    </div>
                  </div>

                  {isShartbhang && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'शर्तभंगाचा तपशील (वापरात बदल / अनधिकृत हस्तांतरण / गैरकृषक वापर)' : 'Breach Specifics (Change of Use / Unauthorized Transfer / Illegal NA)'}
                      </label>
                      <input
                        type="text"
                        value={shartbhangDetail}
                        onChange={(e) => setShartbhangDetail(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500/20"
                        placeholder={isMarathi ? 'उदा. विनापरवानगी व्यापारी वापर सुरू केला' : 'e.g. Commercial usage without authorization'}
                      />
                    </div>
                  )}
                </div>

                {/* Unauthorized Class-2 to Class-1 Conversion (वर्ग-२ चे वर्ग-१ रूपांतरण) */}
                <div className="p-3.5 sm:p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{isMarathi ? 'मुद्दा ३६: परवानगीशिवाय वर्ग-२ मधून वर्ग-१ मध्ये रूपांतरित झालेली आहे काय?' : 'Point 36: Converted from Class-2 to Class-1 without sanction?'}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                        isClass2To1 ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="isClass2To1"
                          checked={isClass2To1}
                          onChange={() => setIsClass2To1(true)}
                          className="text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                        <span>{isMarathi ? 'होय (Yes)' : 'Yes'}</span>
                      </label>
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                        !isClass2To1 ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="isClass2To1"
                          checked={!isClass2To1}
                          onChange={() => setIsClass2To1(false)}
                          className="text-slate-600 focus:ring-slate-500 w-3.5 h-3.5"
                        />
                        <span>{isMarathi ? 'नाही (No)' : 'No'}</span>
                      </label>
                    </div>
                  </div>

                  {isClass2To1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'सक्षम प्राधिकाऱ्यांचे पदनाम (Collector / SDO)' : 'Sanctioning Authority Designation'}
                        </label>
                        <input
                          type="text"
                          value={sanctionAuthority}
                          onChange={(e) => setSanctionAuthority(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg"
                          placeholder={isMarathi ? 'उदा. उपविभागीय अधिकारी (SDO)' : 'e.g. SDO Warora'}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'आदेश क्रमांक व दिनांक' : 'Order Number & Date'}
                        </label>
                        <input
                          type="text"
                          value={sanctionOrderNo}
                          onChange={(e) => setSanctionOrderNo(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg"
                          placeholder={isMarathi ? 'उदा. महसूल/कावि-४२/२०२१' : 'e.g. REV/ORD/2021/89'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Critical Statutory Checkpoints Toggle Grid - Interactive Labels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isIllegalDeletion ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  }`}>
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {isMarathi ? 'मुद्दा १८: अवैधरीत्या सरकार नोंद कमी केली आहे काय?' : 'Pt 18: Govt name illegally removed?'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isIllegalDeletion}
                      onChange={(e) => setIsIllegalDeletion(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isPokalist ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  }`}>
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {isMarathi ? 'मुद्दा १९: पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे.) आहेत काय?' : 'Pt 19: Hollow non-statutory entries?'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isPokalist}
                      onChange={(e) => setIsPokalist(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isEncroached ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  }`}>
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {isMarathi ? 'मुद्दा १५: जमिनीवर अतिक्रमण आहे काय?' : 'Pt 15: Encroachment present?'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isEncroached}
                      onChange={(e) => setIsEncroached(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isMojaniDone ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  }`}>
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {isMarathi ? 'मुद्दा १६: सदर गटाचे KML तयार केले आहे काय?' : 'Pt 16: KML prepared?'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isMojaniDone}
                      onChange={(e) => setIsMojaniDone(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 sm:col-span-2 cursor-pointer transition select-none ${
                    isForm1KUpdated ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70'
                  }`}>
                    <span className="text-xs font-medium text-slate-800 leading-snug">
                      {isMarathi ? 'मुद्दा ४६: गाव नमुना १-क अद्यावत आहे काय?' : 'Pt 46: Village Form 1-K updated per statutory rules?'}
                    </span>
                    <input
                      type="checkbox"
                      checked={isForm1KUpdated}
                      onChange={(e) => setIsForm1KUpdated(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: HISTORICAL TIMELINE EPOCHS (1950, 1972, 1995) */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    {isMarathi
                      ? 'येथून तुम्ही १९५० मूळ बंदोबस्त नोंद, एकत्रिकरण नोंद (~१९७२), किंवा पुनर्मोजणी नोंद (~१९९५) मधील खातेदार, भूधारणा वर्ग, फेरफार व क्षेत्र थेट दुरुस्त करू शकता.'
                      : 'Inspect and rectify historical landholder, tenure classification, mutation number, and recorded area across 1950, ~1972, and ~1995 records.'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    {isMarathi ? 'दुरुस्ती करावयाचा कालक्रम टप्पा निवडा' : 'Select Timeline Epoch to Rectify'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {EPOCH_OPTIONS.map((ep) => {
                      const isSelected = selectedEpochYear === ep.yr;
                      return (
                        <button
                          key={ep.yr}
                          type="button"
                          onClick={() => handleEpochSelect(ep.yr)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {isMarathi ? ep.titleMr : ep.titleEn}
                          </span>
                          <span className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            {isMarathi ? ep.subtitleMr : ep.subtitleEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isMarathi ? 'नोंदणीकृत खातेदाराचे नाव' : 'Recorded Owner Name'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={epochOwner}
                      onChange={(e) => setEpochOwner(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                      placeholder="उदा. मारोती संबा"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isMarathi ? 'भूधारणा वर्ग (Tenure per Epoch)' : 'Tenure Class'}
                    </label>
                    <select
                      value={epochTenure}
                      onChange={(e) => setEpochTenure(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
                    >
                      {TENURE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isMarathi ? opt.labelMr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'फेरफार क्रमांक' : 'Ferfar No.'}
                    </label>
                    <input
                      type="text"
                      value={epochFerfar}
                      onChange={(e) => setEpochFerfar(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-mono"
                      placeholder="F-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'खाता क्रमांक' : 'Khata No.'}
                    </label>
                    <input
                      type="text"
                      value={epochKhata}
                      onChange={(e) => setEpochKhata(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-mono"
                      placeholder="K-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isMarathi ? 'नोंदणीकृत क्षेत्र (हेक्टर)' : 'Recorded Area (Ha)'}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={epochAreaHa}
                      onChange={(e) => setEpochAreaHa(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-mono"
                      placeholder="0.0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {isMarathi ? 'फेरफार प्रकार / टिप्पणी' : 'Mutation Type / Remarks'}
                  </label>
                  <input
                    type="text"
                    value={epochRemarks}
                    onChange={(e) => setEpochRemarks(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl"
                    placeholder={isMarathi ? 'उदा. मूळ बंदोबस्त अधिकार नोंद' : 'e.g. Baseline Settlement entry'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* PINNED Sticky Form Actions Footer - ALWAYS VISIBLE */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/90 bg-slate-50/90 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pb-safe">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isMarathi ? 'बदल सेव्ह होताच गाव व तालुक्याचा गोषवारा तात्काळ फेरगणती होईल.' : 'Village & taluka rollups auto-recalculated on save.'}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
              >
                {isMarathi ? 'रद्द करा (Cancel)' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isMarathi ? 'बदल जतन करा (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
