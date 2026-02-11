"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Save,
    Trash2,
    Lock
} from "lucide-react";
import { useUser } from "@/components/user-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("profile");

    if (!user) return null;

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
