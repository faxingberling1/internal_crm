"use client";

import { useState, useEffect } from "react";
import {
    PhoneCall,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    MinusCircle,
    MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CallsPage() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/calls")
            .then((res) => res.json())
            .then((data) => {
                setCalls(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] right-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Network Archive 1.2</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Communication <span className="text-orange-500">Logs</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg">Historical record of high-fidelity lead engagements.</p>
                </div>
                <div className="relative group max-w-sm w-full">
                    <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 transition-colors group-hover:text-orange-500" />
                    <input
                        type="text"
                        placeholder="Scan Archives..."
                        className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-white font-bold placeholder:text-zinc-800 shadow-inner group-hover:border-white/10"
                    />
                </div>
            </div>

            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-1 relative overflow-hidden isolate shadow-2xl">
                <div className="absolute inset-0 bg-zinc-950/40 -z-10" />
                <div className="divide-y divide-white/[0.03]">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-10 animate-pulse flex items-center space-x-8">
                                <div className="h-16 w-16 bg-zinc-900 rounded-[1.5rem] animate-pulse border border-white/5 shadow-inner" />
                                <div className="flex-1 space-y-4">
                                    <div className="h-5 w-1/4 bg-zinc-900 rounded-lg animate-pulse" />
                                    <div className="h-3 w-1/2 bg-zinc-900/60 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : calls.length === 0 ? (
                        <div className="p-32 text-center group">
                            <div className="mb-6 relative inline-block">
                                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <PhoneCall className="h-20 w-20 text-zinc-800 mx-auto transition-all group-hover:scale-110 group-hover:text-orange-950 duration-700" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-700 uppercase tracking-tighter italic">Archive Empty</h3>
                            <p className="text-zinc-900 font-black text-[10px] mt-4 uppercase tracking-[0.4em]">No recorded transmissions detected.</p>
                        </div>
                    ) : (
                        calls.map((call: any) => (
                            <div key={call.id} className="p-10 hover:bg-orange-600/[0.02] transition-all duration-500 flex items-center justify-between group relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 w-1 bg-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                <div className="flex items-center space-x-8 relative z-10">
                                    <div className={cn(
                                        "h-16 w-16 rounded-[1.75rem] flex items-center justify-center border transition-all duration-700 shadow-2xl relative overflow-hidden",
                                        call.status === "COMPLETED" ? "text-orange-500 border-orange-500/20 bg-orange-500/5 shadow-[0_0_20px_-5px_rgba(255,100,0,0.1)]" :
                                            call.status === "NO_ANSWER" ? "text-zinc-500 border-white/5 bg-zinc-900/40" :
                                                "text-red-900 border-red-950 bg-red-950/10"
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-20" />
                                        {call.status === "COMPLETED" ? <CheckCircle2 className="h-7 w-7" /> :
                                            call.status === "NO_ANSWER" ? <MinusCircle className="h-7 w-7" /> :
                                                <XCircle className="h-7 w-7" />}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-orange-500 transition-colors duration-500">
                                                Engagement: {call.lead?.name || "ANONYMOUS ENTITY"}
                                            </h4>
                                            {call.status === "COMPLETED" && (
                                                <div className="px-3 py-1 bg-orange-600/10 border border-orange-500/20 rounded-full">
                                                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Successful Payload</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 space-x-4">
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-orange-600" />
                                                <span className="text-zinc-500 group-hover:text-white transition-colors">{call.duration} SECS</span>
                                            </span>
                                            <span className="text-zinc-900">•</span>
                                            <span className="text-zinc-500 group-hover:text-white transition-colors">{new Date(call.timestamp).toLocaleString().toUpperCase()}</span>
                                        </div>

                                        {call.notes && (
                                            <div className="mt-6 flex items-start gap-4 transform translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                                                <div className="h-full w-1 bg-orange-600/30 rounded-full" />
                                                <p className="text-sm text-zinc-500 font-bold italic leading-relaxed max-w-2xl px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5">
                                                    "{call.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button className="p-4 rounded-2xl bg-zinc-950/0 hover:bg-zinc-950 border border-transparent hover:border-white/5 text-zinc-700 hover:text-orange-500 transition-all duration-500 shadow-inner group-hover:translate-x-[-10px]">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
