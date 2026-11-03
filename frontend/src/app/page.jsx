'use client';

import { useState } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import HeroBannerSlider from '../components/landing/HeroBannerSlider';
import ProvenanceShowcase from '../components/landing/ProvenanceShowcase';
import TalukaSlider from '../components/landing/TalukaSlider';
import LandingFooter from '../components/landing/LandingFooter';
import AuthModal from '../components/landing/AuthModal';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleOpenAuth = () => {
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] text-[#252B36] font-sans selection:bg-[#4169E1]/20 selection:text-[#252B36]">
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

      {/* Official Multi-Column Government Footer */}
      <LandingFooter />

      {/* Revenue Officer Internal Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
