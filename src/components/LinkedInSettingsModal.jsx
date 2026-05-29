import React from 'react';
import { X, Check, ExternalLink, LogOut } from 'lucide-react';

const LinkedInIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const REDIRECT_URI       = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;

const LinkedInSettingsModal = ({ isOpen, onClose, linkedinSettings, onDisconnect }) => {
  if (!isOpen) return null;

  const isConnected = linkedinSettings?.connected && linkedinSettings?.accessToken;

  const handleConnect = () => {
    if (!LINKEDIN_CLIENT_ID) {
      alert('VITE_LINKEDIN_CLIENT_ID is not set in your .env file.');
      return;
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id:     LINKEDIN_CLIENT_ID,
      redirect_uri:  REDIRECT_URI,
      scope:         'openid profile email w_member_social',
    });
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-darkborder shadow-2xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-darkborder/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0A66C2]/15 text-[#0A66C2] p-2 rounded-xl border border-[#0A66C2]/10">
              <LinkedInIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">LinkedIn Settings</h3>
              <p className="text-[10px] text-slate-500">Connect your account to publish directly</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">LinkedIn Connected</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Person ID: {linkedinSettings.personId}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your LinkedIn account is connected. Posts will be published to your personal profile.
              </p>
              <button onClick={onDisconnect}
                className="w-full py-2 text-xs font-semibold rounded-lg border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Disconnect LinkedIn
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your LinkedIn account to publish AI-generated posts directly to your personal profile.
              </p>
              <div className="bg-slate-900/60 border border-darkborder rounded-xl p-3.5 space-y-1.5 text-[11px] text-slate-500">
                <p className="font-semibold text-slate-400">Permissions requested:</p>
                <p>• Read your profile (name, photo)</p>
                <p>• Post on your behalf (w_member_social)</p>
              </div>
              <button onClick={handleConnect}
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#0A66C2]/20">
                <LinkedInIcon className="h-4 w-4" />
                Connect LinkedIn Account
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-darkborder/60 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary py-2 px-4 text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInSettingsModal;
