import React, { useState, useEffect } from 'react';
import { Save, Settings, Globe, Mail, Phone, Share2, Megaphone, ShieldAlert, Sparkles } from 'lucide-react';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      setSettings(res.settings || {});
    } catch (err) {
      toast.error('Failed to load website settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      toast.success('Website settings saved successfully');
      setSettings(res.settings);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading website configuration..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Website Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure brand assets, homepage banner copy, contact info, and AI features.</p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand & Contact Info */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Store Identity & Contact</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Website Name
            </label>
            <input
              type="text"
              value={settings?.websiteName || ''}
              onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings?.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings?.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Announcement Bar Message
            </label>
            <textarea
              rows={2}
              value={settings?.announcementText || ''}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Feature Switches & Maintenance */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Feature Controls & System Mode</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">Enable AI Virtual Try-On Studio</p>
                <p className="text-xs text-zinc-400">Allow customers to access the virtual fitting room and try clothes.</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.allowVirtualTryOn ?? true}
                onChange={(e) => setSettings({ ...settings, allowVirtualTryOn: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                <p className="text-xs text-zinc-400">Temporarily display a maintenance notice to public visitors.</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.maintenanceMode ?? false}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Social Media URLs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Instagram URL"
                value={settings?.socialLinks?.instagram || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Twitter / X URL"
                value={settings?.socialLinks?.twitter || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
