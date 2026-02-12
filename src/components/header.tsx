"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Search,
    Bell,
    Command,
    Wifi,
    Clock,
    ChevronRight,
    Activity,
    Settings,
    Maximize2,
    Globe,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/components/user-context";
import { cn } from "@/lib/utils";

export function Header() {
    const pathname = usePathname();
    const { user } = useUser();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            // Synchronize with Karachi Time (PKT: UTC+5)
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const pkt = new Date(utc + (3600000 * 5));
            setTime(pkt);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pathSegments = pathname.split("/").filter(Boolean);

    if (!user) return null;

    return (
        <header className="sticky top-0 z-40 w-full bg-white/60 backdrop-blur-md border-b border-zinc-100 py-4">
            <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between">
                {/* Tactical Breadcrumbs */}
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                        <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="flex items-center space-x-1 text-zinc-400">
                            <span className="text-[10px] font-black uppercase tracking-wider">PORTAL</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-200" />
                        <div className="flex items-center space-x-2">
                            {pathSegments.map((segment, i) => (
                                <div key={segment} className="flex items-center space-x-2">
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors",
                                        i === pathSegments.length - 1 ? "text-purple-600" : "text-zinc-500"
                                    )}>
                                        {segment.replace(/-/g, " ")}
                                    </span>
                                    {i < pathSegments.length - 1 && <ChevronRight className="h-3 w-3 text-zinc-200" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cognitive Search Bar */}
                <div className="hidden lg:flex flex-1 max-w-lg mx-12">
                    <div className="relative w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Execute command protocol..."
                            className="w-full bg-zinc-50/50 border border-zinc-100 rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-zinc-300 focus:ring-4 focus:ring-purple-500/5 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-[9px] font-black text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px]">⌘</span>
                            <span>K</span>
                        </div>
                    </div>
                </div>

                {/* Systems Command & Auth Presence */}
                <div className="flex items-center space-x-8">
                    {/* HQ Synchronization Display */}
                    <div className="hidden xl:flex items-center space-x-8 h-10 border-r border-zinc-100 pr-8">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Global Sync</span>
                            </div>
                            <p className="text-[11px] font-black text-zinc-900 tabular-nums">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                <span className="ml-1 text-[9px] text-zinc-400 opacity-60">PKT</span>
                            </p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-2xl flex items-center space-x-2">
                            <Activity className="h-3 w-3 text-purple-600" />
                            <span className="text-[10px] font-black text-purple-700 tracking-tighter">98.4 VLO</span>
                        </div>
                    </div>

                    {/* Notifications Relay */}
                    <div className="flex items-center space-x-3">
                        <button className="h-11 w-11 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-purple-200 transition-all group relative overflow-hidden">
                            <Bell className="h-5 w-5 text-zinc-400 group-hover:text-purple-600 transition-colors" />
                            <span className="absolute top-3 right-3 h-2 w-2 bg-purple-600 rounded-full border-2 border-white shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
                        </button>
                    </div>

                    {/* User Authorization Matrix Profile */}
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end leading-tight">
                            <p className="text-[13px] font-black text-zinc-900 tracking-tight truncate max-w-[140px]">
                                {user?.name || user?.email}
                            </p>
                            <div className="flex items-center space-x-1 mt-0.5">
                                <Zap className="h-2 w-2 text-purple-600 fill-current" />
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                    {user?.role} NODE
                                </span>
                            </div>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="h-12 w-12 rounded-[1.25rem] bg-zinc-900 flex items-center justify-center border-2 border-white shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                                {user?.name ? (
                                    <span className="text-sm font-black text-white">{user.name.charAt(0)}</span>
                                ) : (
                                    <Activity className="h-5 w-5 text-purple-400" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
