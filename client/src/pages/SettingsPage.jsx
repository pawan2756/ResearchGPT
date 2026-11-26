import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Tag } from '../components/ui/Tag.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { apiGetSettings, apiUpdateSettings } from '../api/settings.js';
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Shield,
  Palette,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Server,
  KeyRound,
} from 'lucide-react';

export function SettingsPage() {
  const { theme: currentTheme, setTheme: setAppTheme } = useTheme();

  const [depth, setDepth] = useState('quick');
  const [allowlist, setAllowlist] = useState([]);
  const [blocklist, setBlocklist] = useState([]);
  const [themePreference, setThemePreference] = useState('system');

  const [newAllowDomain, setNewAllowDomain] = useState('');
  const [newBlockDomain, setNewBlockDomain] = useState('');

  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await apiGetSettings();
        if (res?.settings) {
          setDepth(res.settings.depth || 'quick');
          setAllowlist(res.settings.allowlist || []);
          setBlocklist(res.settings.blocklist || []);
          setThemePreference(res.settings.theme || 'system');
        }
        if (res?.system) {
          setSystemInfo(res.system);
        }
      } catch {
        showToast('Failed to load settings. Using default preferences.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleAddDomain = (type) => {
    if (type === 'allow') {
      const trimmed = newAllowDomain.trim().toLowerCase();
      if (!trimmed) return;
      if (!allowlist.includes(trimmed)) {
        setAllowlist([...allowlist, trimmed]);
      }
      setNewAllowDomain('');
    } else {
      const trimmed = newBlockDomain.trim().toLowerCase();
      if (!trimmed) return;
      if (!blocklist.includes(trimmed)) {
        setBlocklist([...blocklist, trimmed]);
      }
      setNewBlockDomain('');
    }
  };

  const handleRemoveDomain = (type, domain) => {
    if (type === 'allow') {
      setAllowlist(allowlist.filter((d) => d !== domain));
    } else {
      setBlocklist(blocklist.filter((d) => d !== domain));
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await apiUpdateSettings({
        depth,
        allowlist,
        blocklist,
        theme: themePreference,
      });

      // Synchronize theme context
      if (themePreference !== currentTheme) {
        setAppTheme(themePreference);
      }

      showToast('Settings saved successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col max-w-[860px] w-full mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[var(--border)]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Configuration & Settings
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              Configure search depth, domain restrictions, and inspect AI service status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton height="8rem" />
            <Skeleton height="10rem" />
            <Skeleton height="8rem" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* System Status Banner */}
            {systemInfo && (
              <div
                className="rounded-xl p-4 sm:p-5 border"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                    Runtime & AI Health
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                  <div
                    className="p-3 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Gemini Model:</span>
                    <span className="font-mono font-medium" style={{ color: 'var(--text)' }}>
                      {systemInfo.geminiModel}
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Operational Mode:</span>
                    <Tag variant={systemInfo.isMockMode ? 'warning' : 'success'} size="xs">
                      {systemInfo.isMockMode ? 'Mock Mode' : 'Live APIs Active'}
                    </Tag>
                  </div>

                  <div
                    className="p-3 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <KeyRound className="w-3.5 h-3.5" />
                      Gemini API Key:
                    </span>
                    <span className="font-semibold flex items-center gap-1">
                      {systemInfo.hasGeminiKey ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success-text)' }} />
                          <span style={{ color: 'var(--success-text)' }}>Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning-text)' }} />
                          <span style={{ color: 'var(--warning-text)' }}>Missing (Mock)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-lg border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Globe className="w-3.5 h-3.5" />
                      Tavily Search:
                    </span>
                    <span className="font-semibold flex items-center gap-1">
                      {systemInfo.hasTavilyKey && systemInfo.tavilyValidFormat ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success-text)' }} />
                          <span style={{ color: 'var(--success-text)' }}>Connected</span>
                        </>
                      ) : systemInfo.hasTavilyKey && !systemInfo.tavilyValidFormat ? (
                        <>
                          <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning-text)' }} />
                          <span style={{ color: 'var(--warning-text)' }}>Invalid Key Format (Fallback)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning-text)' }} />
                          <span style={{ color: 'var(--warning-text)' }}>Missing (Mock)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {systemInfo.hasTavilyKey && !systemInfo.tavilyValidFormat && (
                  <p className="mt-3 text-[12px] flex items-center gap-1" style={{ color: 'var(--warning-text)' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Notice: Your Tavily API key does not start with &quot;tvly-&quot;. The research pipeline is operating with deterministic source fallback to ensure smooth operation.
                  </p>
                )}
              </div>
            )}

            {/* Search Depth Section */}
            <div
              className="rounded-xl p-4 sm:p-5 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                  Search Depth
                </h3>
              </div>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
                Controls how many web sources are fetched and chunked for verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    depth === 'quick' ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: depth === 'quick' ? 'var(--primary-soft)' : 'var(--surface-2)',
                    borderColor: depth === 'quick' ? 'var(--primary)' : 'var(--border)',
                    ringColor: 'var(--primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                      Quick Mode
                    </span>
                    <input
                      type="radio"
                      name="depth"
                      value="quick"
                      checked={depth === 'quick'}
                      onChange={() => setDepth('quick')}
                      className="accent-[var(--primary)]"
                    />
                  </div>
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    Retrieves top 4 most credible sources. Optimized for speed and low latency.
                  </span>
                </label>

                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    depth === 'deep' ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: depth === 'deep' ? 'var(--primary-soft)' : 'var(--surface-2)',
                    borderColor: depth === 'deep' ? 'var(--primary)' : 'var(--border)',
                    ringColor: 'var(--primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                      Deep Research
                    </span>
                    <input
                      type="radio"
                      name="depth"
                      value="deep"
                      checked={depth === 'deep'}
                      onChange={() => setDepth('deep')}
                      className="accent-[var(--primary)]"
                    />
                  </div>
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    Retrieves up to 8 sources with advanced scraping and multi-pass verification.
                  </span>
                </label>
              </div>
            </div>

            {/* Domain Filters Section */}
            <div
              className="rounded-xl p-4 sm:p-5 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                  Domain Filters
                </h3>
              </div>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
                Restrict search sources or ban untrusted domains from being cited.
              </p>

              {/* Allowlist */}
              <div className="mb-4">
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  Allowed Domains (Only include results from these domains)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. wikipedia.org, github.com"
                    value={newAllowDomain}
                    onChange={(e) => setNewAllowDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDomain('allow');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddDomain('allow')}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {allowlist.length === 0 ? (
                    <span className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>
                      No allowlist restrictions (all domains eligible).
                    </span>
                  ) : (
                    allowlist.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] border"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain('allow', domain)}
                          className="hover:opacity-75"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Blocklist */}
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                  Blocked Domains (Exclude and drop results from these domains)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. unverified-blog.xyz"
                    value={newBlockDomain}
                    onChange={(e) => setNewBlockDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDomain('block');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddDomain('block')}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {blocklist.length === 0 ? (
                    <span className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>
                      No domains blocked.
                    </span>
                  ) : (
                    blocklist.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] border"
                        style={{
                          backgroundColor: 'var(--danger-bg)',
                          borderColor: 'var(--border)',
                          color: 'var(--danger-text)',
                        }}
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain('block', domain)}
                          className="hover:opacity-75"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Theme Preference Section */}
            <div
              className="rounded-xl p-4 sm:p-5 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                  Theme Preference
                </h3>
              </div>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
                Select your preferred interface visual appearance.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {['system', 'light', 'dark'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThemePreference(t)}
                    className={`py-2.5 px-3 rounded-xl border text-[13px] font-medium capitalize transition-all ${
                      themePreference === t ? 'ring-2 font-bold' : ''
                    }`}
                    style={{
                      backgroundColor:
                        themePreference === t ? 'var(--primary-soft)' : 'var(--surface-2)',
                      borderColor: themePreference === t ? 'var(--primary)' : 'var(--border)',
                      color: themePreference === t ? 'var(--primary)' : 'var(--text)',
                      ringColor: 'var(--primary)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="lg" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        )}

        {/* Feedback Toast */}
        {toastMessage && (
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        )}
      </div>
    </AppShell>
  );
}
