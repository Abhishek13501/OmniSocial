import React, { useState, useEffect } from 'react';
import { X, Send, Save, Check, AlertCircle, ExternalLink } from 'lucide-react';

const TelegramSettingsModal = ({ isOpen, onClose, currentSettings, onSave, isSaving }) => {
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync fields when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      setBotToken(currentSettings?.botToken || '');
      setChannelId(currentSettings?.channelId || '');
      setError('');
      setSaved(false);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    if (!botToken.trim()) {
      setError('Bot Token is required.');
      return;
    }
    if (!channelId.trim()) {
      setError('Channel ID is required.');
      return;
    }
    // Basic token format check: should contain a colon
    if (!botToken.includes(':')) {
      setError('Bot Token format looks invalid. It should look like 123456:ABC-DEF...');
      return;
    }
    await onSave({ botToken: botToken.trim(), channelId: channelId.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-darkborder shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-darkborder/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#229ED9]/15 text-[#229ED9] p-2 rounded-xl border border-[#229ED9]/10">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Telegram Settings</h3>
              <p className="text-[10px] text-slate-500">Connect your bot to publish directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Bot Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHI..."
              className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Get this from{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#229ED9] hover:underline inline-flex items-center gap-0.5"
              >
                @BotFather <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          {/* Channel ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Channel ID
            </label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="@yourchannel or -1001234567890"
              className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Use @username for public channels or numeric ID for private ones
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current status indicator */}
          {currentSettings?.botToken && !error && (
            <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <Check className="h-3 w-3" />
              Telegram credentials saved — ready to publish
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-darkborder/60 px-6 py-4">
          <button
            onClick={onClose}
            className="btn-secondary py-2 px-4 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className="btn-primary py-2 px-4 text-xs justify-center min-w-[100px]"
          >
            {saved ? (
              <><Check className="h-3.5 w-3.5 text-emerald-300" /> Saved</>
            ) : isSaving ? (
              <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-3.5 w-3.5" /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramSettingsModal;
