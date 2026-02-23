"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    Clock,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddLeadModal } from "@/components/add-lead-modal";

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLeads = () => {
        setLoading(true);
        fetch("/api/leads")
            .then((res) => res.json())
            .then((data) => {
                setLeads(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase tracking-[0.1em]">Leads <span className="text-orange-600">Dashboard</span></h2>
                    <p className="text-zinc-600 font-bold mt-2 uppercase text-xs tracking-widest">Manage and track your operational opportunities.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-6 py-3 rounded-2xl transition-all font-black uppercase text-xs tracking-widest shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Initiate Lead</span>
                </button>
            </div>

            <AddLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={fetchLeads}
            />

            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan intelligence database..."
                        className="w-full bg-[#080808] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-xs font-black uppercase tracking-widest text-orange-500 placeholder:text-zinc-800 shadow-2xl"
                    />
                </div>
                <button className="flex items-center space-x-2 bg-black/40 border border-white/5 px-6 py-3.5 rounded-2xl hover:bg-orange-600/10 hover:border-orange-500/20 transition-all text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-orange-500 shadow-xl">
                    <Filter className="h-4 w-4" />
                    <span>Advanced Filters</span>
                </button>
            </div>

            <div className="glass-premium p-0 overflow-hidden border border-white/5 rounded-[2.5rem] shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Lead Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Operational Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Communication Nodes</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Origin Source</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Timestamp</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-5"><div className="h-4 w-32 bg-zinc-950/40 rounded animate-pulse" /></td>
                                    <td className="px-8 py-5"><div className="h-4 w-20 bg-zinc-950/40 rounded animate-pulse" /></td>
                                    <td className="px-8 py-5"><div className="h-4 w-24 bg-zinc-950/40 rounded animate-pulse" /></td>
                                    <td className="px-8 py-5"><div className="h-4 w-16 bg-zinc-950/40 rounded animate-pulse" /></td>
                                    <td className="px-8 py-5"><div className="h-4 w-20 bg-zinc-950/40 rounded animate-pulse" /></td>
                                    <td className="px-8 py-5 text-right"><div className="h-4 w-8 bg-zinc-950/40 rounded ml-auto animate-pulse" /></td>
                                </tr>
                            ))
                        ) : leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                    No leads found. Start by adding your first lead.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-orange-500/[0.02] transition-colors group cursor-pointer border-b border-white/5 last:border-0">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center border border-black shadow-lg">
                                                <span className="text-sm font-black text-black">
                                                    {lead.name.split(" ").map((n: string) => n[0]).join("")}
                                                </span>
                                            </div>
                                            <div className="font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-widest text-xs">{lead.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                                            lead.status === "NEW" ? "text-orange-500 bg-orange-500/10 border-orange-500/20" :
                                                lead.status === "QUALIFIED" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                                                    "text-zinc-500 bg-zinc-950/40 border-white/5"
                                        )}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            {lead.email && (
                                                <div className="flex items-center text-xs text-zinc-500">
                                                    <Mail className="h-3 w-3 mr-1.5 text-zinc-400" />
                                                    {lead.email}
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div className="flex items-center text-xs text-zinc-500">
                                                    <Phone className="h-3 w-3 mr-1.5 text-zinc-400" />
                                                    {lead.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] text-zinc-600 font-black uppercase tracking-widest">{lead.source || "Unknown"}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center text-[10px] text-zinc-700 font-bold uppercase tracking-tight">
                                            <Clock className="h-3 w-3 mr-2 text-zinc-800" />
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 hover:bg-orange-600/10 text-zinc-800 hover:text-orange-500 transition-all">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
