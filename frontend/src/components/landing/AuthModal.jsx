'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Landmark,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import { useAuth } from '../AuthContext';
import { api } from '../../lib/api';

const DEFAULT_OFFICERS = [
  {
    role: 'COLLECTOR',
    title: 'जिल्हाधिकारी, चंद्रपूर',
    badge: 'Collectorate Apex',
    email: 'collector.chandrapur@maharashtra.gov.in',
    password: 'Chanda@2026',
  },
  {
    role: 'SDO',
    title: 'उपविभागीय अधिकारी (SDO), वरोरा',
    badge: 'SDO Warora Court',
    email: 'sdo.warora@maharashtra.gov.in',
    password: 'Chanda@2026',
  },
  {
    role: 'TEHSILDAR',
    title: 'तहसीलदार, चंद्रपूर',
    badge: 'Tehsildar Office',
    email: 'teh.chandrapur@maharashtra.gov.in',
    password: 'Chanda@2026',
  },
];

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('collector.chandrapur@maharashtra.gov.in');
  const [password, setPassword] = useState('Chanda@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTaluka, setRegTaluka] = useState('Chandrapur');
  const [regRole, setRegRole] = useState('CITIZEN');
  const [regSubmitted, setRegSubmitted] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setErrorMsg('');
    setSuccessMsg('');
    setRegSubmitted(false);
  }, [initialTab, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickLogin = async (officer) => {
    setEmail(officer.email);
    setPassword(officer.password);
    setErrorMsg('');
    setLoading(true);

    try {
      await login(officer.email, officer.password);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'लॉगिन अयशस्वी झाले.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'अवैध ईमेल किंवा संकेतशब्द.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await api.register({
        fullName: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
        role: regRole,
        taluka: regTaluka,
      });
      setRegSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'नोंदणी अयशस्वी झाली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[94vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto">
        {/* Tricolor top border */}
        <div className="gov-tricolor-bar shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border-b border-slate-200 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ChandrapurDistrictLogo className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
            <div className="min-w-0 pr-6">
              <p className="text-[11px] sm:text-xs text-amber-800 font-bold tracking-wide truncate">
                महाराष्ट्र शासन | जिल्हाधिकारी कार्यालय, चंद्रपूर
              </p>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900 mt-0.5 truncate">
                {tab === 'login' ? 'महसूल अधिकारी पोर्टल लॉगिन' : 'नागरिक व अधिकारी नोंदणी'}
              </h2>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl mt-3 sm:mt-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition text-[11px] sm:text-xs ${
                tab === 'login'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>अधिकारी लॉगिन</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
                setRegSubmitted(false);
              }}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition text-[11px] sm:text-xs ${
                tab === 'register'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>नोंदणी</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {tab === 'login' ? (
            <div className="space-y-3.5 sm:space-y-4">
              {/* Quick Testing Login Picker */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>एक-क्लिक चाचणी लॉगिन:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEFAULT_OFFICERS.map((officer) => (
                    <button
                      key={officer.role}
                      type="button"
                      onClick={() => handleQuickLogin(officer)}
                      disabled={loading}
                      className="text-left p-2 rounded-xl bg-white border border-amber-300/80 hover:border-amber-500 hover:shadow-sm text-[11px] transition group flex flex-col justify-between active:scale-95"
                    >
                      <span className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-900">
                        {officer.badge}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium mt-1">लॉगिन करा →</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शासकीय ईमेल
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. collector.chandrapur@maharashtra.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    संकेतशब्द
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition focus:outline-none"
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
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span>प्रमाणीकरण चालू आहे...</span>
                  ) : (
                    <>
                      <span>सुरक्षित महसूल डॅशबोर्ड उघडा</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Register Form */
            <div className="space-y-4">
              {regSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">नोंदणी यशस्वी झाली!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    आपले खाते तयार झाले आहे. आपण आता दिलेल्या ईमेल व पासवर्डने लॉगिन करू शकता.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setRegSubmitted(false);
                    }}
                    className="mt-3 px-5 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition"
                  >
                    लॉगिन पृष्ठाकडे जा
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पूर्ण नाव
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="उदा. राजेश महादेवराव ठाकरे"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ईमेल
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        मोबाईल
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="९८xxxxxxxx"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        तालुका
                      </label>
                      <select
                        value={regTaluka}
                        onChange={(e) => setRegTaluka(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CHANDRAPUR_TALUKAS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nameMr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        संकेतशब्द
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="किमान ६ अक्षरे"
                          className="w-full pl-3 pr-9 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition focus:outline-none"
                          title={showRegPassword ? 'संकेतशब्द लपवा' : 'संकेतशब्द दाखवा'}
                          aria-label={showRegPassword ? 'संकेतशब्द लपवा' : 'संकेतशब्द दाखवा'}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <span>नोंदणी होत आहे...</span> : <span>नोंदणी पूर्ण करा</span>}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
