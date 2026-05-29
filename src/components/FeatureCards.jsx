import React from 'react';
import { Link2, FileUp, Edit3, Send, CheckSquare, Sparkles } from 'lucide-react';

const features = [
  {
    name: 'URL Ingestion',
    description: 'Paste any web article link. Our system automatically processes structural text and pulls core insights.',
    icon: Link2,
    color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
  },
  {
    name: 'PDF & DOCX Support',
    description: 'Upload reports, briefings, or documentation files directly. Formats structured AI drafts based on raw text.',
    icon: FileUp,
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  },
  {
    name: 'Smart Formatter',
    description: 'Tailors copy to suit individual platform audiences: professional and structured for LinkedIn, casual and bold for Telegram.',
    icon: Sparkles,
    color: 'text-brand-400 border-brand-500/20 bg-brand-500/5',
  },
  {
    name: 'Inline Rich Editor',
    description: 'Tweak generated paragraphs, refine sentences, or add specific details right from the interactive results preview.',
    icon: Edit3,
    color: 'text-pink-400 border-pink-500/20 bg-pink-500/5',
  },
  {
    name: 'Approve & Publish Later',
    description: 'Commit completed drafts with Approve triggers. Prepare them for automatic scheduled updates.',
    icon: CheckSquare,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  },
  {
    name: 'n8n Integrations',
    description: 'Wired directly with enterprise-grade n8n workflow APIs. Seamless connection to LLM APIs and channel webhooks.',
    icon: Send,
    color: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-20 bg-slate-950/20 border-y border-darkborder/50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Title */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Streamline Content Delivery
          </h2>
          <p className="mt-4 text-base text-slate-400">
            From reading materials to social feeds in seconds. Everything you need to automate your presence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative rounded-2xl border border-darkborder bg-darkcard/50 p-6 hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/[0.02] flex flex-col justify-between"
              >
                <div>
                  {/* Icon Panel */}
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl border mb-5 ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Feature Text */}
                  <h3 className="text-base font-semibold text-white group-hover:text-brand-300 transition-colors duration-200">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Glow strip on hover */}
                <div className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
