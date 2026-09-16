'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  FileJson,
} from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { api } from '../../lib/api';

export default function SettingsPage() {
  const { user, login } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // DPDPA State
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [erasureReason, setErasureReason] = useState('Account closure / खाते वापर बंद करणे');
  const [erasureNotes, setErasureNotes] = useState('');
  const [erasureLoading, setErasureLoading] = useState(false);
  const [erasureResult, setErasureResult] = useState(null);
  const [dpdpaError, setDpdpaError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'dpdpa'

  // Pre-fill profile data from current user
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
      setDesignation(user.designation || '');
    }
  }, [user]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.updateProfile({
        fullName,
        email,
        mobile,
        designation,
      });
      setProfileSuccess(res.message || 'प्रोफाइल यशस्वीरित्या अद्यतनित करण्यात आले.');
    } catch (err) {
      setProfileError(err.message || 'प्रोफाइल अद्यतन करताना त्रुटी आली.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('नवीन संकेतशब्द आणि खात्री संकेतशब्द जुळत नाहीत.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('नवीन संकेतशब्द किमान ८ अक्षरांचा असणे आवश्यक आहे.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'संकेतशब्द यशस्वीरित्या बदलण्यात आला.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'संकेतशब्द बदलताना त्रुटी आली.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle DPDPA Export (Section 11)
  const handleExportData = async () => {
    setDpdpaError('');
    setExportLoading(true);
    setExportSuccess(false);
    try {
      const response = await api.exportDpdpaData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      const filename = `chanda_dpdpa_export_${user?.id || 'profile'}_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportSuccess(true);
    } catch (err) {
      setDpdpaError(err.message || 'डेटा निर्यात अयशस्वी झाले.');
    } finally {
      setExportLoading(false);
    }
  };

  // Handle DPDPA Erasure (Section 12)
  const handleErasureRequest = async (e) => {
    e.preventDefault();
    setDpdpaError('');
    setErasureLoading(true);
    try {
      const combinedReason = erasureNotes.trim()
        ? `${erasureReason} - ${erasureNotes.trim()}`
        : erasureReason;
      const res = await api.requestDpdpaErasure(combinedReason);
      setErasureResult(res);
    } catch (err) {
      setDpdpaError(err.message || 'विनंती नोंदवणे अयशस्वी झाले.');
    } finally {
      setErasureLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">सत्र समाप्त किंवा अनधिकृत प्रवेश</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          खाते सेटिंग्ज पाहण्यासाठी कृपया प्रथम महसूल अधिकारी खात्यात लॉगिन करा.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs"
        >
          मुख्य पृष्ठावर जा
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-6xl mx-auto pb-10">
      {/* Compact Officer Profile Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-950 to-indigo-900 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
              {user.fullName ? user.fullName.charAt(0) : 'अ'}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
              title="सत्र सक्रिय"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap leading-tight">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {user.fullName || 'महसूल अधिकारी'}
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-100 text-blue-950 border border-blue-200">
                {user.role}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                सक्रिय
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 truncate">
              <span>{user.designation || 'प्रशासकीय पद'}</span>
              {user.taluka && (
                <>
                  <span>•</span>
                  <span>ता. {user.taluka}</span>
                </>
              )}
              <span>•</span>
              <span>चंद्रपूर</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
            DPDPA संमती: {user.consentVersion || '1.0-2026'}
          </span>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-blue-700" />
          <span>१. संपर्क व वैयक्तिक तपशील (Profile)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>२. सुरक्षितता व संकेतशब्द (Security)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dpdpa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dpdpa'
              ? 'border-emerald-600 text-emerald-950 bg-white rounded-t-xl shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>३. DPDPA २०२३ डेटा अधिकार (Privacy & Rights)</span>
        </button>
      </div>

      {/* Tab 1: Profile & Contact Details */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-800" />
              <span>वैयक्तिक व संपर्क तपशील (Profile & Contact Information)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              आपले नाव, अधिकृत ईमेल आणि मोबाइल क्रमांक अद्यतनित करा
            </p>
          </div>

          {profileSuccess && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="settings-fullname" className="block text-xs font-bold text-slate-800">
                  पूर्ण नाव (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="settings-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-email" className="block text-xs font-bold text-slate-800">
                  अधिकृत ईमेल पत्ता (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="settings-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-mobile" className="block text-xs font-bold text-slate-800">
                  मोबाइल क्रमांक (Mobile Number)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="settings-mobile"
                    type="tel"
                    placeholder="१० अंकी मोबाइल क्रमांक"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-designation" className="block text-xs font-bold text-slate-800">
                  पदनाम (Designation)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="settings-designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'जतन होत आहे...' : 'माहिती जतन करा (Save Changes)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password Change */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>सुरक्षितता व संकेतशब्द बदल (Change Password)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              आपल्या महसूल अधिकारी खात्याचा सुरक्षित संकेतशब्द वेळेवर अद्यतनित करा
            </p>
          </div>

          {passwordSuccess && (
            <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label htmlFor="settings-current-pw" className="block text-xs font-bold text-slate-800">
                चालू संकेतशब्द (Current Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="सध्याचा पासवर्ड टाका"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-new-pw" className="block text-xs font-bold text-slate-800">
                नवीन संकेतशब्द (New Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="किमान ८ अक्षरे किंवा अंक"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">किमान ८ अक्षरे, अंक आणि विशेष चिन्ह वापरावे.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-confirm-pw" className="block text-xs font-bold text-slate-800">
                नवीन संकेतशब्दाची खात्री (Confirm New Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-confirm-pw"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="नवीन पासवर्ड पुन्हा टाका"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {passwordLoading ? 'संकेतशब्द बदलत आहे...' : 'संकेतशब्द बदला (Update Password)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: DPDPA 2023 Statutory Rights */}
      {activeTab === 'dpdpa' && (
        <div className="space-y-5">
          {/* Statutory Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>डिजिटल व्यक्तिगत डेटा संरक्षण कायदा (DPDPA 2023) अधिकार</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  कलम ११ (डेटा माहिती व निर्यात) व कलम १२ (डेटा दुरुस्ती व निष्कासन विनंती)
                </p>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full">
                सक्रिय संमती: मान्य (Consent Active)
              </span>
            </div>

            {dpdpaError && (
              <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{dpdpaError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Section 11: Export Data */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <FileJson className="w-4 h-4 text-blue-700" />
                      कलम ११: वैयक्तिक डेटा निर्यात
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      Export Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    आपल्या खात्यातील वैयक्तिक माहिती, सक्रिय लॉगिन सत्रे व सुरक्षा ऑडिट नोंदी संरचित JSON फाईल स्वरूपात डाउनलोड करा.
                  </p>
                </div>

                {exportSuccess && (
                  <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>डेटा फाइल यशस्वीरित्या डाऊनलोड झाली!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportLoading ? 'तयार होत आहे...' : 'माझा डेटा डाउनलोड करा (.JSON)'}</span>
                </button>
              </div>

              {/* Section 12: Request Erasure */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    कलम १२: डेटा निष्कासन विनंती
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                    Request Erasure
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  आपले वैयक्तिक खाते आणि ओळख निष्कासित करण्याची किंवा दुरुस्त करण्याची विनंती नोंदवा.
                </p>

                {erasureResult ? (
                  <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      विनंती यशस्वीरित्या नोंदवली गेली!
                    </p>
                    <p><strong>तिकीट आयडी:</strong> <code className="bg-emerald-100 px-1 py-0.5 rounded">{erasureResult.requestId}</code></p>
                    <p><strong>निवारण मुदत:</strong> ७२ कामकाजाचे तास (DPO पुनरावलोकन)</p>
                  </div>
                ) : (
                  <form onSubmit={handleErasureRequest} className="space-y-2.5">
                    <div>
                      <label htmlFor="settings-erasure-select" className="block text-[11px] font-bold text-slate-700 mb-1">
                        निष्कासनाचे कारण:
                      </label>
                      <select
                        id="settings-erasure-select"
                        value={erasureReason}
                        onChange={(e) => setErasureReason(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                      >
                        <option value="Account closure / खाते वापर बंद करणे">खाते वापर बंद करणे (Account closure)</option>
                        <option value="Transfer to other district / इतर जिल्ह्यात बदली">इतर जिल्ह्यात बदली (Officer transfer)</option>
                        <option value="Personal privacy request / वैयक्तिक गोपनीयता विनंती">वैयक्तिक गोपनीयता विनंती (Privacy request)</option>
                        <option value="Other statutory reason / इतर वैधानिक कारण">इतर वैधानिक कारण (Other)</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="अतिरिक्त स्पष्टीकरण (पर्यायी)..."
                        value={erasureNotes}
                        onChange={(e) => setErasureNotes(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={erasureLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{erasureLoading ? 'नोंदवत आहे...' : 'डेटा निष्कासन विनंती सादर करा'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Legal Advisory & Policy Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>तक्रार निवारण मुदत: कमाल ७२ तास (डेटा संरक्षण अधिकारी, चंद्रपूर)</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/privacy-policy"
                  className="text-blue-700 hover:text-blue-900 font-bold underline inline-flex items-center gap-1"
                >
                  <span>गोपनीयता धोरण</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  href="/accessibility-statement"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  सुलभता विधान
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
