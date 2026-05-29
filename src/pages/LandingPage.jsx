import React from 'react';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import MainLayout from '../layouts/MainLayout';
import { Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* Features Grid */}
        <FeatureCards />

        {/* Global Footer */}
        <footer className="border-t border-darkborder bg-slate-950/40 py-10 mt-auto">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span className="text-slate-300 font-semibold font-sans">OmniSocial</span>
              <span>© {new Date().getFullYear()} OmniSocial Inc. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Documentation</a>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
