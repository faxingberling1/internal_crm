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
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Leads</h2>
                    <p className="text-zinc-500 mt-2">Manage and track your potential clients.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Lead</span>
                </button>
            </div>

            <AddLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={fetchLeads}
            />

            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500/50 transition-all outline-none text-sm text-zinc-900 shadow-sm"
                    />
                </div>
                <button className="flex items-center space-x-2 bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all text-sm font-medium text-zinc-700 shadow-sm">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    <span>Filters</span>
                </button>
            </div>

            <div className="premium-card p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Lead</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Source</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Added</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4 text-right"><div className="h-4 w-8 bg-zinc-100 rounded ml-auto animate-pulse" /></td>
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
                                <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer border-b border-zinc-100 last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border border-zinc-200 shadow-sm">
                                                <span className="text-sm font-medium text-purple-700">
                                                    {lead.name.split(" ").map((n: string) => n[0]).join("")}
                                                </span>
                                            </div>
                                            <div className="font-medium text-zinc-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{lead.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                                            lead.status === "NEW" ? "text-blue-700 bg-blue-100 border-blue-200" :
                                                lead.status === "QUALIFIED" ? "text-green-700 bg-green-100 border-green-200" :
                                                    "text-zinc-600 bg-zinc-100 border-zinc-200"
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
                                    <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{lead.source || "Unknown"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-zinc-500">
                                            <Clock className="h-3 w-3 mr-1.5 text-zinc-400" />
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
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
