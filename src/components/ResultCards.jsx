import React, { useState, useEffect, useRef } from 'react';
import { Send, Copy, Check, FileCheck2, Image as ImageIcon, Plus, Trash, Loader2, Sparkles, RefreshCw, UploadCloud } from 'lucide-react';
import { publishToTelegram, publishToLinkedIn } from '../services/api';
import { loadUserSettings } from '../services/userSettings';
import { useAuth } from '../hooks/useAuth';

const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Image source options
const IMAGE_SOURCES = [
  { id: 'ai',       label: 'AI Generated',   icon: Sparkles },
  { id: 'article',  label: 'Article Image',  icon: ImageIcon },
  { id: 'upload',   label: 'Upload Custom',  icon: UploadCloud },
  { id: 'none',     label: 'None',           icon: ({ className }) => <span className={`flex items-center justify-center text-base leading-none ${className}`}>∅</span> },
];

const ResultCards = ({ data, onSaveHistory, telegramSettings, onOpenTelegramSettings, linkedinSettings, onOpenLinkedInSettings }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('linkedin');

  // Content states
  const [linkedinText, setLinkedinText] = useState('');
  const [telegramText, setTelegramText] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [newHashtag, setNewHashtag] = useState('');

  // Approval states
  const [linkedinApproved, setLinkedinApproved] = useState(false);
  const [telegramApproved, setTelegramApproved] = useState(false);

  // Copy feedback
  const [copiedLinkedin, setCopiedLinkedin] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  // Telegram publish
  const [telegramPublishing, setTelegramPublishing] = useState(false);
  const [toast, setToast] = useState(null);

  // LinkedIn publish
  const [linkedinPublishing, setLinkedinPublishing] = useState(false);

  // Image source selector
  const [selectedImageSource, setSelectedImageSource] = useState('ai');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);  // raw File object
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // object URL for preview
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [aiImageKey, setAiImageKey] = useState(0);
  const fileInputRef = useRef(null);

  // Initialise / reset when data changes
  useEffect(() => {
    if (!data) return;
    setLinkedinText(data.linkedin || '');
    setTelegramText(data.telegram || '');
    setHashtags(data.hashtags || []);
    setLinkedinApproved(false);
    setTelegramApproved(false);
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    setAiImageUrl(data.aiImage || null);
    // Default source: article if available, otherwise ai
    setSelectedImageSource(data.articleImage ? 'article' : 'ai');
  }, [data]);

  if (!data) return null;

  // Derive the active image URL from the selected source
  const activeImageUrl = (() => {
    if (selectedImageSource === 'none')    return null;
    if (selectedImageSource === 'article') return data.articleImage || null;
    if (selectedImageSource === 'upload')  return uploadedImagePreview || null;
    // 'ai'
    return aiImageUrl ? `${aiImageUrl}${aiImageKey > 0 ? `&_r=${aiImageKey}` : ''}` : null;
  })();

  const handleRegenerateAi = () => {
    const prompt = encodeURIComponent(`${telegramText} ${hashtags.join(' ')}`);
    setAiImageUrl(`https://image.pollinations.ai/prompt/${prompt}`);
    setAiImageKey(k => k + 1);
    console.log('[OmniSocial] Regenerated AI image prompt:', prompt);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke previous preview URL to avoid memory leaks
    if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
    setUploadedImageFile(file);
    setUploadedImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const handleCopy = async (text, setCopyState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(true);
      setTimeout(() => setCopyState(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddHashtag = (e) => {
    e.preventDefault();
    if (!newHashtag.trim()) return;
    let tag = newHashtag.trim();
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!hashtags.includes(tag)) setHashtags([...hashtags, tag]);
    setNewHashtag('');
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const buildSavePayload = (overrides = {}) => ({
    linkedin: linkedinText,
    telegram: telegramText,
    hashtags,
    articleImage: data.articleImage,
    aiImage: aiImageUrl,
    linkedinApproved,
    telegramApproved,
    ...overrides,
  });

  const triggerSave = () => { if (onSaveHistory) onSaveHistory(buildSavePayload()); };

  const handleApproveLinkedin = () => {
    const next = !linkedinApproved;
    setLinkedinApproved(next);
    if (onSaveHistory) onSaveHistory(buildSavePayload({ linkedinApproved: next }));
  };

  const handleApproveTelegram = () => {
    const next = !telegramApproved;
    setTelegramApproved(next);
    if (onSaveHistory) onSaveHistory(buildSavePayload({ telegramApproved: next }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePublishTelegram = async () => {
    if (!telegramSettings?.botToken || !telegramSettings?.channelId) {
      showToast('error', 'Add your Telegram Bot Token and Channel ID in Settings first');
      if (onOpenTelegramSettings) onOpenTelegramSettings();
      return;
    }
    setTelegramPublishing(true);
    try {
      // Custom upload → send File; none → send nothing; AI/article → send URL
      const imageFile = selectedImageSource === 'upload' ? uploadedImageFile : null;
      const imageUrl  = (selectedImageSource !== 'upload' && selectedImageSource !== 'none') ? activeImageUrl : null;

      console.log('[OmniSocial] Telegram publish payload:', {
        telegramLength: telegramText?.length,
        imageUrl,
        imageFile: imageFile ? imageFile.name : null,
        imageSource: selectedImageSource,
        channelId: telegramSettings.channelId,
      });
      await publishToTelegram(telegramText, imageUrl, telegramSettings.botToken, telegramSettings.channelId, imageFile);
      showToast('success', 'Successfully published to Telegram');
    } catch (err) {
      console.error('Telegram publish error:', err);
      showToast('error', 'Telegram publish failed');
    } finally {
      setTelegramPublishing(false);
    }
  };

  const handlePublishLinkedIn = async () => {
    setLinkedinPublishing(true);
    try {
      // Always read fresh credentials from Firestore at publish time —
      // avoids stale React state from the OAuth redirect flow.
      const freshSettings = await loadUserSettings(user?.uid);
      const freshLinkedIn = freshSettings?.linkedin || {};

      console.log('[OmniSocial] LinkedIn settings at publish time (fresh from Firestore):', {
        connected:  freshLinkedIn.connected,
        personId:   freshLinkedIn.personId,
        hasToken:   !!freshLinkedIn.accessToken,
      });
      console.log('[OmniSocial] Publishing token:', freshLinkedIn.accessToken ? '***set***' : '(MISSING)');
      console.log('[OmniSocial] Publishing personId:', freshLinkedIn.personId || '(MISSING)');

      if (!freshLinkedIn.connected || !freshLinkedIn.accessToken) {
        showToast('error', 'Connect your LinkedIn account first');
        if (onOpenLinkedInSettings) onOpenLinkedInSettings();
        return;
      }

      const imageFile = selectedImageSource === 'upload' ? uploadedImageFile : null;
      const imageUrl  = (selectedImageSource !== 'upload' && selectedImageSource !== 'none') ? activeImageUrl : null;

      // Derive postType for n8n routing
      let postType = 'text';
      if (selectedImageSource === 'upload')   postType = 'image';
      if (selectedImageSource === 'ai')       postType = 'ai-image';
      if (selectedImageSource === 'article')  postType = 'ai-image'; // article URLs use same image upload flow

      console.log('[OmniSocial] LinkedIn publish payload:', {
        linkedinLength: linkedinText?.length,
        imageUrl,
        imageFile: imageFile ? imageFile.name : null,
        imageSource: selectedImageSource,
        postType,
        personId: freshLinkedIn.personId,
      });

      await publishToLinkedIn(
        linkedinText,
        hashtags,
        imageUrl,
        freshLinkedIn.accessToken,
        freshLinkedIn.personId,
        postType,
        imageFile        // File object for 'image' postType, null otherwise
      );
      showToast('success', 'Successfully published to LinkedIn');
    } catch (err) {
      console.error('LinkedIn publish error:', err);
      showToast('error', 'LinkedIn publish failed');
    } finally {
      setLinkedinPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium animate-fade-in ${
          toast.type === 'success'
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
            : 'bg-red-950 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            : <span className="h-4 w-4 shrink-0 text-red-400">✕</span>
          }
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 border border-darkborder rounded-xl p-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Generated Content Output</h3>
          <p className="text-xs text-slate-400">Review, customize paragraph edits, and toggle publishing approvals.</p>
        </div>
        <button onClick={triggerSave} className="btn-secondary py-1.5 px-3 text-xs bg-slate-950 hover:bg-slate-900 border-brand-500/20 hover:border-brand-500/40">
          Save Draft Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Platform Cards ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden bg-slate-950 p-1 border border-darkborder rounded-xl">
            {[
              { id: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
              { id: 'telegram', label: 'Telegram', Icon: Send },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === id ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">

            {/* LinkedIn Card */}
            <div className={`glass-panel rounded-2xl p-5 border border-darkborder flex flex-col justify-between ${activeTab === 'linkedin' ? 'block' : 'hidden lg:flex'}`}>
              <div>
                <div className="flex items-center justify-between border-b border-darkborder/60 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0A66C2]/15 text-[#0A66C2] p-2 rounded-xl border border-[#0A66C2]/10">
                      <LinkedinIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">LinkedIn Preview</h4>
                      <p className="text-[10px] text-slate-500">Professional, industry-focused formatting</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {linkedinSettings?.connected ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" /> Connected
                      </span>
                    ) : (
                      <button onClick={onOpenLinkedInSettings}
                        className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full hover:bg-yellow-500/20 transition-colors">
                        ⚠ Not connected
                      </button>
                    )}
                    <button onClick={() => handleCopy(linkedinText, setCopiedLinkedin)}
                      className="p-2 rounded-lg bg-slate-900 border border-darkborder text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      {copiedLinkedin ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <textarea value={linkedinText} onChange={(e) => setLinkedinText(e.target.value)}
                  className="w-full bg-slate-950/40 border border-darkborder focus:border-brand-500 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-y min-h-[160px] font-sans leading-relaxed"
                  placeholder="LinkedIn post content..." />
              </div>
              <div className="flex items-center justify-between border-t border-darkborder/60 pt-3.5 mt-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Status: {linkedinApproved ? <span className="text-emerald-400 font-medium">Approved</span> : <span className="text-slate-500 font-medium">Draft</span>}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={handleApproveLinkedin}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
                      linkedinApproved
                        ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20'
                        : 'bg-brand-600 border-brand-500 text-white hover:bg-brand-500 shadow-md shadow-brand-500/10'
                    }`}>
                    <FileCheck2 className="h-3.5 w-3.5" />
                    {linkedinApproved ? 'Approved' : 'Approve LinkedIn'}
                  </button>
                  <button onClick={handlePublishLinkedIn} disabled={linkedinPublishing}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border bg-[#0A66C2]/15 border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2]/25 disabled:opacity-50 disabled:cursor-not-allowed">
                    {linkedinPublishing
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
                      : <><LinkedinIcon className="h-3.5 w-3.5" /> Publish</>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Telegram Card */}
            <div className={`glass-panel rounded-2xl p-5 border border-darkborder flex flex-col justify-between ${activeTab === 'telegram' ? 'block' : 'hidden lg:flex'}`}>
              <div>
                <div className="flex items-center justify-between border-b border-darkborder/60 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#229ED9]/15 text-[#229ED9] p-2 rounded-xl border border-[#229ED9]/10">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Telegram Preview</h4>
                      <p className="text-[10px] text-slate-500">Concise formatting, supports bold Markdown</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {telegramSettings?.botToken && telegramSettings?.channelId ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" /> Connected
                      </span>
                    ) : (
                      <button onClick={onOpenTelegramSettings}
                        className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full hover:bg-yellow-500/20 transition-colors">
                        ⚠ Setup required
                      </button>
                    )}
                    <button onClick={() => handleCopy(telegramText, setCopiedTelegram)}
                      className="p-2 rounded-lg bg-slate-900 border border-darkborder text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      {copiedTelegram ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <textarea value={telegramText} onChange={(e) => setTelegramText(e.target.value)}
                  className="w-full bg-slate-950/40 border border-darkborder focus:border-brand-500 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-y min-h-[160px] font-mono leading-relaxed"
                  placeholder="Telegram post content..." />
              </div>
              <div className="flex items-center justify-between border-t border-darkborder/60 pt-3.5 mt-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Status: {telegramApproved ? <span className="text-emerald-400 font-medium">Approved</span> : <span className="text-slate-500 font-medium">Draft</span>}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={handleApproveTelegram}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
                      telegramApproved
                        ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20'
                        : 'bg-brand-600 border-brand-500 text-white hover:bg-brand-500 shadow-md shadow-brand-500/10'
                    }`}>
                    <FileCheck2 className="h-3.5 w-3.5" />
                    {telegramApproved ? 'Approved' : 'Approve Telegram'}
                  </button>
                  <button onClick={handlePublishTelegram} disabled={telegramPublishing}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border bg-[#229ED9]/15 border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/25 disabled:opacity-50 disabled:cursor-not-allowed">
                    {telegramPublishing
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
                      : <><Send className="h-3.5 w-3.5" /> Publish</>
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT: Image Selector + Hashtags ── */}
        <div className="space-y-6">

          {/* Image Source Card */}
          <div className="glass-panel rounded-2xl p-5 border border-darkborder space-y-4">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-brand-400" />
              Image Source
            </h4>

            {/* Source selector tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-darkborder">
              {IMAGE_SOURCES.map(({ id, label, icon: Icon }) => {
                const isArticleDisabled = id === 'article' && !data.articleImage;
                return (
                  <button
                    key={id}
                    onClick={() => !isArticleDisabled && setSelectedImageSource(id)}
                    disabled={isArticleDisabled}
                    title={isArticleDisabled ? 'No article image extracted' : label}
                    className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg transition-all flex flex-col items-center gap-1 ${
                      selectedImageSource === id
                        ? 'bg-brand-600 text-white shadow-md'
                        : isArticleDisabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Image preview — hidden when source is none or no URL available */}
            {selectedImageSource !== 'none' && (
              <div className="relative rounded-xl border border-darkborder overflow-hidden bg-slate-950/80 group"
                style={{ minHeight: '160px', maxHeight: '300px' }}>
                {activeImageUrl ? (
                  <>
                    <div className="flex items-center justify-center w-full bg-slate-950/80"
                      style={{ minHeight: '160px', maxHeight: '300px' }}>
                      <img
                        key={activeImageUrl}
                        src={activeImageUrl}
                        alt="Selected image"
                        className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                        style={{
                          maxHeight: '300px',
                          width: '100%',
                          objectFit: selectedImageSource === 'upload' ? 'contain' : 'cover',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none rounded-xl" />
                    <div className="absolute top-2 left-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        selectedImageSource === 'ai'
                          ? 'bg-brand-500/20 border-brand-500/30 text-brand-300'
                          : selectedImageSource === 'article'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                      }`}>
                        {selectedImageSource === 'ai' ? '✦ AI' : selectedImageSource === 'article' ? 'Article' : 'Custom'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600"
                    style={{ minHeight: '160px' }}>
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-xs">
                      {selectedImageSource === 'upload' ? 'No file uploaded yet' : 'No image available'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* None placeholder */}
            {selectedImageSource === 'none' && (
              <div className="rounded-xl border border-dashed border-darkborder bg-slate-950/30 flex flex-col items-center justify-center text-slate-600 py-10">
                <span className="text-2xl mb-2 opacity-40">∅</span>
                <span className="text-xs text-slate-500">No image will be attached</span>
              </div>
            )}

            {/* Source-specific controls */}
            {selectedImageSource === 'ai' && (
              <button onClick={handleRegenerateAi}
                className="w-full py-2 text-xs font-semibold rounded-lg border border-brand-500/30 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors flex items-center justify-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate AI Image
              </button>
            )}

            {selectedImageSource === 'upload' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 text-xs font-semibold rounded-lg border border-darkborder text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5" />
                  {uploadedImageFile ? 'Replace Image' : 'Choose Image'}
                </button>
              </>
            )}

            {selectedImageSource === 'article' && !data.articleImage && (
              <p className="text-[10px] text-slate-500 text-center">
                No image was extracted from this article.
              </p>
            )}
          </div>

          {/* Hashtags */}
          <div className="glass-panel rounded-2xl p-5 border border-darkborder space-y-4">
            <div className="flex items-center justify-between border-b border-darkborder/60 pb-3">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="text-brand-400">#</span>
                Keyword Tags
              </h4>
              <button onClick={() => handleCopy(hashtags.join(' '), setCopiedHashtags)}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                {copiedHashtags ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
              </button>
            </div>

            <form onSubmit={handleAddHashtag} className="flex gap-2">
              <input type="text" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Add tag (e.g. AI)"
                className="flex-1 bg-slate-950 border border-darkborder focus:border-brand-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors" />
              <button type="submit"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-darkborder transition-colors flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 min-h-[40px] max-h-[160px] overflow-y-auto pr-1">
              {hashtags.length === 0 ? (
                <span className="text-[11px] text-slate-600">No tags configured</span>
              ) : (
                hashtags.map((tag, idx) => (
                  <span key={idx}
                    className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px] font-semibold py-0.5 pl-2 pr-1 rounded-full animate-fade-in">
                    {tag}
                    <button type="button" onClick={() => handleRemoveHashtag(tag)}
                      className="text-brand-400 hover:text-red-400 hover:bg-brand-500/20 p-0.5 rounded-full transition-colors">
                      <Trash className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultCards;
