'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Crown,
  Scale,
  Briefcase,
  FileCheck2,
  Compass,
  Users2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { useAuth } from '../AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useTranslation } from '../LanguageContext';

/**
 * Official Hierarchy of Revenue Administration (Apex to Grassroots)
 */
const HIERARCHY_OFFICERS = [
  {
    role: 'COLLECTOR',
    rankMr: '१',
    rankEn: '1',
    titleMr: 'जिल्हाधिकारी, चंद्रपूर',
    titleEn: 'District Collector & Magistrate, Chandrapur',
    roleTag: 'Main Authority',
    badgeMr: 'जिल्हाधिकारी (Collector)',
    badgeEn: 'Collector & DM',
    jurisdictionMr: 'संपूर्ण चंद्रपूर जिल्हा (District-wide)',
    jurisdictionEn: 'Entire District Jurisdiction',
    icon: Crown,
    email: 'collector.chandrapur@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'जिल्हा महसूल प्रमुख, अपीलीय अधिकारी व शासन जमा अंतिम आदेश',
    descriptionEn: 'Head of District Administration, Appellate Authority & Final Decrees',
  },
  {
    role: 'SUB_COLLECTOR',
    rankMr: '२',
    rankEn: '2',
    titleMr: 'उपजिल्हाधिकारी (भूसंपादन / महसूल)',
    titleEn: 'Sub-Collector / Additional Collector (HQ)',
    roleTag: 'Headquarters',
    badgeMr: 'उपजिल्हाधिकारी (Sub-Collector)',
    badgeEn: 'Sub-Collector / Addl Collector',
    jurisdictionMr: 'जिल्हा मुख्यालय (Collectorate HQ)',
    jurisdictionEn: 'Collectorate Headquarters',
    icon: Building2,
    email: 'subcollector.chandrapur@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'भूसंपादन, पुनर्वसन, अकृषिक (NA) संनियंत्रण व समन्वय',
    descriptionEn: 'Land Acquisition, Rehabilitation & Non-Agricultural Sanctions',
  },
  {
    role: 'SDO',
    rankMr: '३',
    rankEn: '3',
    titleMr: 'उपविभागीय अधिकारी (SDO), वरोरा',
    titleEn: 'Sub-Divisional Officer (SDO), Warora',
    roleTag: 'Sub-Division',
    badgeMr: 'उपविभागीय अधिकारी (SDO / प्रांत)',
    badgeEn: 'Sub-Divisional Officer (SDO)',
    jurisdictionMr: 'वरोरा उपविभाग (Warora Sub-Division)',
    jurisdictionEn: 'Warora Revenue Sub-Division',
    icon: Scale,
    email: 'sdo.warora@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'अर्ध-न्यायिक न्यायालय (MLRC कलम ३६, ३६अ, ४४, ४५ सुनावणी)',
    descriptionEn: 'Quasi-Judicial Revenue Court (MLRC Sec 36, 36A, 44, 45 Proceedings)',
  },
  {
    role: 'TEHSILDAR',
    rankMr: '४',
    rankEn: '4',
    titleMr: 'तहसीलदार, चंद्रपूर',
    titleEn: 'Tahsildar & Executive Magistrate, Chandrapur',
    roleTag: 'Taluka Scope',
    badgeMr: 'तहसीलदार (Tehsildar)',
    badgeEn: 'Tahsildar & Executive Magistrate',
    jurisdictionMr: 'चंद्रपूर तालुका (Taluka Executive)',
    jurisdictionEn: 'Chandrapur Taluka Executive Scope',
    icon: Briefcase,
    email: 'teh.chandrapur@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'तालुका महसूल प्रशासन, अतिक्रमण निष्कासन व वसुली',
    descriptionEn: 'Taluka Revenue Administration, Encroachment Removal & Recovery',
  },
  {
    role: 'NAIB_TEHSILDAR',
    rankMr: '५',
    rankEn: '5',
    titleMr: 'नायब तहसीलदार, चंद्रपूर',
    titleEn: 'Naib Tahsildar, Chandrapur',
    roleTag: 'Circle / Taluka',
    badgeMr: 'नायब तहसीलदार (Naib Tehsildar)',
    badgeEn: 'Naib Tahsildar',
    jurisdictionMr: 'तहसील / मंडळ प्रभार',
    jurisdictionEn: 'Tehsil & Circle Charge',
    icon: FileCheck2,
    email: 'naib.chandrapur@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'फेरफार नोंदी प्रमाणीकरण (Mutation Certification)',
    descriptionEn: 'Mutation Entry Certification & Revenue Dispute Inquiries',
  },
  {
    role: 'CIRCLE_OFFICER',
    rankMr: '६',
    rankEn: '6',
    titleMr: 'मंडळ अधिकारी (Circle Officer), माढेळी',
    titleEn: 'Circle Officer, Madheli Circle',
    roleTag: 'Revenue Circle',
    badgeMr: 'मंडळ अधिकारी (Circle Officer)',
    badgeEn: 'Circle Officer',
    jurisdictionMr: 'माढेळी मंडळ (Madheli Circle)',
    jurisdictionEn: 'Madheli Revenue Circle',
    icon: Compass,
    email: 'co.madheli@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'स्थळ पंचनामे, पीक पाहणी व फेरफार चौकशी अहवाल',
    descriptionEn: 'Spot Panchnama, Crop Inspection (Pik Pahani) & Verification Reports',
  },
  {
    role: 'TALATHI',
    rankMr: '७',
    rankEn: '7',
    titleMr: 'तलाठी (सझा माढेळी), वरोरा',
    titleEn: 'Talathi / Village Revenue Officer, Madheli',
    roleTag: 'Saja / Village',
    badgeMr: 'तलाठी (Talathi / पटवारी)',
    badgeEn: 'Talathi (Patwari)',
    jurisdictionMr: 'सझा माढेळी (Village Records)',
    jurisdictionEn: 'Saja Madheli Grassroots Registry',
    icon: FileCheck2,
    email: 'talathi.madheli@maharashtra.gov.in',
    password: '111111',
    descriptionMr: 'गाव नमुना ७/१२, ८-अ, फेरफार नोंदवही व्यवस्थापन',
    descriptionEn: 'Village Form 7/12, 8A, & Mutation Register Custody',
  },
];

