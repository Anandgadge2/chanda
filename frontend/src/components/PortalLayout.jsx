'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RouteGuard from './RouteGuard';
import AuthModal from './landing/AuthModal';
import { useAuth } from './AuthContext';

const PUBLIC_ROUTES = ['/', '/privacy-policy', '/terms', '/accessibility-statement'];

export default function PortalLayout({ children }) {
  const pathname = usePathname();
  const { user, loading, isLoginModalOpen, closeLoginModal } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Public Landing / Legal Pages (No internal layout)
  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    );
  }

  // Loading Session Check State (No sidebar flicker)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans">
        <div className="w-10 h-10 rounded-full border-3 border-blue-900 border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-700">सत्र पडताळणी सुरू आहे...</p>
      </div>
    );
  }

  // Unauthenticated user attempting to view protected route:
  // Show clean gateway WITHOUT internal officer sidebar!
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
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
      </div>
    );
  }

  // Authenticated Officer Layout: Full Workspace with Sidebar
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full flex-1 py-2.5 sm:py-3.5 flex gap-3 sm:gap-4">
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
