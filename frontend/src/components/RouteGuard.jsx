'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, LogIn, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';
import ChandrapurDistrictLogo from './landing/ChandrapurDistrictLogo';

export default function RouteGuard({ children, allowedRoles = [] }) {
  const { user, loading, openLoginModal } = useAuth();
  const pathname = usePathname();

  if (pathname === '/glossary') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-3 border-blue-900 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-700">सत्र पडताळणी सुरू आहे...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <ChandrapurDistrictLogo className="w-6 h-6" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              जिल्हाधिकारी कार्यालय, चंद्रपूर
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
            प्रवेश निर्बंधित
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            हे पृष्ठ केवळ अधिकृत महसूल अधिकाऱ्यांसाठी (Collector / SDO / तहसीलदार / तलाठी) उपलब्ध आहे. कृपया पुढे जाण्यापूर्वी लॉगिन करा.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>अधिकारी लॉगिन करा</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य सार्वजनिक पृष्ठावर परत जा</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-black text-slate-900 mb-2">
            या कृतीसाठी आपणास अधिकार नाहीत
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            आपली भूमिका: <span className="font-bold text-slate-900">{user.role}</span> ({user.designation || 'अधिकारी'})
          </p>
          <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-100 mb-6">
            हे मॉड्यूल वापरण्यासाठी खालीलपैकी एक पद असणे आवश्यक आहे:
            <span className="block font-bold mt-1">{allowedRoles.join(', ')}</span>
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-blue-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>डॅशबोर्डवर परत जा</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
