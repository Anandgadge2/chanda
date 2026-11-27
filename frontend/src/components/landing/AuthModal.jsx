'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  UserPlus,
  LogIn,
  MapPin,
  Clock,
} from 'lucide-react';
import ChandrapurDistrictLogo from './ChandrapurDistrictLogo';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import { useAuth } from '../AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useTranslation } from '../LanguageContext';
import { api } from '../../lib/api';
import { CHANDRAPUR_TALUKAS, CHANDRAPUR_SUBDIVISIONS, DEFAULT_OFFICER_ROLES } from '../../lib/constants';

// Temporary Quick Login Accounts Dropdown for Fast Testing
const QUICK_LOGIN_ACCOUNTS = [
  { label: 'Collector (Superadmin)', email: 'admin@gmail.com', mobile: '9172251111' },
  { label: 'Collector (Superadmin)', email: 'collector.chandrapur@maharashtra.gov.in', mobile: '9172251100' },
  { label: 'Collector (Superadmin)', email: 'superadmin.chandrapur@maharashtra.gov.in', mobile: '9172250000' },
  { label: 'Sub-Collector (Admin)', email: 'subcollector.chandrapur@maharashtra.gov.in', mobile: '9172251150' },
  { label: 'SDO (Warora)', email: 'sdo.warora@maharashtra.gov.in', mobile: '9172252200' },
  { label: 'Tehsildar (Chandrapur)', email: 'teh.chandrapur@maharashtra.gov.in', mobile: '9172253300' },
  { label: 'Tehsildar (Warora)', email: 'teh.warora@maharashtra.gov.in', mobile: '9172254400' },
  { label: 'Naib Tahasildar (Chandrapur)', email: 'naib.chandrapur@maharashtra.gov.in', mobile: '9172253350' },
  { label: 'Circle Officer (Madheli)', email: 'co.madheli@maharashtra.gov.in', mobile: '9172255500' },
  { label: 'Talathi (Saja Madheli, Warora)', email: 'talathi.madheli@maharashtra.gov.in', mobile: '9172256600' },
];

const normalizeTalukas = (list) => {
  if (!Array.isArray(list) || list.length === 0) return CHANDRAPUR_TALUKAS;
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const match = CHANDRAPUR_TALUKAS.find(
          (t) => t.id.toLowerCase() === item.toLowerCase() || t.nameEn.toLowerCase() === item.toLowerCase()
        );
        return match || { id: item, nameMr: item, nameEn: item };
      }
      if (!item || typeof item !== 'object') return null;
      const id = item.id || item.nameEn || item.name || '';
      if (!id) return null;
      return {
        id,
        nameMr: item.nameMr || item.name || id,
        nameEn: item.nameEn || item.name || id,
      };
    })
    .filter(Boolean);
};

const SCOPE_HINT = {
  DISTRICT: {
    mr: 'संपूर्ण चंद्रपूर जिल्हा (सर्व १५ तालुके)',
    en: 'Entire Chandrapur District (All 15 Talukas)',
  },
  SUBDIVISION: {
    mr: 'उपविभाग व तालुके निवडा (बहु-तालुका व गाव निवड उपलब्ध)',
    en: 'Select Sub-Division & Talukas (Multi-Taluka & Village supported)',
  },
  TALUKA: {
    mr: 'नियुक्त तालुके निवडा (एकापेक्षा जास्त तालुके व गावे निवडता येतात)',
    en: 'Select Assigned Talukas (Multi-Taluka & Village supported)',
  },
  CIRCLE: {
    mr: 'तालुके, महसूल मंडळे व गावे निवडा',
    en: 'Select Talukas, Revenue Circles & Villages',
  },
  VILLAGE: {
    mr: 'तालुका व नियुक्त गावे / सझा निवडा (बहु-गाव निवड)',
    en: 'Select Taluka & Multiple Assigned Villages / Saja',
  },
};

