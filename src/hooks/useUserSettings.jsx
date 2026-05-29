import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { loadUserSettings, saveUserSettings } from '../services/userSettings';

const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    botToken: '',
    channelId: '',
    linkedin: { accessToken: '', personId: '', connected: false },
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    setSettingsLoading(true);
    try {
      const data = await loadUserSettings(user.uid);
      console.log('[OmniSocial] Loaded user settings from Firestore:', {
        hasTelegram: !!(data?.botToken),
        linkedin: data?.linkedin
          ? { connected: data.linkedin.connected, personId: data.linkedin.personId, hasToken: !!data.linkedin.accessToken }
          : 'not set',
      });
      if (data) {
        setSettings({
          botToken:  data.botToken  || '',
          channelId: data.channelId || '',
          linkedin:  data.linkedin  || { accessToken: '', personId: '', connected: false },
        });
      }
    } catch (err) {
      console.error('[OmniSocial] Failed to load user settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, [user]);

  // Load on mount / user change
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (newSettings) => {
    if (!user) return;
    setSettingsSaving(true);
    try {
      await saveUserSettings(user.uid, newSettings);
      setSettings(newSettings);
      console.log('[OmniSocial] User settings saved:', {
        channelId: newSettings.channelId,
        linkedin: newSettings.linkedin
          ? { connected: newSettings.linkedin.connected, personId: newSettings.linkedin.personId, hasToken: !!newSettings.linkedin.accessToken }
          : 'not set',
      });
    } finally {
      setSettingsSaving(false);
    }
  }, [user]);

  return { settings, settingsLoading, settingsSaving, saveSettings, reloadSettings: loadSettings };
};

export default useUserSettings;
