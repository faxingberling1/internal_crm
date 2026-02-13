"use client";

import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Save,
    Trash2,
    Lock,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { useUser } from "@/components/user-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Workplace Security State
    const [securitySettings, setSecuritySettings] = useState({
        officeIP: "",
        officeHoursStart: "09:00",
        officeHoursEnd: "18:00",
        isSecurityEnabled: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings/branding");
                if (res.ok) {
                    const data = await res.json();
                    setSecuritySettings({
                        officeIP: data.officeIP || "",
                        officeHoursStart: data.officeHoursStart || "09:00",
                        officeHoursEnd: data.officeHoursEnd || "18:00",
                        isSecurityEnabled: data.isSecurityEnabled || false
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSecurity = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/settings/branding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(securitySettings),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save security settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!user || loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
    );

    const tabs = [
        { id: "profile", name: "Profile", icon: User },
        { id: "notifications", name: "Notifications", icon: Bell },
        { id: "security", name: "Security", icon: Shield },
        { id: "appearance", name: "Appearance", icon: Palette },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-zinc-900 flex items-center space-x-3">
                    <SettingsIcon className="h-10 w-10 text-purple-600" />
                    <span>Control Center</span>
                </h2>
                <p className="text-zinc-500 mt-2 font-medium">Manage your personal settings and organizational preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs Sidebar */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest",
                                activeTab === tab.id
                                    ? "bg-purple-600 text-white shadow-xl shadow-purple-500/20"
                                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            )}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === "profile" && (
                        <div className="premium-card bg-white border border-zinc-100 p-8 space-y-8">
                            <div className="flex items-center space-x-6 pb-8 border-b border-zinc-50">
                                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-2xl">
                                    <span className="text-3xl font-black text-white">{user.name?.[0].toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{user.name}</h3>
                                    <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">{user.role}</p>
                                    <button className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-purple-600 transition-colors">Change Avatar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user.name}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue={user.email}
                                        disabled
                                        className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-4 px-6 opacity-50 cursor-not-allowed text-zinc-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <button className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all">Discard</button>
                                <button className="flex items-center space-x-2 px-8 py-3 bg-zinc-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-500/10">
                                    <Save className="h-4 w-4" />
                                    <span>Sync Profile</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="premium-card bg-white border border-zinc-100 p-8 space-y-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <Lock className="h-6 w-6 text-purple-600" />
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Security Hardening</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 tracking-tight">Two-Factor Authentication</p>
                                        <p className="text-xs text-zinc-500 font-medium">Add an extra layer of security to your account.</p>
                                    </div>
                                    <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-purple-200">Enable</button>
                                </div>

                                {/* Workplace Security Section */}
                                {user.role === 'ADMIN' && (
                                    <div className="border-t border-zinc-100 pt-8 mt-8 space-y-6">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Shield className="h-5 w-5 text-red-600" />
                                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Workplace Security (Office-Only)</h4>
                                        </div>

                                        {/* Status Indicator */}
                                        {securitySettings.isSecurityEnabled ? (
                                            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white space-y-3 shadow-xl shadow-red-500/20 border-2 border-red-400">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                            <Shield className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black uppercase tracking-widest">🔒 Lockdown Active</p>
                                                            <p className="text-[10px] font-bold opacity-90">Office-Only Mode Enforced</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-3 w-3 rounded-full bg-white animate-pulse"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Authorized Range</p>
                                                        <p className="text-xs font-bold mt-1">192.168.18.1-100</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Office Hours</p>
                                                        <p className="text-xs font-bold mt-1">{securitySettings.officeHoursStart} - {securitySettings.officeHoursEnd}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-xl bg-zinc-200 flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-zinc-600">Lockdown Disabled</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Configure and enable below</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                            Restrict dashboard access to specific IP addresses and office hours. This affects all non-admin employees.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Office IP Range</label>
                                                <input
                                                    type="text"
                                                    value={securitySettings.officeIP}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, officeIP: e.target.value })}
                                                    placeholder="192.168.18.1-100 (auto-configured)"
                                                    disabled
                                                    className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl py-4 px-6 text-zinc-500 font-bold cursor-not-allowed"
                                                />
                                                <p className="text-[9px] text-zinc-400 font-bold ml-1">✓ Accepts any IP from 192.168.18.1 to 192.168.18.100</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Shift Protection</label>
                                                <div className="flex items-center space-x-4">
                                                    <input
                                                        type="time"
                                                        value={securitySettings.officeHoursStart}
                                                        onChange={(e) => setSecuritySettings({ ...securitySettings, officeHoursStart: e.target.value })}
                                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-zinc-900 font-bold"
                                                    />
                                                    <span className="font-black text-zinc-300">to</span>
                                                    <input
                                                        type="time"
                                                        value={securitySettings.officeHoursEnd}
                                                        onChange={(e) => setSecuritySettings({ ...securitySettings, officeHoursEnd: e.target.value })}
                                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-zinc-900 font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                    <Lock className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-red-900 tracking-tight">Enable Lockdown Mode</p>
                                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">Active enforcement of IP/Time rules</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={securitySettings.isSecurityEnabled}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, isSecurityEnabled: e.target.checked })}
                                                />
                                                <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleSaveSecurity}
                                                disabled={saving}
                                                className={cn(
                                                    "flex items-center space-x-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                                                    saved
                                                        ? "bg-green-600 text-white shadow-green-500/20"
                                                        : "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20"
                                                )}
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />)}
                                                <span>{saving ? "Deploying..." : (saved ? "Security Deployed" : "Save Security Policy")}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 tracking-tight">Active Sessions</p>
                                        <p className="text-xs text-zinc-500 font-medium">View and manage where you're currently logged in.</p>
                                    </div>
                                    <button className="px-4 py-2 bg-zinc-200 text-zinc-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-zinc-300">Review</button>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-red-50">
                                <button className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-100">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Terminate Account Data</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {(activeTab === "notifications" || activeTab === "appearance") && (
                        <div className="premium-card bg-white border border-zinc-100 p-20 text-center">
                            <Palette className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2 uppercase tracking-[0.2em] opacity-40">Section Under Construction</h3>
                            <p className="text-zinc-500 font-medium">These preferences will be part of the v1.2 organizational rollout.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
