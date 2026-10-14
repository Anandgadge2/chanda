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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800 my-auto transition-all"
      >
        {/* Sleek Standard Header */}
        <div className="px-5 sm:px-7 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-lg bg-white/10 ring-1 ring-white/15 flex-shrink-0">
              <ChandrapurDistrictLogo className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-amber-400 tracking-wide uppercase">
                  महाराष्ट्र शासन • जिल्हाधिकारी कार्यालय, चंद्रपूर
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-medium hidden sm:inline-block">
                  अंतर्गत पोर्टल
                </span>
              </div>
              <h2 id="auth-modal-title" className="text-sm sm:text-base font-semibold text-white tracking-tight">
                भूमी अभिलेख व महसूल अधिकारी अधिकृत प्रणाली
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="संवाद बंद करा (Close dialog)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Clean Workspace Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column: Official Hierarchy Selector */}
          <div className="md:col-span-5 bg-slate-50/70 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <Users2 className="w-3.5 h-3.5 text-blue-900" />
                  <span>महसूल पदानुक्रम (Hierarchy)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">१ ते ७ पदे</span>
              </div>

              {/* Hierarchy List */}
              <div className="space-y-1">
                {HIERARCHY_OFFICERS.map((officer) => {
                  const Icon = officer.icon;
                  const isSelected = selectedRole === officer.role;

                  return (
                    <button
                      key={officer.role}
                      type="button"
                      onClick={() => handleSelectRole(officer)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-blue-900 text-white font-semibold shadow-xs ring-1 ring-blue-900'
                          : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-blue-800 text-amber-300' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {officer.rank}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate leading-tight">{officer.badge}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-blue-200' : 'text-slate-500'
                            }`}
                          >
                            {officer.roleTag}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Context Footnote */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 leading-relaxed hidden md:block">
              <span className="font-medium text-slate-700">टीप:</span> महसूल अधिकार पदानुक्रमानुसार (Collectorate Level) सुनावणी, आदेश व फेरफार मंजुरीचे अधिकार निश्चित केले आहेत.
            </div>
          </div>

          {/* Right Column: Active Role Card & Login Form */}
          <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Active Role Summary Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-white">
                      पद #{currentOfficer.rank}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {currentOfficer.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    {currentOfficer.description}
                  </p>
                  <p className="text-[10px] text-blue-900 font-medium mt-0.5">
                    कार्यक्षेत्र : {currentOfficer.jurisdiction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleExecuteLogin(e, currentOfficer.email, currentOfficer.password)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs shadow-xs transition shrink-0 flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  title="या खात्यावर थेट १-क्लिक चाचणी लॉगिन करा"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-950" />
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
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
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
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
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
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
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
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
                >
                  {loading ? (
                    <span>प्रमाणीकरण चालू आहे...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>डॅशबोर्डमध्ये प्रवेश करा</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Governance Note */}
            <div className="pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="leading-tight">
                  केवळ अधिकृत महसूल अधिकारी व कर्मचाऱ्यांसाठी मर्यादित. सर्व प्रवेशांची नोंद ठेवली जाते.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
