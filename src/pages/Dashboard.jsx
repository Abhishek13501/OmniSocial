import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, isMock } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { generateSocialContent } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GenerateForm from '../components/GenerateForm';
import ResultCards from '../components/ResultCards';
import LoadingSpinner from '../components/LoadingSpinner';
import TelegramSettingsModal from '../components/TelegramSettingsModal';
import LinkedInSettingsModal from '../components/LinkedInSettingsModal';
import useUserSettings from '../hooks/useUserSettings';
import { Sparkles, AlertCircle, RefreshCw, FileText, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [linkedinSettingsOpen, setLinkedinSettingsOpen] = useState(false);

  // User Telegram settings
  const { settings: userSettings, settingsSaving, saveSettings, reloadSettings } = useUserSettings();

  // Re-fetch settings when window regains focus — covers the LinkedIn OAuth redirect case
  // where Firestore was updated in the callback page but this component was already mounted.
  useEffect(() => {
    const handleFocus = () => {
      console.log('[OmniSocial] Window focused — reloading user settings');
      reloadSettings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reloadSettings]);

  const handleLinkedInDisconnect = async () => {
    await saveSettings({ ...userSettings, linkedin: { accessToken: '', personId: '', connected: false } });
    setLinkedinSettingsOpen(false);
  };

  // Content states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [activeDraft, setActiveDraft] = useState(null); // Current workspace item { id, url, linkedin, telegram, hashtags, image, linkedinApproved, telegramApproved }
  
  // History archives state
  const [historyList, setHistoryList] = useState([]);

  // Load history from database on login/mount
  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  // Firestore & LocalStorage fetch routines
  const loadHistory = async () => {
    try {
      if (isMock) {
        // Read local storage drafts
        const localDrafts = JSON.parse(localStorage.getItem(`social_media_drafts_${user.uid}`) || '[]');
        // Sort descending by timestamp
        localDrafts.sort((a, b) => b.createdAt - a.createdAt);
        setHistoryList(localDrafts);
      } else {
        // Read real Firestore collection
        const q = query(
          collection(db, 'drafts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const firebaseDrafts = [];
        querySnapshot.forEach((docSnap) => {
          firebaseDrafts.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        setHistoryList(firebaseDrafts);
      }
    } catch (err) {
      console.error('Failed to load draft history:', err);
    }
  };

  // Submit URL content request
  const handleGenerateContent = async (input) => {
    setIsLoading(true);
    setApiError('');
    
    // Clear active selection while generating
    setActiveDraft(null);

    const targetUrl = input.url || '';
    const fileData = input.file; // UI-only draft details

    try {
      let result;

      if (fileData) {
        // If file uploaded (UI only for now), simulate a short delay and generate generic template
        await new Promise(resolve => setTimeout(resolve, 2500));
        result = {
          linkedin: `📄 Key takeaways extracted from our uploaded document: "${fileData.name}"!\n\nThis briefing analyzes critical factors and strategic initiatives planned for the upcoming quarter.\n\nWe have outlined action items and milestone goals to align engineering and marketing outputs.\n\nRead more details in the attached brief! 🚀`,
          telegram: `📁 *Document briefing processed: ${fileData.name}*\n\nHighlights from the briefing:\n• Extracted core themes automatically\n• Set timeline schedules for upcoming sprints\n• Finalized cross-team parameters.`,
          hashtags: ['#DocumentProcessing', '#BriefingReport', '#StrategicGrowth', '#WorkflowAutomation'],
          articleImage: null,
          aiImage: `https://image.pollinations.ai/prompt/${encodeURIComponent(`Document briefing ${fileData.name} #DocumentProcessing #WorkflowAutomation`)}`,
        };
      } else {
        // Call the Axios API service
        result = await generateSocialContent(targetUrl);
      }

      // Build draft database model
      const newDraftModel = {
        userId: user.uid,
        url: targetUrl,
        fileName: fileData ? fileData.name : null,
        linkedin: result.linkedin,
        telegram: result.telegram,
        hashtags: result.hashtags,
        articleImage: result.articleImage ?? null,
        aiImage: result.aiImage ?? null,
        linkedinApproved: false,
        telegramApproved: false,
        createdAt: Date.now(),
        dateLabel: new Date().toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      let savedDraftId;

      if (isMock) {
        // Save to LocalStorage
        const localDrafts = JSON.parse(localStorage.getItem(`social_media_drafts_${user.uid}`) || '[]');
        const localId = 'draft_' + Date.now();
        const modelWithId = { id: localId, ...newDraftModel };
        localDrafts.unshift(modelWithId);
        localStorage.setItem(`social_media_drafts_${user.uid}`, JSON.stringify(localDrafts));
        savedDraftId = localId;
        setActiveDraft(modelWithId);
      } else {
        // Save to real Firestore DB
        const docRef = await addDoc(collection(db, 'drafts'), newDraftModel);
        savedDraftId = docRef.id;
        setActiveDraft({ id: docRef.id, ...newDraftModel });
      }

      // Refresh list
      loadHistory();
      
    } catch (err) {
      setApiError(err.message || 'Generation pipeline failed. Please check endpoint configurations.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select historical record
  const handleSelectHistoryItem = (item) => {
    setActiveDraft(item);
    setApiError('');
  };

  // Delete historical record
  const handleDeleteHistoryItem = async (id) => {
    try {
      if (isMock) {
        const localDrafts = JSON.parse(localStorage.getItem(`social_media_drafts_${user.uid}`) || '[]');
        const filtered = localDrafts.filter(d => d.id !== id);
        localStorage.setItem(`social_media_drafts_${user.uid}`, JSON.stringify(filtered));
      } else {
        await deleteDoc(doc(db, 'drafts', id));
      }

      // If active draft is deleted, clear workspace selection
      if (activeDraft && activeDraft.id === id) {
        setActiveDraft(null);
      }

      loadHistory();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Save changes made in editor back to database
  const handleSaveEditorChanges = async (updatedData) => {
    if (!activeDraft) return;

    const draftId = activeDraft.id;
    try {
      if (isMock) {
        const localDrafts = JSON.parse(localStorage.getItem(`social_media_drafts_${user.uid}`) || '[]');
        const updated = localDrafts.map(d => {
          if (d.id === draftId) {
            return {
              ...d,
              linkedin: updatedData.linkedin,
              telegram: updatedData.telegram,
              hashtags: updatedData.hashtags,
              linkedinApproved: updatedData.linkedinApproved,
              telegramApproved: updatedData.telegramApproved
            };
          }
          return d;
        });
        localStorage.setItem(`social_media_drafts_${user.uid}`, JSON.stringify(updated));
      } else {
        const draftDocRef = doc(db, 'drafts', draftId);
        await updateDoc(draftDocRef, {
          linkedin: updatedData.linkedin,
          telegram: updatedData.telegram,
          hashtags: updatedData.hashtags,
          linkedinApproved: updatedData.linkedinApproved,
          telegramApproved: updatedData.telegramApproved
        });
      }

      // Update local state workspace
      setActiveDraft(prev => ({
        ...prev,
        ...updatedData
      }));

      // Reload sidebar listing to show any state modifications (approved vs draft status)
      loadHistory();
    } catch (err) {
      console.error('Failed to update draft text: ', err);
    }
  };

  const generatingMessages = [
    'Sending article details to n8n workflow API...',
    'Distilling structured article text context...',
    'Invoking Groq AI LLM endpoints...',
    'Drafting tailored copy for LinkedIn feeds...',
    'Formulating Telegram markdown paragraphs...',
    'Acquiring media graphic previews...'
  ];

  return (
    <div className="min-h-screen bg-darkbg flex flex-col">
      <Navbar />

      <div className="flex-1 flex relative">
        {/* Collapsible history and navigation panel */}
        <Sidebar 
          history={historyList}
          selectedId={activeDraft?.id}
          onSelectHistory={handleSelectHistoryItem}
          onDeleteHistory={handleDeleteHistoryItem}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main Workstation workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto space-y-8 w-full">
          
          {/* Welcome Dashboard Banner header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-darkborder/50 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                Social Automation Board
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Drafting workspace. Ingest links, refine AI copies, and authorize announcements.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isMock && (
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
                  Database Mode: Sandbox Local Storage Mock
                </span>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                title="Telegram Settings"
              >
                <Settings className="h-3.5 w-3.5" />
                Telegram Settings
              </button>
              <button
                onClick={() => setLinkedinSettingsOpen(true)}
                className={`py-2 px-3 text-xs flex items-center gap-1.5 rounded-lg border font-semibold transition-all ${
                  userSettings?.linkedin?.connected
                    ? 'bg-[#0A66C2]/10 border-[#0A66C2]/30 text-[#0A66C2] hover:bg-[#0A66C2]/20'
                    : 'btn-secondary'
                }`}
                title="LinkedIn Settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                {userSettings?.linkedin?.connected ? 'LinkedIn Connected' : 'Connect LinkedIn'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* Input Ingestion Form Panel */}
            <div className="max-w-3xl mx-auto w-full">
              <GenerateForm 
                onSubmit={handleGenerateContent} 
                isLoading={isLoading} 
              />
            </div>

            {/* Error notifications */}
            {apiError && (
              <div className="max-w-3xl mx-auto w-full text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-lg">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-xs">Generation Failed</h4>
                  <p className="text-xs text-slate-400 mt-1">{apiError}</p>
                  <button
                    onClick={() => handleGenerateContent({ url: activeDraft?.url })}
                    className="mt-3 text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry pipeline request
                  </button>
                </div>
              </div>
            )}

            {/* Progress Loaders */}
            {isLoading && (
              <div className="max-w-3xl mx-auto w-full py-16 glass-panel rounded-2xl border border-darkborder">
                <LoadingSpinner statusMessages={generatingMessages} size="lg" />
              </div>
            )}

            {/* Content Preview Canvas Editor */}
            {activeDraft && !isLoading && (
              <div className="w-full">
                <ResultCards 
                  data={activeDraft} 
                  onSaveHistory={handleSaveEditorChanges}
                  telegramSettings={userSettings}
                  onOpenTelegramSettings={() => setSettingsOpen(true)}
                  linkedinSettings={userSettings?.linkedin}
                  onOpenLinkedInSettings={() => setLinkedinSettingsOpen(true)}
                />
              </div>
            )}

            {/* Empty workspace helper preview */}
            {!activeDraft && !isLoading && !apiError && (
              <div className="max-w-2xl mx-auto w-full text-center py-16 border border-darkborder/50 border-dashed rounded-2xl bg-slate-900/10">
                <FileText className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Empty Workspace</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Generate media copies above or click on an existing draft in your Sidebar Archive to begin reviewing content.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Telegram Settings Modal */}
      <TelegramSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentSettings={userSettings}
        onSave={saveSettings}
        isSaving={settingsSaving}
      />

      {/* LinkedIn Settings Modal */}
      <LinkedInSettingsModal
        isOpen={linkedinSettingsOpen}
        onClose={() => setLinkedinSettingsOpen(false)}
        linkedinSettings={userSettings?.linkedin}
        onDisconnect={handleLinkedInDisconnect}
      />
    </div>
  );
};

export default Dashboard;
