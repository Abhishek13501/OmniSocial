import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { saveUserSettings, loadUserSettings } from '../services/userSettings';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const LINKEDIN_TOKEN_URL = import.meta.env.VITE_N8N_LINKEDIN_TOKEN_URL;
const REDIRECT_URI       = import.meta.env.VITE_LINKEDIN_REDIRECT_URI;

const LinkedInCallback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code  = params.get('code');
      const error = params.get('error');

      if (error || !code) {
        setErrorMsg(error || 'No authorization code received.');
        setStatus('error');
        return;
      }

      if (!user) {
        // Wait for auth to hydrate — retry via re-render
        return;
      }

      try {
        console.log('[OmniSocial] LinkedIn callback: exchanging code for token');

        const response = await axios.post(LINKEDIN_TOKEN_URL, {
          code,
          redirectUri: REDIRECT_URI,
        });

        // n8n can return a plain object or a single-item array — normalise
        console.log('[OmniSocial] LinkedIn token raw response:', JSON.stringify(response.data, null, 2));
        const raw = Array.isArray(response.data) ? response.data[0] : response.data;

        const accessToken = (
          raw.accessToken ||
          raw.access_token ||
          ''
        ).replace(/^=/, '');
        const personId    = raw.personId    || raw.sub          || null;

        if (!accessToken || !personId) {
          throw new Error(`Invalid token response — got: ${JSON.stringify(raw)}`);
        }

        console.log('[OmniSocial] LinkedIn token received for personId:', personId);

        // Merge into existing user settings
        const existing = await loadUserSettings(user.uid) || {};
        await saveUserSettings(user.uid, {
          ...existing,
          linkedin: {
            accessToken,
            personId: personId.replace(/^=/, ''),
            connected: true,
          },
        });

        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1800);
      } catch (err) {
        console.error('[OmniSocial] LinkedIn token exchange failed:', err);
        setErrorMsg(err.response?.data?.message || err.message || 'Token exchange failed.');
        setStatus('error');
      }
    };

    run();
  }, [user]); // re-run once user is available

  return (
    <div className="min-h-screen bg-darkbg flex flex-col items-center justify-center gap-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
        <Sparkles className="h-6 w-6" />
      </div>

      {status === 'loading' && (
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Connecting LinkedIn account...</p>
          <p className="text-xs text-slate-500">Exchanging authorization code</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center space-y-2">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-white">LinkedIn Connected</p>
          <p className="text-xs text-slate-400">Redirecting to dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-white">Connection Failed</p>
          <p className="text-xs text-slate-400">{errorMsg}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary py-2 px-4 text-xs mt-2"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkedInCallback;
