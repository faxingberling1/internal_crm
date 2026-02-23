"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Search,
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
import { NotificationDropdown } from "./notification-dropdown";

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
        <header className="sticky top-0 z-40 w-full bg-[#050505]/95 backdrop-blur-3xl border-b border-white/5 py-4">
            <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between">
                {/* Tactical Breadcrumbs */}
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-orange-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)] border border-orange-400/30">
                        <Globe className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="flex items-center space-x-1 text-zinc-500">
                            <span className="text-[10px] font-black uppercase tracking-wider">PORTAL</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-700" />
                        <div className="flex items-center space-x-2">
                            {pathSegments.map((segment, i) => (
                                <div key={segment} className="flex items-center space-x-2">
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors",
                                        i === pathSegments.length - 1 ? "text-orange-500" : "text-zinc-600"
                                    )}>
                                        {segment.replace(/-/g, " ")}
                                    </span>
                                    {i < pathSegments.length - 1 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cognitive Search Bar */}
                <div className="hidden lg:flex flex-1 max-w-lg mx-12">
                    <div className="relative w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Execute command protocol..."
                            className="w-full bg-black/40 border border-white/5 rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-zinc-700 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-white"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1 px-2 py-1 bg-black border border-zinc-900 rounded-lg text-[9px] font-black text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px]">⌘</span>
                            <span>K</span>
                        </div>
                    </div>
                </div>

                {/* Systems Command & Auth Presence */}
                <div className="flex items-center space-x-8">
                    {/* HQ Synchronization Display */}
                    <div className="hidden xl:flex items-center space-x-8 h-10 border-r border-white/5 pr-8">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Global Sync</span>
                            </div>
                            <p className="text-[11px] font-black text-zinc-600 tabular-nums">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                <span className="ml-1 text-[9px] text-zinc-800 opacity-60">PKT</span>
                            </p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl flex items-center space-x-2">
                            <Activity className="h-3 w-3 text-orange-500" />
                            <span className="text-[10px] font-black text-orange-600 tracking-tighter">98.4 VLO</span>
                        </div>
                    </div>

                    {/* Notifications Relay */}
                    <div className="flex items-center space-x-3">
                        <NotificationDropdown />
                    </div>

                    {/* User Authorization Matrix Profile */}
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end leading-tight">
                            <p className="text-[13px] font-black text-orange-500 tracking-tight truncate max-w-[140px]">
                                {user?.name || user?.email}
                            </p>
                            <div className="flex items-center space-x-1 mt-0.5">
                                <Zap className="h-2 w-2 text-orange-600 fill-current" />
                                <span className="text-[9px] font-black text-black bg-orange-600 px-2 py-0.5 rounded-md uppercase tracking-widest leading-none ml-1">
                                    {user?.role} NODE
                                </span>
                            </div>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="h-12 w-12 rounded-[1.25rem] bg-orange-600 flex items-center justify-center border-2 border-black shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                                {user?.name ? (
                                    <span className="text-sm font-black text-black">{user.name.charAt(0)}</span>
                                ) : (
                                    <Activity className="h-5 w-5 text-black" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-orange-500 rounded-full border-2 border-black" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
