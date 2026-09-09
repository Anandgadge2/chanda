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
  ArrowRight,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';

const DEMO_OFFICERS = [
  {
    role: 'SDO_CHANDRAPUR',
    title: 'उपविभागीय अधिकारी (SDO), चंद्रपूर',
    badge: 'SDO Court',
    id: 'sdo.chandrapur@maharashtra.gov.in',
    pin: '7890',
  },
  {
    role: 'TEHSILDAR_WARORA',
    title: 'तहसीलदार, वरोरा',
    badge: 'Tehsildar Office',
    id: 'teh.warora@maharashtra.gov.in',
    pin: '4560',
  },
  {
    role: 'COLLECTOR_DISTRICT',
    title: 'जिल्हाधिकारी, चंद्रपूर कार्यालय',
    badge: 'Collectorate Apex',
    id: 'collector.chandrapur@gov.in',
    pin: '1234',
  },
];

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [role, setRole] = useState('SDO_CHANDRAPUR');
  const [officerId, setOfficerId] = useState('sdo.chandrapur@maharashtra.gov.in');
  const [pin, setPin] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regTaluka, setRegTaluka] = useState('chandrapur');
  const [regType, setRegType] = useState('citizen');
  const [regSubmitted, setRegSubmitted] = useState(false);

  useEffect(() => {
    setTab(initialTab);
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

  const handleQuickDemo = (demo) => {
    setRole(demo.role);
    setOfficerId(demo.id);
    setPin('••••••••');
    setSuccessMsg(`प्रमाणीकरण यशस्वी! ${demo.title} म्हणून लॉगिन होत आहे...`);
    setLoading(true);
    setTimeout(() => {
      onClose();
      router.push('/dashboard');
    }, 1200);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('सुरक्षित महसूल लॉगिन यशस्वी! डॅशबोर्डवर पुनर्निर्देशित केले जात आहे...');
    setTimeout(() => {
      onClose();
      router.push('/dashboard');
    }, 1200);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRegSubmitted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Tricolor top border */}
        <div className="gov-tricolor-bar" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border-b border-slate-200 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <ChandrapurDistrictLogo className="w-12 h-12 flex-shrink-0" />
            <div>
              <p className="text-xs text-amber-800 font-bold tracking-wide">
                महाराष्ट्र शासन | जिल्हाधिकारी कार्यालय, चंद्रपूर
              </p>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-0.5">
                {tab === 'login' ? 'महसूल अधिकारी पोर्टल लॉगिन' : 'नागरिक व अधिकारी नोंदणी'}
              </h2>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl mt-5 text-xs font-semibold">
            <button
              onClick={() => {
                setTab('login');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                tab === 'login'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>अधिकारी लॉगिन (Officer Sign In)</span>
            </button>
            <button
              onClick={() => {
                setTab('register');
                setRegSubmitted(false);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                tab === 'register'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>नोंदणी (Registration)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {tab === 'login' ? (
            <div className="space-y-4">
              {/* Quick Demo Login Picker */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>एक-क्लिक त्वरित चाचणी लॉगिन (Evaluation Demo):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_OFFICERS.map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleQuickDemo(demo)}
                      disabled={loading}
                      className="text-left p-2 rounded-xl bg-white border border-amber-300/80 hover:border-amber-500 hover:shadow-sm text-[11px] transition group flex flex-col justify-between"
                    >
                      <span className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-900">
                        {demo.badge}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">क्लिक करून उघडा →</span>
                    </button>
                  ))}
                </div>
              </div>

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
                    अधिकारी पद / पदनिर्देश (Designation / Jurisdiction)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="COLLECTOR_DISTRICT">जिल्हाधिकारी कार्यालय (Collector Apex Authority)</option>
                      <option value="SDO_CHANDRAPUR">उपविभागीय अधिकारी (SDO Court - MLRC 1966)</option>
                      <option value="TEHSILDAR_WARORA">तहसीलदार कार्यालय (Tehsildar Quasi-Judicial)</option>
                      <option value="CIRCLE_OFFICER">मंडळ अधिकारी / तलाठी (Circle Revenue Inspector)</option>
                      <option value="AUDIT_OFFICER">महसूल लेखापरीक्षक (Prapatra-3 Auditor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शासकीय ईमेल किंवा अधिकारी आयडी (Government Email / Staff ID)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="उदा. sdo.chandrapur@maharashtra.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सुरक्षा पिन / पासवर्ड (Security PIN / Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-900" />
                    <span>सत्र लक्षात ठेवा (Remember device)</span>
                  </label>
                  <a href="#help" onClick={(e) => { e.preventDefault(); alert('कृपया जिल्हा एनआयसी / महसूल कक्षाशी संपर्क साधा: +91 7172 251100'); }} className="text-blue-700 hover:underline font-semibold">
                    पिन विसरलात का?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
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
                  <h3 className="text-base font-bold text-slate-900">नोंदणी अर्ज यशस्वीरीत्या प्राप्त झाला!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    आपला अर्ज जिल्हा महसूल कक्षाकडे मंजुरीसाठी पाठविला गेला आहे. लवकरच आपल्या नोंदणीकृत मोबाईलवर एसएमएस द्वारे तात्पुरता लॉगिन पिन पाठवला जाईल.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setRegSubmitted(false);
                    }}
                    className="mt-3 px-5 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition"
                  >
                    अधिकारी लॉगिनकडे जा
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पूर्ण नाव (Full Name as per Aadhaar/Service Record)
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
                        मोबाईल क्रमांक (Mobile)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="९८xxxxxxxx"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        वापरकर्ता प्रकार (User Role)
                      </label>
                      <select
                        value={regType}
                        onChange={(e) => setRegType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="citizen">नागरिक / भूधारक (Citizen / Landowner)</option>
                        <option value="officer">महसूल कर्मचारी (Revenue Staff / Talathi)</option>
                        <option value="advocate">विधी सल्लागार / वकील (Legal Representative)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      संबंधित तालुका (Select Home Taluka)
                    </label>
                    <select
                      value={regTaluka}
                      onChange={(e) => setRegTaluka(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CHANDRAPUR_TALUKAS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nameMr} ({t.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    * नोंदणी सबमिट केल्यावर महाराष्ट्र जमीन महसूल संहिता (MLRC) अंतर्गत भूखंड पडताळणी, सुनावणी नोटीस व प्रपत्र-३ चे डिजिटल अधिकार उपलब्ध होतील.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>नोंदणी प्रक्रिया चालू आहे...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>नोंदणी अर्ज सादर करा (Submit Registration)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>२५६-बिट एसएसएल एनक्रिप्टेड • राष्ट्रीय माहिती विज्ञान केंद्र (NIC) सुरक्षा मार्गदर्शक</span>
        </div>
      </div>
    </div>
  );
}
