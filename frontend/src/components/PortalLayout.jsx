'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RouteGuard from './RouteGuard';
import AuthModal from './landing/AuthModal';
import LandingFooter from './landing/LandingFooter';
import CookieConsentBanner from './CookieConsentBanner';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';

const STANDALONE_PUBLIC_ROUTES = ['/', '/privacy-policy', '/terms', '/accessibility-statement'];

export default function PortalLayout({ children }) {
  const pathname = usePathname();
  const { user, loading, isLoginModalOpen, closeLoginModal } = useAuth();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Restore saved sidebar collapsed state on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chanda_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('chanda_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isStandalone = STANDALONE_PUBLIC_ROUTES.includes(pathname);
  const isGlossary = pathname === '/glossary';

  // Public Landing / Legal Pages (No internal layout)
  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 selection:bg-amber-400 selection:text-slate-950">
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <CookieConsentBanner />
      </div>
    );
  }

  // Loading Session Check State (No sidebar flicker)
  if (loading && !isGlossary) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-blue-900 border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-700">{t('common.sessionCheck')}</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user on public /glossary page:
  // Render Official Navbar + Full Width Workspace + Footer!
  if (!user && isGlossary) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 font-sans">
        <Navbar
          sidebarCollapsed={true}
          onToggleSidebar={() => {}}
          onToggleMobileSidebar={() => {}}
          hideSidebarToggle={true}
        />
        <div className="w-full px-3 sm:px-5 lg:px-6 flex-1 py-4 sm:py-6">
          <main id="main-content" className="w-full">
            {children}
          </main>
        </div>
        <LandingFooter />
        <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <CookieConsentBanner />
      </div>
    );
  }

  // Unauthenticated user attempting to view protected route:
  // Show clean gateway WITHOUT internal officer sidebar!
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 font-sans">
        <Navbar
          sidebarCollapsed={true}
          onToggleSidebar={() => {}}
          onToggleMobileSidebar={() => {}}
          hideSidebarToggle={true}
        />
        <main id="main-content" className="flex-1 flex items-center justify-center p-4">
          <RouteGuard>{children}</RouteGuard>
        </main>
        <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <CookieConsentBanner />
      </div>
    );
  }

  // Authenticated Officer Layout: Full Workspace with Sidebar
  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans w-full max-w-full overflow-x-hidden lg:overflow-x-visible">
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />
      <div className="w-full max-w-full px-3 sm:px-5 lg:px-6 flex-1 py-3 sm:py-4 flex items-start gap-3 sm:gap-4 min-w-0 overflow-x-hidden lg:overflow-x-visible">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onToggleCollapse={handleToggleSidebar}
        />
        <main id="main-content" className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden relative pb-16 lg:pb-0">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <CookieConsentBanner />
    </div>
  );
}