export default function AuthModal({ isOpen, onClose }) {
  const router = useRouter();
  const { login } = useAuth();
  const { isMarathi } = useTranslation();
  const trapRef = useFocusTrap(isOpen);

  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Registration State (pre-populated with DEFAULT_OFFICER_ROLES for 0ms instant display)
  const [regOptionsLoading, setRegOptionsLoading] = useState(false);
  const [regRoles, setRegRoles] = useState(DEFAULT_OFFICER_ROLES);
  const [regSubdivisions, setRegSubdivisions] = useState(CHANDRAPUR_SUBDIVISIONS);
  const [regTalukas, setRegTalukas] = useState(CHANDRAPUR_TALUKAS);

  const [regForm, setRegForm] = useState({
    fullName: '',
    designation: isMarathi ? 'तहसीलदार' : 'Tahasildar',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    roleId: DEFAULT_OFFICER_ROLES[1]?.id || 'officer',
    subdivision: '',
    assignedTalukas: ['Chandrapur'],
    assignedCircles: [],
    assignedVillages: [],
    consentGiven: false,
  });

  // Dynamic Circle / Village directory for selected Talukas (0ms client-cached after prefetch)
  const [availableCircles, setAvailableCircles] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);
  const [loadingGeoOptions, setLoadingGeoOptions] = useState(false);

  // Lock scroll & prefetch Geo Directory immediately on modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      api.prefetchGeoDirectory();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch active registration roles live whenever switching to register mode
  useEffect(() => {
    if (!isOpen || mode !== 'register') return;
    let active = true;
    const loadOptions = async () => {
      setRegOptionsLoading(true);
      setErrorMsg('');
      try {
        const res = await api.getRegistrationOptions();
        if (!active) return;
        const activeRoles = res.roles || [];
        if (activeRoles.length > 0) {
          setRegRoles(activeRoles);
        }
        if (Array.isArray(res.subdivisions) && res.subdivisions.length > 0) {
          setRegSubdivisions(res.subdivisions);
        }
        if (Array.isArray(res.talukas) && res.talukas.length > 0) {
          setRegTalukas(normalizeTalukas(res.talukas));
        }
        setRegForm((prev) => {
          const cleanPrevSlug = String(prev.roleId || '').replace(/^role_/, '');
          const validExisting = activeRoles.find(
            (r) => r.id === prev.roleId || (cleanPrevSlug && r.slug === cleanPrevSlug)
          );
          const nextRole = validExisting || activeRoles[0] || null;
          const localizedName = nextRole ? (isMarathi ? nextRole.nameMr || nextRole.name : nextRole.name) : prev.designation;
          return {
            ...prev,
            roleId: nextRole?.id || prev.roleId,
            designation:
              !prev.designation || prev.designation === 'तहसीलदार' || prev.designation === 'Tahasildar'
                ? localizedName
                : prev.designation,
          };
        });
      } catch (err) {
        if (active) setErrorMsg(err.message);
      } finally {
        if (active) setRegOptionsLoading(false);
      }
    };
    loadOptions();
    return () => {
      active = false;
    };
  }, [isOpen, mode, isMarathi]);

  const selectedRegRole = useMemo(
    () => regRoles.find((r) => r.id === regForm.roleId) || null,
    [regRoles, regForm.roleId]
  );

  const selectedRegScope = selectedRegRole?.jurisdictionScope || 'TALUKA';

  // Fetch circles & villages across ALL assignedTalukas (0ms instant when pre-cached)
  useEffect(() => {
    const talukasList = regForm.assignedTalukas || [];
    if (!isOpen || mode !== 'register' || selectedRegScope === 'DISTRICT' || talukasList.length === 0) {
      setAvailableCircles([]);
      setAvailableVillages([]);
      return;
    }
    let active = true;
    const fetchGeo = async () => {
      setLoadingGeoOptions(true);
      try {
        const [circlesRes, villagesRes] = await Promise.all([
          selectedRegScope === 'CIRCLE' ? api.getTalukaCircles(talukasList) : Promise.resolve({ circles: [] }),
          api.getTalukaVillages(talukasList),
        ]);
        if (!active) return;
        setAvailableCircles(circlesRes?.circles || []);
        setAvailableVillages(villagesRes?.villages || []);
      } catch {
        if (active) {
          setAvailableCircles([]);
          setAvailableVillages([]);
        }
      } finally {
        if (active) setLoadingGeoOptions(false);
      }
    };
    fetchGeo();
    return () => {
      active = false;
    };
  }, [isOpen, mode, regForm.assignedTalukas, selectedRegScope]);

  const talukaDropdownOptions = useMemo(
    () =>
      regTalukas.map((t) => ({
        value: t.id,
        label: isMarathi ? t.nameMr : t.nameEn,
        subLabel: isMarathi ? t.nameEn : t.nameMr,
      })),
    [regTalukas, isMarathi]
  );

  const circleDropdownOptions = useMemo(
    () =>
      availableCircles.map((c) => ({
        value: c.revenueCircle,
        label: c.revenueCircle,
        subLabel: c.taluka || '',
      })),
    [availableCircles]
  );

  const villageDropdownOptions = useMemo(
    () =>
      availableVillages.map((v) => ({
        value: v.villageName,
        label: v.villageName,
        subLabel: v.taluka || '',
      })),
    [availableVillages]
  );

  if (!isOpen) return null;

  const handleExecuteLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const loginId = (identifier || '').trim();
    const loginPass = password;

    try {
      await login(loginId, loginPass);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(
        err.message ||
          (isMarathi
            ? 'अवैध ईमेल/मोबाईल किंवा संकेतशब्द. कृपया पुन्हा प्रयत्न करा.'
            : 'Invalid email/mobile or password. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegRoleChange = (nextRoleId) => {
    const r = regRoles.find((item) => item.id === nextRoleId);
    const scope = r?.jurisdictionScope || 'TALUKA';

    let defaultSub = '';
    let defaultTalukas = [];

    if (scope === 'SUBDIVISION') {
      const firstSub = regSubdivisions[0];
      defaultSub = firstSub?.id || '';
      defaultTalukas = firstSub ? [...firstSub.talukas] : [];
    } else if (scope === 'TALUKA') {
      defaultTalukas = [regTalukas[2]?.id || 'Chandrapur'];
    } else if (scope === 'CIRCLE' || scope === 'VILLAGE') {
      defaultTalukas = [regTalukas[0]?.id || 'Warora'];
    }

    setRegForm((prev) => ({
      ...prev,
      roleId: nextRoleId,
      designation: r ? (isMarathi ? r.nameMr || r.name : r.name) : prev.designation,
      subdivision: defaultSub,
      assignedTalukas: defaultTalukas,
      assignedCircles: [],
      assignedVillages: [],
    }));
  };

  const handleSubdivisionSelect = (subId) => {
    const sub = regSubdivisions.find((s) => s.id === subId);
    const nextTalukas = sub ? [...sub.talukas] : [];
    setRegForm((prev) => ({
      ...prev,
      subdivision: subId,
      assignedTalukas: nextTalukas,
    }));
  };

  const handleExecuteRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg(isMarathi ? 'दोन्ही संकेतशब्द जुळत नाहीत.' : 'Passwords do not match.');
      return;
    }

    if (selectedRegScope === 'SUBDIVISION' && !regForm.subdivision && regForm.assignedTalukas.length === 0) {
      setErrorMsg(isMarathi ? 'कृपया उपविभाग किंवा तालुका निवडा.' : 'Please select your Sub-Division or Talukas.');
      return;
    }
    if (selectedRegScope === 'TALUKA' && regForm.assignedTalukas.length === 0) {
      setErrorMsg(isMarathi ? 'कृपया किमान एक तालुका निवडा.' : 'Please select at least one Taluka.');
      return;
    }
    if (selectedRegScope === 'CIRCLE' && regForm.assignedCircles.length === 0) {
      setErrorMsg(isMarathi ? 'कृपया किमान एक महसूल मंडळ निवडा.' : 'Please select at least one Revenue Circle.');
      return;
    }
    if (selectedRegScope === 'VILLAGE' && regForm.assignedVillages.length === 0) {
      setErrorMsg(isMarathi ? 'कृपया किमान एक गाव निवडा.' : 'Please select at least one Village.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.selfRegister({
        fullName: regForm.fullName,
        designation: regForm.designation,
        email: regForm.email,
        mobile: regForm.mobile,
        password: regForm.password,
        roleId: regForm.roleId,
        subdivision: regForm.subdivision || null,
        taluka: regForm.assignedTalukas[0] || null,
        assignedTalukas: regForm.assignedTalukas,
        assignedCircles: regForm.assignedCircles,
        assignedVillages: regForm.assignedVillages,
        consentGiven: regForm.consentGiven,
      });

      setSuccessMsg(
        res.message ||
          (isMarathi
            ? 'अधिकारी नोंदणी यशस्वी झाली! जिल्हाधिकारी / Superadmin यांनी आपले खाते मंजूर केल्यानंतरच आपण लॉगिन करू शकाल.'
            : 'Registration submitted! Once Superadmin approves and activates your account, you can sign in with your official email or mobile number.')
      );

      setRegForm({
        fullName: '',
        designation: selectedRegRole ? (isMarathi ? selectedRegRole.nameMr || selectedRegRole.name : selectedRegRole.name) : '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        roleId: regForm.roleId,
        subdivision: '',
        assignedTalukas: [],
        assignedCircles: [],
        assignedVillages: [],
        consentGiven: false,
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`relative w-full ${
          mode === 'login' ? 'max-w-lg' : 'max-w-4xl'
        } max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 my-auto transition-all`}
      >
        {/* Minimal Header with Sign In / Register Switch */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <ChandrapurDistrictLogo className="w-7 h-7 sm:w-8 sm:h-8" />
            <h2 id="auth-modal-title" className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {isMarathi ? 'चंद्रपूर महसूल पोर्टल' : 'Chandrapur Revenue Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'लॉगिन' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isMarathi ? 'अधिकारी नोंदणी' : 'Register'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              aria-label={isMarathi ? 'संवाद बंद करा' : 'Close dialog'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column (Only shown in Register mode for onboarding steps) */}
          {mode === 'register' && (
            <div className="md:col-span-4 bg-slate-50/80 p-3.5 sm:p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isMarathi ? 'नोंदणी व मंजुरी प्रक्रिया' : 'Registration & Approval'}</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      १
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        {isMarathi ? 'भूमिका व कार्यक्षेत्र निवड' : 'Role & Jurisdiction'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isMarathi ? 'सक्रिय पद व नियुक्त उपविभाग/तालुका/गाव.' : 'Active designation & assigned area.'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      २
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        {isMarathi ? 'जिल्हाधिकारी / Superadmin मंजुरी' : 'Superadmin Activation'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isMarathi ? 'पडताळणीनंतर खाते त्वरित सक्रिय केले जाईल.' : 'Verified & activated by Admin.'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ३
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        {isMarathi ? 'ईमेल किंवा मोबाईलने लॉगिन' : 'Instant Login'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isMarathi ? 'अधिकृत ईमेल किंवा १० अंकी फोनने प्रवेश.' : 'Sign in via email or 10-digit mobile.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 leading-relaxed hidden md:block px-1">
                <span className="font-semibold text-slate-600">{isMarathi ? 'टीप:' : 'Note:'}</span>{' '}
                {isMarathi
                  ? 'भूमिकांची यादी Superadmin Settings मधून नियंत्रित केली जाते.'
                  : 'Role list reflects live active designations managed by Superadmin.'}
              </div>
            </div>
          )}

          {/* Main Column */}
          <div className={`${mode === 'login' ? 'md:col-span-12' : 'md:col-span-8'} p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white`}>
            {mode === 'login' ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    {isMarathi ? 'अधिकारी लॉगिन (Sign In)' : 'Officer Sign In'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isMarathi
                      ? 'आपला अधिकृत ईमेल आयडी किंवा १० अंकी मोबाईल क्रमांक आणि संकेतशब्द प्रविष्ट करा.'
                      : 'Enter your official email ID or 10-digit mobile number and password.'}
                  </p>
                </div>

                {errorMsg && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleExecuteLogin} className="space-y-3.5">
                  <div>
                    <label htmlFor="quick-login-select" className="block text-[11px] font-bold text-indigo-700 mb-1">
                      {isMarathi ? 'त्वरित लॉगिन (चाचणी खाते निवडा)' : 'Quick Select Account (Temp)'}
                    </label>
                    <select
                      id="quick-login-select"
                      value={QUICK_LOGIN_ACCOUNTS.some((a) => a.email === identifier) ? identifier : ''}
                      onChange={(e) => {
                        const acc = QUICK_LOGIN_ACCOUNTS.find((a) => a.email === e.target.value);
                        if (acc) {
                          setIdentifier(acc.email);
                          setPassword('111111');
                          setErrorMsg('');
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-indigo-50/40 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
                    >
                      <option value="">
                        {isMarathi ? '-- जलद लॉगिनसाठी अधिकारी खाते निवडा --' : '-- Select an officer account to auto-fill --'}
                      </option>
                      {QUICK_LOGIN_ACCOUNTS.map((acc) => (
                        <option key={acc.email} value={acc.email}>
                          {acc.label} — {acc.email} ({acc.mobile})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isMarathi ? 'अधिकृत ईमेल किंवा मोबाईल क्रमांक *' : 'Official Email ID or Mobile Number *'}
                    </label>
                    <div className="relative">
                      {identifier && !identifier.includes('@') && /\d{5,}/.test(identifier) ? (
                        <Phone className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3 pointer-events-none" />
                      ) : (
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      )}
                      <input
                        id="login-identifier"
                        type="text"
                        required
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={isMarathi ? 'उदा. officer@maharashtra.gov.in किंवा 98XXXXXXXX' : 'e.g. officer@maharashtra.gov.in or 98XXXXXXXX'}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isMarathi ? 'संकेतशब्द (Password) *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/25 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>{isMarathi ? 'प्रमाणीकरण चालू आहे...' : 'Authenticating...'}</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>{isMarathi ? 'डॅशबोर्डमध्ये प्रवेश करा' : 'Sign In to Spatial Platform'}</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {isMarathi ? 'नवीन महसूल अधिकारी आहात?' : 'New revenue officer?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="font-bold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'नवीन अधिकारी नोंदणी करा' : 'Register New Account'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="pb-2.5 border-b border-slate-100">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isMarathi ? 'अधिकारी स्व-नोंदणी (Self-Registration)' : 'Revenue Officer Registration'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isMarathi
                      ? 'भूमिकेनुसार कार्यक्षेत्र (उपविभाग / तालुका / मंडळ / गाव) निवडा. Superadmin मंजुरीनंतर लॉगिन सुरू होईल.'
                      : 'Select an active role and map your jurisdiction. Superadmin approval activates your account.'}
                  </p>
                </div>

                {errorMsg && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div>{successMsg}</div>
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-indigo-700 font-bold underline cursor-pointer"
                      >
                        {isMarathi ? 'लॉगिन स्क्रीनवर परत जा →' : 'Return to Sign In →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Registration Form (Renders instantly 0ms from DEFAULT_OFFICER_ROLES, revalidates silently in background) */}
                <form onSubmit={handleExecuteRegister} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'अधिकृत भूमिका (Active Role) *' : 'Role (Active Roles Only) *'}
                        </label>
                        <select
                          required
                          value={regForm.roleId}
                          onChange={(e) => handleRegRoleChange(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                        >
                          {regRoles.length === 0 && (
                            <option value="">{isMarathi ? 'कोणतीही सक्रिय भूमिका उपलब्ध नाही' : 'No active roles available'}</option>
                          )}
                          {regRoles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {isMarathi ? (r.nameMr || r.name) : r.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'पदनाम (Designation) *' : 'Designation *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.designation}
                          onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                          placeholder={isMarathi ? 'उदा. तहसीलदार, वरोरा' : 'e.g. Tahasildar, Warora'}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.fullName}
                          onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                          placeholder={isMarathi ? 'उदा. श्री. राजेश देशमुख' : 'e.g. Rajesh Deshmukh'}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? '१० अंकी मोबाईल क्रमांक *' : '10-Digit Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.mobile}
                          onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                          placeholder="98XXXXXXXX"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'अधिकृत ईमेल (Official Email) *' : 'Official Email ID *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="name.role@maharashtra.gov.in"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Dynamic Jurisdiction Dropdowns driven by Role's jurisdictionScope */}
                    {selectedRegRole && (
                      <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-indigo-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              {isMarathi
                                ? SCOPE_HINT[selectedRegScope]?.mr
                                : SCOPE_HINT[selectedRegScope]?.en}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                            {selectedRegScope}
                          </span>
                        </div>

                        {selectedRegScope === 'DISTRICT' ? (
                          <div className="text-[11px] font-semibold text-slate-700 bg-white rounded-xl px-3 py-2 border border-indigo-100">
                            {isMarathi
                              ? 'या भूमिकेसाठी संपूर्ण चंद्रपूर जिल्ह्यातील सर्व १५ तालुके कार्यक्षेत्र लागू राहील.'
                              : 'District-wide jurisdiction across all 15 Chandrapur talukas applies to this role.'}
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {selectedRegScope === 'SUBDIVISION' && (
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  {isMarathi ? 'उपविभाग (Sub-Division)' : 'Sub-Division'}
                                </label>
                                <select
                                  value={regForm.subdivision}
                                  onChange={(e) => handleSubdivisionSelect(e.target.value)}
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                  <option value="">
                                    {isMarathi
                                      ? '-- उपविभाग निवडा (स्वयंचलित तालुका निवडीसाठी) --'
                                      : '-- Select Sub-Division (Pre-fills Talukas) --'}
                                  </option>
                                  {regSubdivisions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {isMarathi ? s.nameMr : s.nameEn} ({s.talukas.join(', ')})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Standard Searchable Multi-Select Talukas Dropdown */}
                            <MultiSelectDropdown
                              label={isMarathi ? 'नियुक्त तालुके (Multi-Taluka)' : 'Assigned Talukas (Multi-Select)'}
                              required
                              options={talukaDropdownOptions}
                              selectedValues={regForm.assignedTalukas}
                              onChange={(nextTalukas) =>
                                setRegForm((prev) => ({
                                  ...prev,
                                  assignedTalukas: nextTalukas,
                                }))
                              }
                              placeholder={isMarathi ? '-- तालुके निवडा (एकापेक्षा जास्त) --' : 'Select one or more Talukas...'}
                              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search talukas...'}
                              emptyText={isMarathi ? 'तालुका आढळला नाही.' : 'No talukas found.'}
                              selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
                              clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
                              selectedLabelText={isMarathi ? 'निवडले' : 'selected'}
                            />

                            {/* Standard Searchable Multi-Select Revenue Circles Dropdown (Circle Officer) */}
                            {selectedRegScope === 'CIRCLE' && (
                              <MultiSelectDropdown
                                label={isMarathi ? 'महसूल मंडळे (Multi-Circle)' : 'Revenue Circles (Multi-Select)'}
                                required
                                options={circleDropdownOptions}
                                selectedValues={regForm.assignedCircles}
                                onChange={(nextCircles) =>
                                  setRegForm((prev) => ({
                                    ...prev,
                                    assignedCircles: nextCircles,
                                  }))
                                }
                                disabled={regForm.assignedTalukas.length === 0}
                                loading={loadingGeoOptions}
                                loadingText={isMarathi ? 'मंडळे लोड होत आहेत...' : 'Loading circles...'}
                                placeholder={
                                  regForm.assignedTalukas.length === 0
                                    ? (isMarathi ? 'प्रथम वरून तालुका निवडा' : 'Select a Taluka first...')
                                    : (isMarathi ? '-- महसूल मंडळे निवडा --' : 'Select one or more Revenue Circles...')
                                }
                                searchPlaceholder={isMarathi ? 'महसूल मंडळ शोधा...' : 'Search revenue circles...'}
                                emptyText={isMarathi ? 'मंडळ आढळले नाही.' : 'No revenue circles found.'}
                                selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
                                clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
                                selectedLabelText={isMarathi ? 'निवडले' : 'selected'}
                              />
                            )}

                            {/* Standard Searchable Multi-Select Villages Dropdown (Required for Talathi, Optional for SDO/Tahasildar/Circle) */}
                            <MultiSelectDropdown
                              label={
                                selectedRegScope === 'VILLAGE'
                                  ? (isMarathi ? 'नियुक्त गावे / सझा (Multi-Village)' : 'Assigned Villages / Saja (Multi-Select)')
                                  : (isMarathi ? 'विशिष्ट गावे निवडा (ऐच्छिक / Multi-Village)' : 'Specific Villages (Optional Multi-Select)')
                              }
                              required={selectedRegScope === 'VILLAGE'}
                              options={villageDropdownOptions}
                              selectedValues={regForm.assignedVillages}
                              onChange={(nextVillages) =>
                                setRegForm((prev) => ({
                                  ...prev,
                                  assignedVillages: nextVillages,
                                }))
                              }
                              disabled={regForm.assignedTalukas.length === 0}
                              loading={loadingGeoOptions}
                              loadingText={isMarathi ? 'गावे लोड होत आहेत...' : 'Loading villages...'}
                              placeholder={
                                regForm.assignedTalukas.length === 0
                                  ? (isMarathi ? 'प्रथम वरून तालुका निवडा' : 'Select a Taluka first...')
                                  : selectedRegScope === 'VILLAGE'
                                  ? (isMarathi ? '-- गावे निवडा (एकापेक्षा जास्त) --' : 'Select one or more Villages...')
                                  : (isMarathi ? 'ऐच्छिक: विशिष्ट गावे निवडण्यासाठी क्लिक करा...' : 'Optional: Select specific villages...')
                              }
                              searchPlaceholder={isMarathi ? 'गाव शोधा (उदा. माढेळी)...' : 'Search villages...'}
                              emptyText={isMarathi ? 'या तालुक्यासाठी गाव आढळले नाही.' : 'No villages found for selected talukas.'}
                              selectAllText={isMarathi ? 'सर्व निवडा' : 'Select All'}
                              clearText={isMarathi ? 'सर्व काढा' : 'Clear'}
                              selectedLabelText={isMarathi ? 'गावे निवडली' : 'selected'}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'संकेतशब्द (किमान ८ अक्षरे) *' : 'Password (Min 8 chars) *'}
                        </label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isMarathi ? 'संकेतशब्द पुन्हा टाका *' : 'Confirm Password *'}
                        </label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        required
                        checked={regForm.consentGiven}
                        onChange={(e) => setRegForm({ ...regForm, consentGiven: e.target.checked })}
                        className="mt-0.5 w-3.5 h-3.5 text-indigo-600 rounded shrink-0"
                      />
                      <span>
                        {isMarathi
                          ? 'मी DPDPA २०२३ गोपनीयता धोरणानुसार माझ्या अधिकृत महसूल डेटाच्या प्रक्रियेसाठी संमती देत आहे.'
                          : 'I consent to the processing of my official service details under the DPDPA 2023 privacy policy.'}
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading || regRoles.length === 0 || !regForm.consentGiven}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {loading
                          ? isMarathi ? 'नोंदणी सबमिट होत आहे...' : 'Submitting Registration...'
                          : isMarathi ? 'नोंदणी सबमिट करा (Superadmin मंजुरीसाठी)' : 'Submit Registration for Superadmin Approval'}
                      </span>
                    </button>
                  </form>
              </div>
            )}

            <div className="pt-2">
              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {isMarathi
                    ? 'केवळ अधिकृत महसूल अधिकारी व कर्मचाऱ्यांसाठी मर्यादित.'
                    : 'Restricted for authorized revenue officers and administrative staff.'}
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
