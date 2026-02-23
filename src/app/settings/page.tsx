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
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="min-h-[60vh] flex items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center space-y-4">
                <div className="h-16 w-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
                <p className="text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Dashboard...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: "profile", name: "Profile", icon: User },
        { id: "notifications", name: "Notifications", icon: Bell },
        { id: "security", name: "Security", icon: Shield },
        { id: "appearance", name: "Appearance", icon: Palette },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="space-y-3">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2 text-orange-600">
                    <SettingsIcon className="h-4 w-4 animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Personal Preferences Hub</span>
                </motion.div>
                <h2 className="text-6xl font-black tracking-tighter text-white uppercase flex items-center space-x-5">
                    <span>Control <span className="text-orange-600">Center</span></span>
                </h2>
                <p className="text-zinc-600 font-bold text-sm uppercase tracking-[0.2em]">Manage your personal settings and organizational preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs Sidebar */}
                <div className="space-y-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center space-x-4 px-6 py-5 rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-[0.3em] border",
                                activeTab === tab.id
                                    ? "bg-orange-600 text-black border-orange-500 shadow-[0_0_30px_rgba(255,122,0,0.3)]"
                                    : "text-zinc-700 hover:text-white hover:bg-orange-500/5 border-transparent"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-black" : "text-zinc-800")} />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === "profile" && (
                        <div className="glass-premium border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
                            <div className="flex items-center space-x-8 pb-10 border-b border-white/5">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-black flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <span className="text-4xl font-black text-white relative z-10">{user.name?.[0].toUpperCase()}</span>
                                    <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white tracking-widest uppercase">{user.name}</h3>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">{user.role}</p>
                                    <button className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-800 hover:text-orange-500 transition-colors">Change Avatar Signature</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Node Alias (Full Name)</label>
                                    <input
                                        type="text"
                                        defaultValue={user.name}
                                        className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Digital ID (Email)</label>
                                    <input
                                        type="email"
                                        defaultValue={user.email}
                                        disabled
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl py-6 px-8 opacity-40 cursor-not-allowed text-zinc-700 font-black uppercase tracking-widest text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-6 pt-6">
                                <button className="px-10 py-5 rounded-2xl border border-white/5 text-zinc-800 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-orange-500/5 hover:text-white transition-all">Discard</button>
                                <button className="flex items-center space-x-3 px-12 py-5 bg-orange-600 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-orange-500 transition-all shadow-[0_10px_40px_-10px_rgba(255,122,0,0.5)]">
                                    <Save className="h-4 w-4" />
                                    <span>Synchronize Data</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="glass-premium border border-white/5 p-10 rounded-[3.5rem] space-y-10 shadow-2xl">
                            <div className="flex items-center space-x-4 mb-2">
                                <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
                                    <Lock className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-widest uppercase">Security Hardening</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-8 rounded-[2rem] bg-black border border-white/5 shadow-2xl group hover:border-orange-500/20 transition-all">
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-white tracking-widest uppercase">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Add an extra layer of security validation.</p>
                                    </div>
                                    <button className="px-8 py-3 bg-orange-600/10 text-orange-500 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] border border-orange-500/20 hover:bg-orange-600 hover:text-black transition-all">Enable</button>
                                </div>

                                {/* Workplace Security Section */}
                                {user.role === 'ADMIN' && (
                                    <div className="border-t border-white/5 pt-10 space-y-8">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <Shield className="h-6 w-6 text-red-600 animate-pulse" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Workplace Security Core (IP + Shift)</h4>
                                        </div>

                                        {/* Status Indicator */}
                                        {securitySettings.isSecurityEnabled ? (
                                            <div className="bg-gradient-to-br from-red-600 to-red-950 rounded-[2.5rem] p-10 text-white space-y-6 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.4)] border border-red-500/30 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                                    <Shield className="h-32 w-32" />
                                                </div>
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="flex items-center space-x-5">
                                                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                                            <Lock className="h-8 w-8 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black uppercase tracking-[0.2em]">🔒 Lockdown Deployed</p>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Enforcing Matrix Perimeter</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 bg-black/40 px-5 py-2.5 rounded-full border border-white/10">
                                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Active</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10 relative z-10">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">Authorized Perimeter</p>
                                                        <p className="text-sm font-black tracking-widest uppercase">192.168.18.1-100</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">Node Uptime Window</p>
                                                        <p className="text-sm font-black tracking-widest uppercase">{securitySettings.officeHoursStart} - {securitySettings.officeHoursEnd}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-black/40 rounded-[2.5rem] p-10 border border-white/5 shadow-inner">
                                                <div className="flex items-center space-x-6">
                                                    <div className="h-16 w-16 rounded-[1.8rem] bg-zinc-950 flex items-center justify-center border border-white/5 shadow-2xl">
                                                        <Shield className="h-8 w-8 text-zinc-900" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-black text-zinc-800 uppercase tracking-widest">Lockdown Standby</p>
                                                        <p className="text-[10px] text-zinc-800 font-black uppercase tracking-[0.3em]">Perimeter protection offline. Configure below.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] bg-black/50 p-6 rounded-[1.5rem] border border-white/5 leading-relaxed">
                                            Restrict dashboard access to authorized IP addresses and specific node uptime windows. This affects all non-director nodes across the matrix.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Office IP Signature</label>
                                                <input
                                                    type="text"
                                                    value={securitySettings.officeIP}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, officeIP: e.target.value })}
                                                    placeholder="e.g., ARCHITECTURAL REDESIGN PLAN"
                                                    disabled
                                                    className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 text-zinc-800 font-black uppercase tracking-widest text-xs cursor-not-allowed"
                                                />
                                                <p className="text-[9px] text-orange-600 font-black uppercase tracking-widest ml-2">✓ Dynamic range authorization active</p>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Shift Protection Window</label>
                                                <div className="flex items-center space-x-6">
                                                    <input
                                                        type="time"
                                                        value={securitySettings.officeHoursStart}
                                                        onChange={(e) => setSecuritySettings({ ...securitySettings, officeHoursStart: e.target.value })}
                                                        className="w-full bg-black border border-white/5 rounded-2xl py-6 px-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black tracking-widest text-xs"
                                                    />
                                                    <span className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">TO</span>
                                                    <input
                                                        type="time"
                                                        value={securitySettings.officeHoursEnd}
                                                        onChange={(e) => setSecuritySettings({ ...securitySettings, officeHoursEnd: e.target.value })}
                                                        className="w-full bg-black border border-white/5 rounded-2xl py-6 px-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black tracking-widest text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-red-600/10 border border-red-500/20 shadow-2xl">
                                            <div className="flex items-center space-x-5">
                                                <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center border border-white/5 shadow-2xl">
                                                    <Shield className="h-6 w-6 text-red-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-white tracking-widest uppercase">Perimeter Lockdown</p>
                                                    <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em]">Active enforcement of security constraints</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={securitySettings.isSecurityEnabled}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, isSecurityEnabled: e.target.checked })}
                                                />
                                                <div className="w-16 h-8 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-8 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            <button
                                                onClick={handleSaveSecurity}
                                                disabled={saving}
                                                className={cn(
                                                    "flex items-center space-x-4 px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-2xl overflow-hidden relative group",
                                                    saved
                                                        ? "bg-green-600 text-black shadow-green-500/40"
                                                        : "bg-red-600 text-white hover:bg-red-500 shadow-red-500/40"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin relative z-10" /> : (saved ? <CheckCircle2 className="h-4 w-4 relative z-10" /> : <Save className="h-4 w-4 relative z-10" />)}
                                                <span className="relative z-10">{saving ? "Updating Policy..." : (saved ? "Policy Authorized" : "Authorize Security Policy")}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-8 rounded-[2rem] bg-black border border-white/5 shadow-2xl group hover:border-orange-500/20 transition-all">
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-white tracking-widest uppercase">Active Sessions</p>
                                        <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Manage your active system connection points.</p>
                                    </div>
                                    <button className="px-8 py-3 bg-white/5 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all">Review</button>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-white/5 flex justify-center">
                                <button className="flex items-center space-x-3 text-red-600/40 hover:text-red-600 hover:bg-red-600/5 px-8 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.4em] border border-transparent hover:border-red-600/20 group">
                                    <Trash2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span>Terminate Node Access Permanently</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {(activeTab === "notifications" || activeTab === "appearance") && (
                        <div className="glass-premium border border-white/5 p-32 text-center rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" />
                            <Palette className="h-20 w-20 text-zinc-900 mx-auto mb-6 animate-pulse" />
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white tracking-widest uppercase">System Development</h3>
                                <p className="text-zinc-500 font-bold">Define payment schedule and legal policies.</p>
                            </div>
                            <div className="pt-8">
                                <button disabled className="px-10 py-5 bg-black/50 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-zinc-800 cursor-not-allowed">Standby for Authorization</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