export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const { login } = useAuth();
  const { isMarathi } = useTranslation();
  const trapRef = useFocusTrap(isOpen);
  const [mounted, setMounted] = useState(false);

  const [selectedRole, setSelectedRole] = useState('COLLECTOR');
  const [email, setEmail] = useState('collector.chandrapur@maharashtra.gov.in');
  const [password, setPassword] = useState('111111');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMsg('');
      setSuccessMsg('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentOfficer =
    HIERARCHY_OFFICERS.find((o) => o.role === selectedRole) || HIERARCHY_OFFICERS[0];

  const handleSelectRole = (officer) => {
    setSelectedRole(officer.role);
    setEmail(officer.email);
    setPassword(officer.password);
    setErrorMsg('');
  };

  const handleExecuteLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      await login(loginEmail, loginPass);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || (isMarathi ? 'अवैध शासकीय ईमेल किंवा संकेतशब्द. कृपया पुन्हा प्रयत्न करा.' : 'Invalid official email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 my-auto transition-all"
      >
        {/* Clean, Modern Minimalist Header */}
        <div className="px-5 sm:px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ChandrapurDistrictLogo className="w-8 h-8 sm:w-9 sm:h-9" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 tracking-wide">
                  {isMarathi ? 'महाराष्ट्र शासन • जिल्हाधिकारी कार्यालय, चंद्रपूर' : 'Govt of Maharashtra • Collectorate Chandrapur'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  {isMarathi ? 'अंतर्गत पोर्टल' : 'Official Portal'}
                </span>
              </div>
              <h2 id="auth-modal-title" className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {isMarathi ? 'भूमी अभिलेख व महसूल अधिकारी अधिकृत प्रणाली' : 'Land Governance & Revenue Officer Portal'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isMarathi ? 'संवाद बंद करा (Close dialog)' : 'Close dialog'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Clean Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column: Official Hierarchy Selector */}
          <div className="md:col-span-5 bg-slate-50/70 p-3.5 sm:p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-1 mb-2.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isMarathi ? 'पदानुक्रम' : 'Officer Hierarchy'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isMarathi ? '१ ते ७ पदे' : '7 Official Roles'}
                </span>
              </div>

              {/* Hierarchy List: Responsive Horizontal scroll on mobile, sleek vertical list on desktop */}
              <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-0 md:space-y-1 pb-1 md:pb-0 touch-scroll no-scrollbar">
                {HIERARCHY_OFFICERS.map((officer) => {
                  const isSelected = selectedRole === officer.role;

                  return (
                    <button
                      key={officer.role}
                      type="button"
                      onClick={() => handleSelectRole(officer)}
                      className={`shrink-0 md:shrink md:w-full text-left px-2.5 py-1.5 md:py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/20'
                          : 'text-slate-600 bg-white/70 md:bg-transparent hover:bg-white hover:text-slate-900 font-normal hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isMarathi ? officer.rankMr : officer.rankEn}
                        </span>
                        <div className="min-w-0 whitespace-nowrap md:whitespace-normal">
                          <div className="truncate leading-tight font-medium">
                            {isMarathi ? officer.badgeMr : officer.badgeEn}
                          </div>
                          <div
                            className={`text-[10px] truncate hidden md:block ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {officer.roleTag}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Context Footnote */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 leading-relaxed hidden md:block px-1">
              <span className="font-medium text-slate-600">{isMarathi ? 'टीप:' : 'Note:'}</span>{' '}
              {isMarathi
                ? 'पदानुक्रमानुसार सुनावणी व फेरफार मंजुरीचे अधिकार निश्चित केले आहेत.'
                : 'Jurisdiction & quasi-judicial hearing powers are determined by statutory hierarchy.'}
            </div>
          </div>

          {/* Right Column: Active Role Card & Login Form */}
          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white">
            <div className="space-y-4">
              {/* Active Role Summary Banner - Seamless & Minimal */}
              <div className="pb-3.5 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {isMarathi ? 'पद' : 'Role'} #{isMarathi ? currentOfficer.rankMr : currentOfficer.rankEn} • {currentOfficer.roleTag}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {isMarathi ? currentOfficer.jurisdictionMr : currentOfficer.jurisdictionEn}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate pt-0.5">
                    {isMarathi ? currentOfficer.titleMr : currentOfficer.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {isMarathi ? currentOfficer.descriptionMr : currentOfficer.descriptionEn}
                  </p>
                </div>

               
              </div>

              {/* Messages */}
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Official Credential Form */}
              <form onSubmit={handleExecuteLogin} className="space-y-3.5">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                    {isMarathi ? 'शासकीय ईमेल (Official ID / NIC)' : 'Official Email (NIC / MahaGov ID)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. collector.chandrapur@maharashtra.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-medium text-slate-700">
                      {isMarathi ? 'संकेतशब्द (Password)' : 'Password'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isMarathi ? 'चाचणी संकेतशब्द: 111111' : 'Demo Pass: 111111'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                      title={showPassword ? (isMarathi ? 'संकेतशब्द लपवा' : 'Hide password') : (isMarathi ? 'संकेतशब्द दाखवा' : 'Show password')}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {loading ? (
                    <span>{isMarathi ? 'प्रमाणीकरण चालू आहे...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>{isMarathi ? 'डॅशबोर्डमध्ये प्रवेश करा' : 'Sign In to Revenue Dashboard'}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Governance Note - Minimal & Clean */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {isMarathi
                    ? 'केवळ अधिकृत महसूल अधिकारी व कर्मचाऱ्यांसाठी मर्यादित.'
                    : 'Restricted for authorized revenue officers and revenue staff.'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
