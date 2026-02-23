"use client";

import { useState, useEffect } from "react";
import {
    Users,
    CheckCircle,
    XCircle,
    Mail,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApprovalsPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approvals");
            const data = await res.json();
            setPendingUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId: string, action: "APPROVE" | "REJECT") => {
        try {
            const res = await fetch("/api/admin/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action }),
            });
            if (res.ok) {
                fetchPendingUsers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-6">
                <div className="h-20 w-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]" />
                <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Scanning Authorization Requests...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 pb-32 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-10 relative group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600/5 blur-[80px] -z-10 group-hover:bg-orange-600/10 transition-colors duration-1000" />

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group/title">
                        <div className="h-px w-8 bg-orange-500/50 group-hover/title:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Command Center Approvals</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
                            Account <span className="text-orange-500">Approvals</span>
                        </h2>
                        <div className="glass-premium px-6 py-2 rounded-full bg-orange-600/10 text-orange-500 text-xs font-black border border-orange-500/20 shadow-[0_0_20px_rgba(255,100,0,0.1)]">
                            {pendingUsers.length} Pending Nodes
                        </div>
                    </div>
                    <p className="text-zinc-500 font-bold text-lg max-w-xl tracking-tight">
                        <span className="h-2 w-2 rounded-full bg-orange-600 inline-block animate-pulse mr-3 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                        Manage and authorize new user requests for system access.
                    </p>
                </div>
            </div>

            <div className="glass-premium rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:glow-orange transition-all duration-700">
                <div className="absolute inset-0 bg-black/40 -z-10" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0c0c0c]/50 border-b border-white/5">
                                <th className="px-10 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">User Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Requested Auth Level</th>
                                <th className="px-10 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-right">Clearance Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pendingUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-10 py-40 text-center">
                                        <div className="flex flex-col items-center space-y-8 group/empty">
                                            <div className="h-28 w-28 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner group-hover/empty:border-orange-500/20 transition-all duration-700">
                                                <ShieldCheck className="h-12 w-12 text-zinc-800 group-hover/empty:text-orange-600 animate-pulse transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-3xl font-black text-white tracking-tighter italic uppercase">All Nodes <span className="text-orange-500">Authorized</span></p>
                                                <p className="text-zinc-600 font-bold tracking-tight text-lg">No pending account requests at this time.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-orange-600/[0.02] transition-colors group">
                                        <td className="px-10 py-10">
                                            <div className="flex items-center space-x-6">
                                                <div className="h-16 w-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:border-orange-500/30 group-hover:text-orange-500 transition-all duration-500 shadow-xl">
                                                    <Users className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-white text-2xl tracking-tighter uppercase italic">{user.name || "Unknown Identity"}</div>
                                                    <div className="flex items-center text-xs text-zinc-500 font-bold mt-1 tracking-tight">
                                                        <Mail className="h-4 w-4 mr-2 text-orange-600/60" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <span className="px-5 py-2 rounded-xl bg-zinc-950 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5 group-hover:border-orange-500/20 group-hover:text-orange-500 transition-all shadow-xl">
                                                {user.role} Clearance Sequence
                                            </span>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button
                                                    onClick={() => handleAction(user.id, "REJECT")}
                                                    className="p-4 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                                                    title="Reject Access"
                                                >
                                                    <XCircle className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(user.id, "APPROVE")}
                                                    className="flex items-center space-x-4 bg-orange-600 hover:bg-orange-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_-10px_rgba(255,122,0,0.4)] hover:shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)] transition-all active:scale-95 relative overflow-hidden group/btn"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                                    <CheckCircle className="h-4 w-4 relative z-10" />
                                                    <span className="relative z-10">Authorize Node</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-start p-12 bg-black/40 border border-white/5 rounded-[3.5rem] space-x-8 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-700">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/5 blur-[80px] -z-10 group-hover:bg-orange-600/10 transition-colors" />
                <div className="h-16 w-16 bg-orange-600/10 rounded-2xl border border-orange-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(255,100,0,0.1)]">
                    <AlertCircle className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-black uppercase tracking-[0.5em] text-orange-500">Global Security Clearance Notice</p>
                    <p className="text-zinc-500 font-bold tracking-tight text-lg leading-relaxed">
                        Authorization grants immediate access to the Internal CRM data.
                        Verify user identity credentials and regional clearance requirements before authorizing node permissions into the secure environment.
                    </p>
                </div>
            </div>
        </div>
    );
}
