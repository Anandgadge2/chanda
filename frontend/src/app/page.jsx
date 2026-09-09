'use client';

import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import HeroBannerSlider from '../components/landing/HeroBannerSlider';
import ProvenanceShowcase from '../components/landing/ProvenanceShowcase';
import TalukaSlider from '../components/landing/TalukaSlider';
import LegalComplianceSection from '../components/landing/LegalComplianceSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import LandingFooter from '../components/landing/LandingFooter';
import AuthModal from '../components/landing/AuthModal';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Official Government Top Navigation Bar */}
      <LandingNavbar onOpenAuth={handleOpenAuth} />

      {/* Hero Banner with Search & Real-time Metrics */}
      <LandingHero onOpenAuth={handleOpenAuth} />

      {/* Interactive Feature & Pillar Slider */}
      <HeroBannerSlider />

      {/* 1950 Baseline & Title Provenance Showcase */}
      <ProvenanceShowcase />

      {/* 15 Talukas Explorer Carousel */}
      <TalukaSlider />

      {/* MLRC 1966 Statutory Legal Compliance Sections */}
      <LegalComplianceSection />

      {/* 4-Step Land Governance & Enforcement Workflow */}
      <WorkflowSection />

      {/* Official Multi-Column Government Footer */}
      <LandingFooter />

      {/* Officer Login & Citizen Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuth}
        initialTab={authModalTab}
      />
    </div>
  );
}
