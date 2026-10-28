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
import { useTranslation } from '../../components/LanguageContext';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const { isMarathi } = useTranslation();

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
      setProfileSuccess(res.message || (isMarathi ? 'प्रोफाइल यशस्वीरित्या अद्यतनित करण्यात आले.' : 'Profile updated successfully.'));
    } catch (err) {
      setProfileError(err.message || (isMarathi ? 'प्रोफाइल अद्यतन करताना त्रुटी आली.' : 'Failed to update profile.'));
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
      setPasswordError(isMarathi ? 'नवीन संकेतशब्द आणि खात्री संकेतशब्द जुळत नाहीत.' : 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(isMarathi ? 'नवीन संकेतशब्द किमान ८ अक्षरांचा असणे आवश्यक आहे.' : 'New password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || (isMarathi ? 'संकेतशब्द यशस्वीरित्या बदलण्यात आला.' : 'Password updated successfully.'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || (isMarathi ? 'संकेतशब्द बदलताना त्रुटी आली.' : 'Failed to update password.'));
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
      setDpdpaError(err.message || (isMarathi ? 'डेटा निर्यात अयशस्वी झाले.' : 'Failed to export data.'));
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
      setDpdpaError(err.message || (isMarathi ? 'विनंती नोंदवणे अयशस्वी झाले.' : 'Failed to submit request.'));
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
        <h2 className="text-xl font-bold text-slate-900">{isMarathi ? 'सत्र समाप्त किंवा अनधिकृत प्रवेश' : 'Session Expired or Unauthorized Access'}</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {isMarathi ? 'खाते सेटिंग्ज पाहण्यासाठी कृपया प्रथम महसूल अधिकारी खात्यात लॉगिन करा.' : 'Please sign in to your official revenue account to access settings.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs"
        >
          {isMarathi ? 'मुख्य पृष्ठावर जा' : 'Go to Homepage'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 max-w-6xl mx-auto pb-8">
      {/* Executive Command Hero Header - Pro Compact */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-indigo-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-2xs">
                {user.fullName ? user.fullName.charAt(0) : (isMarathi ? 'अ' : 'O')}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"
                title={isMarathi ? 'सत्र सक्रिय' : 'Session Active'}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap leading-tight">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {user.fullName || (isMarathi ? 'महसूल अधिकारी' : 'Revenue Officer')}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {user.role}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isMarathi ? 'सक्रिय सत्र' : 'Active Session'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                <span>{user.designation || (isMarathi ? 'प्रशासकीय पद' : 'Administrative Post')}</span>
                {user.taluka && (
                  <>
                    <span>•</span>
                    <span>{isMarathi ? `ता. ${user.taluka}` : `Taluka ${user.taluka}`}</span>
                  </>
                )}
                <span>•</span>
                <span>{isMarathi ? 'जिल्हाधिकारी कार्यालय चंद्रपूर' : 'District Collectorate Chandrapur'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-[11px] font-bold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {isMarathi ? 'DPDPA संमती: v' : 'DPDPA Consent: v'}{user.consentVersion || '1.0-2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Segmented Settings Navigation Tabs */}
      <div className="inline-flex p-1 rounded-2xl bg-slate-200/60 backdrop-blur-md border border-slate-300/60 gap-1.5 shadow-2xs overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <User className="w-4 h-4 text-blue-700" />
          <span>{isMarathi ? '१. संपर्क व वैयक्तिक तपशील' : '1. Profile & Contact'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-white text-blue-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>{isMarathi ? '२. सुरक्षितता व संकेतशब्द' : '2. Security & Password'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dpdpa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dpdpa'
              ? 'bg-white text-emerald-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{isMarathi ? '३. DPDPA २०२३ डेटा अधिकार' : '3. DPDPA 2023 Data Rights'}</span>
        </button>
      </div>

      {/* Tab 1: Profile & Contact Details */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-800" />
              <span>{isMarathi ? 'वैयक्तिक व संपर्क तपशील (Profile & Contact Information)' : 'Profile & Contact Information'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isMarathi ? 'आपले नाव, अधिकृत ईमेल आणि मोबाइल क्रमांक अद्यतनित करा' : 'Update your full name, official email, and mobile contact number'}
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
                  {isMarathi ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
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
                  {isMarathi ? 'अधिकृत ईमेल पत्ता (Email) *' : 'Official Email Address *'}
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
                  {isMarathi ? 'मोबाइल क्रमांक (Mobile Number)' : 'Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="settings-mobile"
                    type="tel"
                    placeholder={isMarathi ? '१० अंकी मोबाइल क्रमांक' : '10-digit mobile number'}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-designation" className="block text-xs font-bold text-slate-800">
                  {isMarathi ? 'पदनाम (Designation)' : 'Designation'}
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
                {profileLoading ? (isMarathi ? 'जतन होत आहे...' : 'Saving...') : (isMarathi ? 'माहिती जतन करा (Save Changes)' : 'Save Changes')}
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
              <span>{isMarathi ? 'सुरक्षितता व संकेतशब्द बदल (Change Password)' : 'Security & Change Password'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isMarathi ? 'आपल्या महसूल अधिकारी खात्याचा सुरक्षित संकेतशब्द वेळेवर अद्यतनित करा' : 'Regularly update your official revenue account password'}
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
                {isMarathi ? 'चालू संकेतशब्द (Current Password) *' : 'Current Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isMarathi ? 'सध्याचा पासवर्ड टाका' : 'Enter current password'}
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
                {isMarathi ? 'नवीन संकेतशब्द (New Password) *' : 'New Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isMarathi ? 'किमान ८ अक्षरे किंवा अंक' : 'Minimum 8 characters or digits'}
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
              <p className="text-[11px] text-slate-400 font-medium">{isMarathi ? 'किमान ८ अक्षरे, अंक आणि विशेष चिन्ह वापरावे.' : 'Use at least 8 characters with digits and symbols.'}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-confirm-pw" className="block text-xs font-bold text-slate-800">
                {isMarathi ? 'नवीन संकेतशब्दाची खात्री (Confirm New Password) *' : 'Confirm New Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="settings-confirm-pw"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isMarathi ? 'नवीन पासवर्ड पुन्हा टाका' : 'Re-enter new password'}
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
                {passwordLoading ? (isMarathi ? 'संकेतशब्द बदलत आहे...' : 'Updating password...') : (isMarathi ? 'संकेतशब्द बदला (Update Password)' : 'Update Password')}
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
                  <span>{isMarathi ? 'डिजिटल व्यक्तिगत डेटा संरक्षण कायदा (DPDPA 2023) अधिकार' : 'Digital Personal Data Protection Act (DPDPA 2023) Rights'}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isMarathi ? 'कलम ११ (डेटा माहिती व निर्यात) व कलम १२ (डेटा दुरुस्ती व निष्कासन विनंती)' : 'Section 11 (Data Access & Export) & Section 12 (Correction & Erasure Request)'}
                </p>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full">
                {isMarathi ? 'सक्रिय संमती: मान्य (Consent Active)' : 'Active Consent Recorded'}
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
                      {isMarathi ? 'कलम ११: वैयक्तिक डेटा निर्यात' : 'Section 11: Personal Data Export'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      Export Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isMarathi ? 'आपल्या खात्यातील वैयक्तिक माहिती, सक्रिय लॉगिन सत्रे व सुरक्षा ऑडिट नोंदी संरचित JSON फाईल स्वरूपात डाउनलोड करा.' : 'Download your personal profile, active sessions, and security audit logs in structured JSON format.'}
                  </p>
                </div>

                {exportSuccess && (
                  <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{isMarathi ? 'डेटा फाइल यशस्वीरित्या डाऊनलोड झाली!' : 'Data package downloaded successfully!'}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportLoading ? (isMarathi ? 'तयार होत आहे...' : 'Generating...') : (isMarathi ? 'माझा डेटा डाउनलोड करा (.JSON)' : 'Download My Data (.JSON)')}</span>
                </button>
              </div>

              {/* Section 12: Request Erasure */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    {isMarathi ? 'कलम १२: डेटा निष्कासन विनंती' : 'Section 12: Data Erasure Request'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                    Request Erasure
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMarathi ? 'आपले वैयक्तिक खाते आणि ओळख निष्कासित करण्याची किंवा दुरुस्त करण्याची विनंती नोंदवा.' : 'Submit a request to erase or correct personal account and identity credentials.'}
                </p>

                {erasureResult ? (
                  <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      {isMarathi ? 'विनंती यशस्वीरित्या नोंदवली गेली!' : 'Request submitted successfully!'}
                    </p>
                    <p><strong>{isMarathi ? 'तिकीट आयडी:' : 'Ticket ID:'}</strong> <code className="bg-emerald-100 px-1 py-0.5 rounded">{erasureResult.requestId}</code></p>
                    <p><strong>{isMarathi ? 'निवारण मुदत:' : 'Turnaround:'}</strong> {isMarathi ? '७२ कामकाजाचे तास (DPO पुनरावलोकन)' : '72 working hours (DPO Review)'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleErasureRequest} className="space-y-2.5">
                    <div>
                      <label htmlFor="settings-erasure-select" className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isMarathi ? 'निष्कासनाचे कारण:' : 'Reason for Erasure:'}
                      </label>
                      <select
                        id="settings-erasure-select"
                        value={erasureReason}
                        onChange={(e) => setErasureReason(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                      >
                        <option value="Account closure / खाते वापर बंद करणे">{isMarathi ? 'खाते वापर बंद करणे (Account closure)' : 'Account Closure'}</option>
                        <option value="Transfer to other district / इतर जिल्ह्यात बदली">{isMarathi ? 'इतर जिल्ह्यात बदली (Officer transfer)' : 'Transfer to Other District'}</option>
                        <option value="Personal privacy request / वैयक्तिक गोपनीयता विनंती">{isMarathi ? 'वैयक्तिक गोपनीयता विनंती (Privacy request)' : 'Personal Privacy Request'}</option>
                        <option value="Other statutory reason / इतर वैधानिक कारण">{isMarathi ? 'इतर वैधानिक कारण (Other)' : 'Other Statutory Reason'}</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={isMarathi ? 'अतिरिक्त स्पष्टीकरण (पर्यायी)...' : 'Additional justification (optional)...'}
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
                      <span>{erasureLoading ? (isMarathi ? 'नोंदवत आहे...' : 'Submitting...') : (isMarathi ? 'डेटा निष्कासन विनंती सादर करा' : 'Submit Erasure Request')}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Legal Advisory & Policy Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isMarathi ? 'तक्रार निवारण मुदत: कमाल ७२ तास (डेटा संरक्षण अधिकारी, चंद्रपूर)' : 'Grievance Resolution: Max 72 hours (Data Protection Officer, Chandrapur)'}</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/privacy-policy"
                  className="text-blue-700 hover:text-blue-900 font-bold underline inline-flex items-center gap-1"
                >
                  <span>{isMarathi ? 'गोपनीयता धोरण' : 'Privacy Policy'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-300">•</span>
                <Link
                  href="/accessibility-statement"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  {isMarathi ? 'सुलभता विधान' : 'Accessibility Statement'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
