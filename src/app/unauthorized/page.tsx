"use client";

import { Lock, Clock, ShieldAlert, ArrowLeft, Headphones, Wifi } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

function UnauthorizedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'unknown';

    const violationDetails = {
        ip: {
            title: "Network Access Denied",
            description: "You must be connected to the authorized office network to access this dashboard.",
            color: "text-orange-600",
            bg: "bg-orange-600/10",
            border: "border-orange-500/20"
        },
        time: {
            title: "Outside Office Hours",
            description: "Access to this dashboard is restricted to scheduled office hours only.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        unknown: {
            title: "Access Restricted",
            description: "The dashboard is currently in Office-Only Mode. Your current network or time is not authorized for access.",
            color: "text-orange-600",
            bg: "bg-orange-600/10",
            border: "border-orange-500/20"
        }
    };

    const violation = violationDetails[reason as keyof typeof violationDetails] || violationDetails.unknown;

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[40%] bg-orange-600/10 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full glass-premium rounded-[3.5rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] p-12 text-center space-y-10 relative z-10 hover:glow-orange transition-all duration-700"
            >
                <div className="relative inline-block">
                    <div className="h-28 w-28 rounded-[2.5rem] bg-orange-600/10 flex items-center justify-center border border-orange-500/20 shadow-inner group">
                        <ShieldAlert className="h-12 w-12 text-orange-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute -top-3 -right-3 h-10 w-10 rounded-[1rem] bg-zinc-950 border border-orange-500/30 flex items-center justify-center shadow-lg"
                    >
                        <Lock className="h-4 w-4 text-orange-600" />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3 text-orange-500 mb-2">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Access Restricted 403</span>
                        <div className="h-px w-8 bg-orange-500/50" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        {violation.title.split(' ')[0]} <span className="text-orange-500">{violation.title.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-zinc-500 font-bold max-w-md mx-auto leading-relaxed text-lg tracking-tight">
                        {violation.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className={cn(
                        "p-8 rounded-[2rem] border text-left space-y-3 transition-all",
                        reason === 'ip' ? "bg-orange-600/10 border-orange-500/30 glow-orange/20" : "bg-zinc-950/40 border-white/5 opacity-40 shadow-inner"
                    )}>
                        <div className="flex items-center space-x-3 text-white">
                            <Wifi className={cn("h-5 w-5", reason === 'ip' ? "text-orange-600" : "text-zinc-600")} />
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Network Access</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                            {reason === 'ip' ? <span className="text-white">// UNAUTHORIZED_IP_ADDRESS</span> : 'Requires secure office tunnel connection.'}
                        </p>
                    </div>

                    <div className={cn(
                        "p-8 rounded-[2rem] border text-left space-y-3 transition-all",
                        reason === 'time' ? "bg-orange-500/10 border-orange-500/30 glow-orange/20" : "bg-zinc-950/40 border-white/5 opacity-40 shadow-inner"
                    )}>
                        <div className="flex items-center space-x-3 text-white">
                            <Clock className={cn("h-5 w-5", reason === 'time' ? "text-orange-500" : "text-zinc-600")} />
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Temporal Access</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                            {reason === 'time' ? <span className="text-white">// OUTSIDE_SHIFT_POLICY</span> : 'Account restricted to scheduled hours.'}
                        </p>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full sm:w-auto group flex items-center justify-center space-x-3 px-10 py-5 bg-orange-600 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-[0_0_30px_-5px_rgba(255,122,0,0.4)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Establish Connection</span>
                    </button>
                    <button className="w-full sm:w-auto flex items-center justify-center space-x-3 px-10 py-5 bg-zinc-950 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-orange-500 hover:bg-zinc-900 transition-all border border-white/5">
                        <Headphones className="h-4 w-4" />
                        <span>Support Center</span>
                    </button>
                </div>

                <div className="pt-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group cursor-default">
                        Internal Policy &bull; <span className="group-hover:text-orange-500 transition-colors">Proprietary Interface</span>
                    </p>
                </div>
            </motion.div >
        </div >
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] animate-pulse">Initializing Identity Scrutiny...</p>
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    );
}
