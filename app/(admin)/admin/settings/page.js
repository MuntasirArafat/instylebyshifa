"use client";
import React, { useEffect, useState } from 'react';
import { Settings, MessageSquare, Mail, Lock, Save, ShieldCheck, Key, Code } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sms, setSms] = useState({ 
    apiKey: "", 
    senderId: "", 
    adminNumber: "",
    isEnabled: true
  });

  const [email, setEmail] = useState({
    host: "",
    port: "",
    user: "",
    pass: "",
    isEnabled: false
  });

  const [security, setSecurity] = useState({
    adminEmail: "",
    adminPassword: ""
  });

  const [customScripts, setCustomScripts] = useState({
    header: "",
    footer: ""
  });

  const tabs = [
    { id: 'sms', name: 'SMS Gateway', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'email', name: 'Email SMTP', icon: <Mail className="w-4 h-4" /> },
    { id: 'account', name: 'Admin Account', icon: <Lock className="w-4 h-4" /> },
    { id: 'scripts', name: 'Tracking Scripts', icon: <Code className="w-4 h-4" /> },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data?.sms) setSms(prev => ({ ...prev, ...data.sms }));
        if (data?.email) setEmail(prev => ({ ...prev, ...data.email }));
        if (data?.security) setSecurity(prev => ({ ...prev, ...data.security, adminPassword: "" }));
        if (data?.customScripts) setCustomScripts(prev => ({ ...prev, ...data.customScripts }));
      } catch (_e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sms, email, security, customScripts }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save settings");
      }
      setSuccess("Settings saved successfully!");
      // Reset password field in state after save
      setSecurity(prev => ({ ...prev, adminPassword: "" }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (e2) {
      setError(e2?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading settings...</div>;

  return (
    <div className=" mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-4 border-b-2 font-bold text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {/* SMS TAB */}
        {activeTab === 'sms' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">BulkSMSBD Notifications</h3>
                  <p className="text-xs text-gray-500">Send SMS to admin when a new order arrives.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sms.isEnabled}
                  onChange={(e) => setSms(s => ({ ...s, isEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  API Key
                </label>
                <input
                  type="text"
                  value={sms.apiKey || ""}
                  onChange={(e) => setSms((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="e.g. 2EiyDOakOKgga7Ndh6iu"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  Sender ID
                </label>
                <input
                  type="text"
                  value={sms.senderId || ""}
                  onChange={(e) => setSms((s) => ({ ...s, senderId: e.target.value }))}
                  placeholder="e.g. 8809617617717"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  Admin Phone Number (Receiver)
                </label>
                <input
                  type="text"
                  value={sms.adminNumber || ""}
                  onChange={(e) => setSms((s) => ({ ...s, adminNumber: e.target.value }))}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                />
                <p className="text-[10px] text-gray-400 italic mt-1">* This number will receive the notifications every time a customer places an order.</p>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL TAB */}
        {activeTab === 'email' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Email SMTP Alerts</h3>
                  <p className="text-xs text-gray-500">Send transactional emails for new orders.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={email.isEnabled}
                  onChange={(e) => setEmail(s => ({ ...s, isEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Host</label>
                <input
                  type="text"
                  value={email.host || ""}
                  onChange={(e) => setEmail(x => ({ ...x, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Port</label>
                <input
                  type="text"
                  value={email.port || ""}
                  onChange={(e) => setEmail(x => ({ ...x, port: e.target.value }))}
                  placeholder="587"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP User (Email)</label>
                <input
                  type="email"
                  value={email.user || ""}
                  onChange={(e) => setEmail(x => ({ ...x, user: e.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SMTP Password</label>
                <input
                  type="password"
                  value={email.pass || ""}
                  onChange={(e) => setEmail(x => ({ ...x, pass: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
          </div>
        )}
        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <Lock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Admin Credentials</h3>
                  <p className="text-xs text-gray-500">Update your login email and password.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                <input
                  type="email"
                  value={security.adminEmail || ""}
                  onChange={(e) => setSecurity(x => ({ ...x, adminEmail: e.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={security.adminPassword || ""}
                  onChange={(e) => setSecurity(x => ({ ...x, adminPassword: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
                />
                <p className="text-[10px] text-gray-400 italic mt-1">* For security, your current password is not shown. Enter a new one only if you want to change it.</p>
              </div>
            </div>
          </div>
        )}
        {/* SCRIPTS TAB */}
        {activeTab === 'scripts' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Tracking & Analytics</h3>
                  <p className="text-xs text-gray-500">Add custom HTML/JS to your header or footer.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  Header Scripts (Inside &lt;head&gt;)
                </label>
                <textarea
                  value={customScripts.header || ""}
                  onChange={(e) => setCustomScripts(x => ({ ...x, header: e.target.value }))}
                  placeholder="Paste your Facebook Pixel, Google Tag Manager, or Google Ads scripts here..."
                  className="w-full h-48 border border-gray-200 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono text-xs leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 italic mt-1">* These scripts will be added to the very top of every page.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  Footer Scripts (Before &lt;/body&gt;)
                </label>
                <textarea
                  value={customScripts.footer || ""}
                  onChange={(e) => setCustomScripts(x => ({ ...x, footer: e.target.value }))}
                  placeholder="Paste chat widgets or other footer scripts here..."
                  className="w-full h-48 border border-gray-200 bg-gray-50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono text-xs leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 italic mt-1">* These scripts will be added just before the closing body tag.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
