'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RouteGuard from './RouteGuard';
// import AccessibilityBar from './AccessibilityBar';
import AuthModal from './landing/AuthModal';
import { useAuth } from './AuthContext';

const PUBLIC_ROUTES = ['/', '/privacy-policy', '/terms', '/accessibility-statement'];

export default function PortalLayout({ children }) {
  const pathname = usePathname();
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* <AccessibilityBar /> */}
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* <AccessibilityBar /> */}
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full flex-1 py-3.5 sm:py-5 flex gap-3 sm:gap-5">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main id="main-content" className="flex-1 min-w-0 transition-all duration-300">
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
}
