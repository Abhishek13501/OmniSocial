import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import MainLayout from '../layouts/MainLayout';
import { Check, Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* Features Grid */}
        <FeatureCards />

        {/* Pricing Plan Mockup */}
        <section id="pricing" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.02)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-base text-slate-400">
                Unlock automated generation limits to supercharge your social channels.
              </p>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
              
              {/* Free Tier */}
              <div className="rounded-2xl border border-darkborder bg-darkcard/30 p-8 flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
                <div>
                  <h3 className="text-lg font-semibold leading-8 text-slate-300">Starter Plan</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-400">Perfect for evaluating post styling and n8n pipelines.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">$0</span>
                    <span className="text-sm font-semibold leading-6 text-slate-500">/month</span>
                  </p>
                  
                  <ul className="mt-8 space-y-3.5 text-sm leading-6 text-slate-400 border-t border-darkborder/50 pt-8">
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>15 AI content generations per month</span>
                    </li>
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>LinkedIn & Telegram templates</span>
                    </li>
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>Manual review editor tools</span>
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="btn-secondary w-full justify-center mt-8 py-3">
                  Start Free Drafts
                </Link>
              </div>

              {/* Creator Tier */}
              <div className="relative rounded-2xl border border-brand-500/30 bg-darkcard/70 p-8 flex flex-col justify-between hover:border-brand-500/50 shadow-lg shadow-brand-500/[0.02] transition-all duration-300">
                {/* Popular Badge */}
                <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>

                <div>
                  <h3 className="text-lg font-semibold leading-8 text-white">Creator Pro</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-400">For active creators and social publishers who post daily.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">$29</span>
                    <span className="text-sm font-semibold leading-6 text-slate-500">/month</span>
                  </p>
                  
                  <ul className="mt-8 space-y-3.5 text-sm leading-6 text-slate-400 border-t border-darkborder/50 pt-8">
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span className="text-white font-medium">Unlimited content generations</span>
                    </li>
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>Custom API custom endpoints</span>
                    </li>
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>Automated scheduling pipelines</span>
                    </li>
                    <li className="flex gap-x-3 items-center">
                      <Check className="h-4 w-4 text-brand-400 shrink-0" />
                      <span>Priority LLM response speeds</span>
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="btn-primary w-full justify-center mt-8 py-3 glow-border">
                  Upgrade to Pro
                </Link>
              </div>

            </div>
          </div>
        </section>

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
