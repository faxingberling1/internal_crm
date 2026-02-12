"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Mail,
    Calendar,
    ShieldCheck,
    Clock,
    Search,
    ChevronRight,
    BadgeCheck,
    AlertTriangle,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/employees");
            const data = await res.json();
            if (res.ok) {
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 flex items-center space-x-3">
                        <Users className="h-10 w-10 text-purple-600" />
                        <span>User Management</span>
                    </h2>
                    <p className="text-zinc-500 mt-2 font-medium">Manage all platform members and monitor their activity.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all w-full md:w-80 font-bold text-zinc-900"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="premium-card bg-zinc-900 text-white p-6 shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Members</p>
                        <p className="text-4xl font-black">{employees.length}</p>
                    </div>
                    <div className="absolute right-0 bottom-0 -mb-4 -mr-4 h-24 w-24 bg-white/5 rounded-full blur-2xl transition-all group-hover:bg-white/10" />
                </div>
                <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Approved</p>
                    <p className="text-4xl font-black text-green-600">{employees.filter(e => e.user?.isApproved).length}</p>
                </div>
                <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pending</p>
                    <p className="text-4xl font-black text-orange-600">{employees.filter(e => !e.user?.isApproved).length}</p>
                </div>
                <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Active Shifts</p>
                    <p className="text-4xl font-black text-blue-600">--</p>
                </div>
            </div>

            <div className="premium-card bg-white border border-zinc-100 shadow-2xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Team Member</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Position & Team</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-zinc-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-400 italic">No members found matching your search.</td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-zinc-50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center border border-zinc-200 group-hover:from-purple-50 group-hover:to-purple-100 transition-all">
                                                    <ShieldCheck className="h-6 w-6 text-zinc-500 group-hover:text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-zinc-900 tracking-tight">{emp.name}</p>
                                                    <div className="flex items-center text-xs text-zinc-500 font-bold gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-zinc-900">{emp.position || "Staff Member"}</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{emp.department || "General"}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                emp.user?.isApproved
                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                    : "bg-orange-50 text-orange-700 border-orange-100"
                                            )}>
                                                {emp.user?.isApproved ? <BadgeCheck className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                                {emp.user?.isApproved ? "Verified" : "Pending Approval"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-zinc-900">{new Date(emp.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex items-center space-x-2 bg-zinc-100 px-3 py-1 rounded-lg text-[10px] font-black text-zinc-500 uppercase">
                                                <Clock className="h-3 w-3" />
                                                <span>{emp._count?.attendance || 0} Logs</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
