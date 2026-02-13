"use client";

import { Lock, Clock, ShieldAlert, ArrowLeft, Headphones, Wifi } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function UnauthorizedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'unknown';

    const violationDetails = {
        ip: {
            title: "Network Access Denied",
            description: "You must be connected to the authorized office network to access this dashboard.",
            color: "purple"
        },
        time: {
            title: "Outside Office Hours",
            description: "Access to this dashboard is restricted to scheduled office hours only.",
            color: "blue"
        },
        unknown: {
            title: "Access Restricted",
            description: "The dashboard is currently in Office-Only Mode. Your current network or time is not authorized for access.",
            color: "red"
        }
    };

    const violation = violationDetails[reason as keyof typeof violationDetails] || violationDetails.unknown;

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-[3rem] border border-zinc-200 shadow-2xl p-12 text-center space-y-8"
            >
                <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center border-4 border-white shadow-xl">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-zinc-900 border-4 border-white flex items-center justify-center shadow-lg"
                    >
                        <Lock className="h-3 w-3 text-white" />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">
                        {violation.title}
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed text-lg">
                        {violation.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-3xl border text-left space-y-2 ${reason === 'ip' ? 'bg-purple-50 border-purple-200' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                        <div className="flex items-center space-x-2 text-zinc-900">
                            <Wifi className={`h-4 w-4 ${reason === 'ip' ? 'text-purple-600' : 'text-zinc-400'}`} />
                            <span className="font-black text-xs uppercase tracking-widest">Network Access</span>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium italic">
                            {reason === 'ip' ? '⚠️ Your network is not authorized' : 'You must be connected to the secure office network.'}
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl border text-left space-y-2 ${reason === 'time' ? 'bg-blue-50 border-blue-200' : 'bg-zinc-50 border-zinc-100'
                        }`}>
                        <div className="flex items-center space-x-2 text-zinc-900">
                            <Clock className={`h-4 w-4 ${reason === 'time' ? 'text-blue-600' : 'text-zinc-400'}`} />
                            <span className="font-black text-xs uppercase tracking-widest">Office Hours</span>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium italic">
                            {reason === 'time' ? '⚠️ Access outside scheduled hours' : 'Access is limited to your scheduled shift hours.'}
                        </p>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-500/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Login</span>
                    </button>
                    <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200">
                        <Headphones className="h-4 w-4" />
                        <span>Support</span>
                    </button>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Proprietary Interface &bull; Secure Protocol
                </p>
            </motion.div>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        }>
            <UnauthorizedContent />
        </Suspense>
    );
}
