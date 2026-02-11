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

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center">
                        Account Approvals
                        <span className="ml-3 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-sm font-bold border border-purple-200">
                            {pendingUsers.length} Pending
                        </span>
                    </h2>
                    <p className="text-zinc-500 mt-2">Manage and approve new user requests for CRM access.</p>
                </div>
            </div>

            <div className="premium-card bg-white shadow-2xl border-zinc-100 p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Requested Access</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-4 w-48 bg-zinc-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                                        <td className="px-6 py-6"><div className="h-8 w-24 bg-zinc-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : pendingUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center">
                                            <ShieldCheck className="h-12 w-12 text-zinc-200 mb-4" />
                                            <p className="text-lg font-medium">All caught up!</p>
                                            <p className="text-sm">No pending account requests at this time.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-500">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900">{user.name || "Unknown User"}</div>
                                                    <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                                {user.role} Access
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAction(user.id, "REJECT")}
                                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Reject Access"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(user.id, "APPROVE")}
                                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-green-500/20 transition-all"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Approve</span>
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

            <div className="flex items-start p-4 bg-blue-50 border border-blue-100 rounded-xl space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold">Security Notice</p>
                    <p>Approval grants immediate access to the Internal CRM data. Please verify the identity of the user before granting permissions.</p>
                </div>
            </div>
        </div>
    );
}
