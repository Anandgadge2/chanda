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

/**
 * Official Hierarchy of Revenue Administration (Apex to Grassroots)
 */
const HIERARCHY_OFFICERS = [
  {
    role: 'COLLECTOR',
    rank: '१',
    title: 'जिल्हाधिकारी, चंद्रपूर',
    roleTag: 'Apex Authority',
    badge: 'जिल्हाधिकारी (Collector)',
    jurisdiction: 'संपूर्ण चंद्रपूर जिल्हा (District-wide)',
    icon: Crown,
    email: 'collector.chandrapur@maharashtra.gov.in',
    password: '111111',
    description: 'जिल्हा महसूल प्रमुख, अपीलीय अधिकारी व शासन जमा अंतिम आदेश',
  },
  {
    role: 'SUB_COLLECTOR',
    rank: '२',
    title: 'उपजिल्हाधिकारी (भूसंपादन / महसूल)',
    roleTag: 'Headquarters',
    badge: 'उपजिल्हाधिकारी (Sub-Collector)',
    jurisdiction: 'जिल्हा मुख्यालय (Collectorate HQ)',
    icon: Building2,
    email: 'subcollector.chandrapur@maharashtra.gov.in',
    password: '111111',
    description: 'भूसंपादन, पुनर्वसन, अकृषिक (NA) संनियंत्रण व समन्वय',
  },
  {
    role: 'SDO',
    rank: '३',
    title: 'उपविभागीय अधिकारी (SDO), वरोरा',
    roleTag: 'Sub-Division',
    badge: 'उपविभागीय अधिकारी (SDO / प्रांत)',
    jurisdiction: 'वरोरा उपविभाग (Warora Sub-Division)',
    icon: Scale,
    email: 'sdo.warora@maharashtra.gov.in',
    password: '111111',
    description: 'अर्ध-न्यायिक न्यायालय (MLRC कलम ३६, ३६अ, ४४, ४५ सुनावणी)',
  },
  {
    role: 'TEHSILDAR',
    rank: '४',
    title: 'तहसीलदार, चंद्रपूर',
    roleTag: 'Taluka Scope',
    badge: 'तहसीलदार (Tehsildar)',
    jurisdiction: 'चंद्रपूर तालुका (Taluka Executive)',
    icon: Briefcase,
    email: 'teh.chandrapur@maharashtra.gov.in',
    password: '111111',
    description: 'तालुका महसूल प्रशासन, अतिक्रमण निष्कासन व वसुली',
  },
  {
    role: 'NAIB_TEHSILDAR',
    rank: '५',
    title: 'नायब तहसीलदार, चंद्रपूर',
    roleTag: 'Circle / Taluka',
    badge: 'नायब तहसीलदार (Naib Tehsildar)',
    jurisdiction: 'तहसील / मंडळ प्रभार',
    icon: FileCheck2,
    email: 'naib.chandrapur@maharashtra.gov.in',
    password: '111111',
    description: 'फेरफार नोंदी प्रमाणीकरण (Mutation Certification)',
  },
  {
    role: 'CIRCLE_OFFICER',
    rank: '६',
    title: 'मंडळ अधिकारी (Circle Officer), माढेळी',
    roleTag: 'Revenue Circle',
    badge: 'मंडळ अधिकारी (Circle Officer)',
    jurisdiction: 'माढेळी मंडळ (Madheli Circle)',
    icon: Compass,
    email: 'co.madheli@maharashtra.gov.in',
    password: '111111',
    description: 'स्थळ पंचनामे, पीक पाहणी व फेरफार चौकशी अहवाल',
  },
  {
    role: 'TALATHI',
    rank: '७',
    title: 'तलाठी (सझा माढेळी), वरोरा',
    roleTag: 'Saja / Village',
    badge: 'तलाठी (Talathi / पटवारी)',
    jurisdiction: 'सझा माढेळी (Village Records)',
    icon: FileCheck2,
    email: 'talathi.madheli@maharashtra.gov.in',
    password: '111111',
    description: 'गाव नमुना ७/१२, ८-अ, फेरफार नोंदवही व्यवस्थापन',
  },
];

export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const { login } = useAuth();
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
      setErrorMsg(err.message || 'अवैध शासकीय ईमेल किंवा संकेतशब्द. कृपया पुन्हा प्रयत्न करा.');
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
                  महाराष्ट्र शासन • जिल्हाधिकारी कार्यालय, चंद्रपूर
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  अंतर्गत पोर्टल
                </span>
              </div>
              <h2 id="auth-modal-title" className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                भूमी अभिलेख व महसूल अधिकारी अधिकृत प्रणाली
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="संवाद बंद करा (Close dialog)"
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
                  <span>पदानुक्रम (Hierarchy)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">१ ते ७ पदे</span>
              </div>

              {/* Hierarchy List: Responsive Horizontal scroll on mobile, sleek vertical list on desktop */}
              <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-0 md:space-y-1 pb-1 md:pb-0">
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
                          {officer.rank}
                        </span>
                        <div className="min-w-0 whitespace-nowrap md:whitespace-normal">
                          <div className="truncate leading-tight font-medium">{officer.badge}</div>
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
              <span className="font-medium text-slate-600">टीप:</span> पदानुक्रमानुसार सुनावणी व फेरफार मंजुरीचे अधिकार निश्चित केले आहेत.
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
                      पद #{currentOfficer.rank} • {currentOfficer.roleTag}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {currentOfficer.jurisdiction}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate pt-0.5">
                    {currentOfficer.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {currentOfficer.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleExecuteLogin(e, currentOfficer.email, currentOfficer.password)}
                  disabled={loading}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  title="या खात्यावर थेट चाचणी लॉगिन करा"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>थेट प्रवेश</span>
                </button>
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
                    शासकीय ईमेल (Official ID / NIC)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. collector.chandrapur@maharashtra.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-medium text-slate-700">
                      संकेतशब्द (Password)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">चाचणी संकेतशब्द: 111111</span>
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
                      title={showPassword ? 'संकेतशब्द लपवा' : 'संकेतशब्द दाखवा'}
                      aria-label={showPassword ? 'संकेतशब्द लपवा' : 'संकेतशब्द दाखवा'}
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
                    <span>प्रमाणीकरण चालू आहे...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>डॅशबोर्डमध्ये प्रवेश करा</span>
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
                <span>केवळ अधिकृत महसूल अधिकारी व कर्मचाऱ्यांसाठी मर्यादित.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
