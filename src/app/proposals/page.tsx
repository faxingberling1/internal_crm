"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Search,
    Plus,
    MoreVertical,
    DollarSign,
    Clock,
    ExternalLink,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProposalsPage() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/proposals")
            .then((res) => res.json())
            .then((data) => {
                setProposals(data || []);
                setLoading(false);
            });
    }, []);

    const totalValue = proposals.reduce((sum, p: any) => sum + (p.value || 0), 0);
    const pendingValue = proposals
        .filter((p: any) => p.status === "SENT")
        .reduce((sum, p: any) => sum + (p.value || 0), 0);

    const stats = [
        { label: "Active Proposals", value: proposals.length, icon: FileText, color: "text-orange-600", bg: "bg-orange-600/10" },
        { label: "Total Pipeline", value: `$ ${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Pending Revenue", value: `$ ${pendingValue.toLocaleString()}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-600/10" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-24 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center space-x-3 text-orange-500 mb-2">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Business Ledger 4.0</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                        Proposals <span className="text-orange-500">Hub</span>
                    </h2>
                    <p className="text-zinc-500 font-bold mt-4 text-lg">Generate and track high-value business deals in zero-latency obsidian.</p>
                </div>
                <Link href="/proposals/create">
                    <button className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-10 py-5 rounded-2xl transition-all shadow-[0_0_50px_-10px_rgba(255,122,0,0.3)] hover:scale-[1.02] font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <Plus className="h-4 w-4" />
                        <span>Deploy Proposal</span>
                    </button>
                </Link>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-premium p-8 rounded-[2.5rem] border border-white/5 flex items-center space-x-6 hover:glow-orange transition-all duration-500 shadow-2xl">
                        <div className={cn("p-5 rounded-2xl border border-white/5 shadow-inner", stat.bg, stat.color)}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white tracking-tighter italic leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                    <input
                        type="text"
                        placeholder="Scan ledger by client or signature..."
                        className="w-full bg-zinc-950/40 border border-white/5 rounded-3xl py-5 pl-16 pr-6 focus:bg-zinc-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800 shadow-inner"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-[3rem] bg-zinc-950/40 animate-pulse border border-white/5" />
                    ))
                ) : proposals.length === 0 ? (
                    <div className="col-span-full py-32 text-center glass-premium rounded-[4rem] border border-white/5">
                        <div className="max-w-xs mx-auto flex flex-col items-center space-y-6">
                            <div className="p-8 rounded-full bg-zinc-950 border border-white/5 shadow-inner">
                                <FileText className="h-16 w-16 text-zinc-800 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Ledger <span className="text-orange-500">Empty</span></h3>
                                <p className="text-zinc-600 font-bold leading-relaxed tracking-tight">Deploy your first high-fidelity proposal to see the matrix fill.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    proposals.map((proposal: any) => (
                        <Link
                            key={proposal.id}
                            href={`/proposals/${proposal.id}`}
                            className="glass-premium rounded-[3rem] p-10 border border-white/5 flex flex-col h-full hover:glow-orange transition-all duration-700 group relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center justify-between mb-8">
                                <div className="px-4 py-1.5 rounded-xl bg-zinc-950/60 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                    REF: {proposal.id.slice(-6).toUpperCase()}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border shadow-xl",
                                    proposal.status === "SENT" ? "text-orange-500 bg-orange-500/10 border-orange-500/20" :
                                        proposal.status === "ACCEPTED" ? "text-green-500 bg-green-500/10 border-green-500/20" :
                                            "text-zinc-600 bg-zinc-950 border-white/5"
                                )}>
                                    {proposal.status}
                                </span>
                            </div>

                            <h4 className="text-3xl font-black text-white group-hover:text-orange-500 transition-all duration-500 leading-none mb-4 italic uppercase tracking-tighter">
                                {proposal.name}
                            </h4>
                            <p className="text-sm font-bold text-zinc-500 flex items-center mb-10 group-hover:text-zinc-300 transition-colors">
                                <ShieldCheck className="h-4 w-4 mr-2 text-orange-600" />
                                {proposal.lead?.name || "Target Entity"}
                            </p>

                            <div className="mt-auto space-y-6">
                                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                    <div className="flex items-center text-4xl font-black text-white tracking-tighter leading-none">
                                        <span className="text-xs text-orange-600 mr-2 font-black italic">$</span>
                                        {proposal.value?.toLocaleString() || "0"}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                                            <Clock className="h-3 w-3 mr-1.5" />
                                            Logged
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-orange-500 bg-orange-600/10 px-4 py-1.5 rounded-xl border border-orange-500/20 uppercase tracking-[0.2em]">
                                        {proposal.type}
                                    </span>
                                    <div className="flex items-center space-x-2 text-[10px] font-black text-orange-500 group-hover:text-white transition-all uppercase tracking-widest">
                                        <span>Examine</span>
                                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

