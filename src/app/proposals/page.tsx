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
        { label: "Active Proposals", value: proposals.length, icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Pending Revenue", value: `$${pendingValue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Proposals</h2>
                    <p className="text-zinc-500 mt-1">Generate and track high-value business proposals.</p>
                </div>
                <Link href="/proposals/create">
                    <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-xl hover:shadow-purple-500/20 font-bold">
                        <Plus className="h-5 w-5" />
                        <span>Create New Proposal</span>
                    </button>
                </Link>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="premium-card bg-white border border-zinc-100 p-6 flex items-center space-x-4">
                        <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search proposals by client or name..."
                        className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm text-zinc-900 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-3xl bg-zinc-50 animate-pulse border border-zinc-100" />
                    ))
                ) : proposals.length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                            <i className="mb-6 p-6 rounded-full bg-zinc-50 border border-zinc-100">
                                <FileText className="h-12 w-12 text-zinc-300" />
                            </i>
                            <h3 className="text-xl font-bold text-zinc-900">No proposals found</h3>
                            <p className="text-zinc-500 mt-2">Start your first high-fidelity proposal to see it listed here.</p>
                        </div>
                    </div>
                ) : (
                    proposals.map((proposal: any) => (
                        <div key={proposal.id} className="premium-card card-purple flex flex-col h-full hover:scale-[1.02] cursor-pointer group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                                    ID: {proposal.id.slice(-6).toUpperCase()}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm",
                                    proposal.status === "SENT" ? "text-blue-700 bg-blue-50 border-blue-200" :
                                        proposal.status === "ACCEPTED" ? "text-green-700 bg-green-50 border-green-200" :
                                            "text-zinc-600 bg-zinc-100 border-zinc-200"
                                )}>
                                    {proposal.status}
                                </span>
                            </div>

                            <h4 className="text-xl font-black text-zinc-900 group-hover:text-purple-600 transition-colors leading-tight mb-2 tracking-tight">
                                {proposal.name}
                            </h4>
                            <p className="text-sm font-medium text-zinc-500 flex items-center mb-6">
                                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                {proposal.lead?.name || "Premium Client"}
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                    <div className="flex items-center text-2xl font-black text-zinc-900">
                                        <DollarSign className="h-5 w-5 mr-0.5 text-green-600" />
                                        {proposal.value?.toLocaleString() || "0"}
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-zinc-400">
                                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                                        {new Date(proposal.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 uppercase tracking-widest">
                                        {proposal.type}
                                    </span>
                                    <button className="p-2 rounded-xl text-zinc-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

