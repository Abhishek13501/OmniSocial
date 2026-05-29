import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, FileText } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden pt-14 pb-20 sm:pb-28">
      {/* Glow Backdrops */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-600 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Top Pill Tag */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold leading-5 text-brand-300 backdrop-blur-sm animate-pulse-subtle">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Version 1.0 Live</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Automate Your Socials <br />
            <span className="text-accent-gradient">With AI Precision</span>
          </h1>

          {/* Paragraph */}
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
            Transform articles, PDFs, and documentation into production-ready LinkedIn posts and Telegram channel announcements. Generate, edit, and approve in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Get Started for Free
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="text-sm font-semibold leading-6 text-slate-300 hover:text-white transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-16 sm:mt-24 lg:mt-28 relative">
          <div className="rounded-2xl bg-slate-950/40 p-2 ring-1 ring-slate-800 backdrop-blur-md max-w-5xl mx-auto shadow-2xl">
            <div className="rounded-xl border border-darkborder bg-darkcard/80 overflow-hidden shadow-2xl">
              {/* Header mockup toolbar */}
              <div className="flex items-center justify-between border-b border-darkborder bg-darkbg/50 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900 border border-darkborder/60 px-6 py-1 text-[11px] text-slate-500 font-mono w-64 md:w-96 justify-center">
                  omnisocial.ai/workspace/dashboard
                </div>
                <div className="w-12" />
              </div>
              
              {/* Internal window mockup */}
              <div className="grid grid-cols-1 md:grid-cols-4 min-h-[360px] text-left">
                {/* Sidebar Mockup */}
                <div className="border-r border-darkborder bg-slate-950/20 p-4 space-y-4 hidden md:block">
                  <div className="h-8 rounded bg-slate-900 border border-darkborder/60 flex items-center px-2 text-[10px] text-slate-400 gap-1.5">
                    <Sparkles className="h-3 w-3 text-brand-400" /> Omni Workspace
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Navigation</span>
                    <div className="h-7 rounded bg-brand-500/10 text-brand-400 text-xs flex items-center px-2 font-medium">Dashboard</div>
                    <div className="h-7 rounded hover:bg-slate-900/60 text-slate-500 text-xs flex items-center px-2">History Archives</div>
                    <div className="h-7 rounded hover:bg-slate-900/60 text-slate-500 text-xs flex items-center px-2">Integrations</div>
                  </div>
                </div>
                
                {/* Editor Content Mockup */}
                <div className="col-span-3 p-6 space-y-6 bg-slate-900/10">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">Generate Social Drafts</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 h-10 rounded-lg bg-darkbg border border-darkborder/80 flex items-center px-3 text-xs text-slate-500">
                        https://techcrunch.com/article/ai-social-automation-trends
                      </div>
                      <div className="h-10 rounded-lg bg-brand-600 flex items-center justify-center px-4 text-xs font-semibold text-white shadow-md">
                        Generate
                      </div>
                    </div>
                  </div>
                  
                  {/* Results preview mock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-darkborder/80 bg-darkcard/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-400 flex items-center gap-1"><Zap className="h-3 w-3" /> LinkedIn Post</span>
                        <span className="text-[10px] text-slate-500">Draft</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded bg-slate-800" />
                        <div className="h-2 w-5/6 rounded bg-slate-800" />
                        <div className="h-2 w-4/5 rounded bg-slate-800" />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-darkborder/80 bg-darkcard/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1"><FileText className="h-3 w-3" /> Telegram Announce</span>
                        <span className="text-[10px] text-slate-500">Draft</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full rounded bg-slate-800" />
                        <div className="h-2 w-11/12 rounded bg-slate-800" />
                        <div className="h-2 w-3/4 rounded bg-slate-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
