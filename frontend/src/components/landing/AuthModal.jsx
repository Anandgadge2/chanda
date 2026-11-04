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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#252B36]/60 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E9E7E1] overflow-hidden text-[#252B36] my-auto transition-all"
      >
        {/* Clean, Modern SaaS Header */}
        <div className="px-6 py-5 bg-[#FFFFFF] border-b border-[#E9E7E1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <ChandrapurDistrictLogo className="w-9 h-9 sm:w-11 sm:h-11" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-[13px] font-medium text-[#64748B] tracking-wide">
                  {isMarathi ? 'महाराष्ट्र शासन • जिल्हाधिकारी कार्यालय, चंद्रपूर' : 'Govt of Maharashtra • Collectorate Chandrapur'}
                </span>
                <span className="text-[11px] bg-[#F8F7F3] text-[#252B36] px-2.5 py-0.5 rounded-full font-semibold hidden sm:inline-block border border-[#E9E7E1]">
                  {isMarathi ? 'अंतर्गत पोर्टल' : 'Official Portal'}
                </span>
              </div>
              <h2 id="auth-modal-title" className="text-base sm:text-lg lg:text-xl font-extrabold text-[#252B36] tracking-tight mt-0.5">
                {isMarathi ? 'भूमी अभिलेख व महसूल अधिकारी अधिकृत प्रणाली' : 'Land Governance & Revenue Officer Portal'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#252B36] hover:bg-[#F3F2ED] transition focus:outline-none focus:ring-2 focus:ring-[#4169E1]/30 cursor-pointer"
            aria-label={isMarathi ? 'संवाद बंद करा (Close dialog)' : 'Close dialog'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Clean Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column: Official Hierarchy Selector */}
          <div className="md:col-span-5 bg-[#F8F7F3] p-4 sm:p-5 border-b md:border-b-0 md:border-r border-[#E9E7E1] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-[#64748B]" />
                  <span>{isMarathi ? 'पदानुक्रम' : 'Officer Hierarchy'}</span>
                </span>
                <span className="text-[11px] text-[#64748B] font-semibold">
                  {isMarathi ? '१ ते ७ पदे' : '7 Official Roles'}
                </span>
              </div>

              {/* Hierarchy List */}
              <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-0 md:space-y-1.5 pb-2 md:pb-0 touch-scroll no-scrollbar">
                {HIERARCHY_OFFICERS.map((officer) => {
                  const isSelected = selectedRole === officer.role;

                  return (
                    <button
                      key={officer.role}
                      type="button"
                      onClick={() => handleSelectRole(officer)}
                      className={`shrink-0 md:shrink md:w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-[#4169E1] text-white font-semibold border-[#4169E1] shadow-xs'
                          : 'text-[#252B36] bg-[#FFFFFF] hover:bg-[#F3F2ED] border-[#E9E7E1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#F3F2ED] text-[#252B36]'
                          }`}
                        >
                          {isMarathi ? officer.rankMr : officer.rankEn}
                        </span>
                        <div className="min-w-0 whitespace-nowrap md:whitespace-normal">
                          <div className="truncate leading-snug font-semibold text-[13px] sm:text-sm">
                            {isMarathi ? officer.badgeMr : officer.badgeEn}
                          </div>
                          <div
                            className={`text-xs truncate hidden md:block ${
                              isSelected ? 'text-white/80' : 'text-[#64748B]'
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
            <div className="mt-4 pt-3 border-t border-[#E9E7E1] text-xs text-[#64748B] leading-relaxed hidden md:block px-1">
              <span className="font-bold text-[#252B36]">{isMarathi ? 'टीप:' : 'Note:'}</span>{' '}
              {isMarathi
                ? 'पदानुक्रमानुसार सुनावणी व फेरफार मंजुरीचे अधिकार निश्चित केले आहेत.'
                : 'Jurisdiction & quasi-judicial hearing powers are determined by statutory hierarchy.'}
            </div>
          </div>

          {/* Right Column: Active Role Card & Login Form */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#FFFFFF]">
            <div className="space-y-4">
              {/* Active Role Summary Banner */}
              <div className="p-4 bg-[#F8F7F3] rounded-2xl border border-[#E9E7E1] space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4169E1]/10 text-[#4169E1]">
                    {isMarathi ? 'पद' : 'Role'} #{isMarathi ? currentOfficer.rankMr : currentOfficer.rankEn} • {currentOfficer.roleTag}
                  </span>
                  <span className="text-xs text-[#64748B] truncate">
                    {isMarathi ? currentOfficer.jurisdictionMr : currentOfficer.jurisdictionEn}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#252B36] truncate">
                  {isMarathi ? currentOfficer.titleMr : currentOfficer.titleEn}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#64748B] line-clamp-2 leading-relaxed">
                  {isMarathi ? currentOfficer.descriptionMr : currentOfficer.descriptionEn}
                </p>
              </div>

              {/* Messages */}
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-sm font-semibold flex items-center gap-2.5"
                >
                  <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] text-sm font-semibold flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Official Credential Form */}
              <form onSubmit={handleExecuteLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm sm:text-[15px] font-semibold text-[#252B36] mb-1.5">
                    {isMarathi ? 'शासकीय ईमेल (Official ID / NIC)' : 'Official Email (NIC / MahaGov ID)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. collector.chandrapur@maharashtra.gov.in"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-[15px] sm:text-base border border-[#E9E7E1] rounded-xl bg-[#FFFFFF] font-medium text-[#252B36] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm sm:text-[15px] font-semibold text-[#252B36]">
                      {isMarathi ? 'संकेतशब्द (Password)' : 'Password'}
                    </label>
                    <span className="text-xs text-[#64748B] font-mono">
                      {isMarathi ? 'चाचणी संकेतशब्द: 111111' : 'Demo Pass: 111111'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-2.5 sm:py-3 text-[15px] sm:text-base border border-[#E9E7E1] rounded-xl bg-[#FFFFFF] font-medium text-[#252B36] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3 text-[#64748B] hover:text-[#252B36] p-1 rounded-lg transition"
                      title={showPassword ? (isMarathi ? 'संकेतशब्द लपवा' : 'Hide password') : (isMarathi ? 'संकेतशब्द दाखवा' : 'Show password')}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-[#4169E1] hover:bg-[#3454B4] text-white font-bold text-[15px] sm:text-base shadow-sm transition flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/30 cursor-pointer"
                >
                  {loading ? (
                    <span>{isMarathi ? 'प्रमाणीकरण चालू आहे...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>{isMarathi ? 'डॅशबोर्डमध्ये प्रवेश करा' : 'Sign In to Revenue Dashboard'}</span>
                      <ArrowRight className="w-5 h-5 text-white" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Governance Note */}
            <div className="pt-2">
              <p className="text-xs sm:text-[13px] text-[#64748B] text-center flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
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
