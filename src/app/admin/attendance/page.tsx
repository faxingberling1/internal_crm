"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    User,
    Search,
    Filter,
    Download,
    UserCheck,
    Clock,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        day: new Date().getDate().toString(),
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchAttendance();
    }, [filters]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/attendance?${query}`);
            const data = await res.json();
            setAttendance(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-zinc-900 flex items-center space-x-3">
                    <UserCheck className="h-10 w-10 text-blue-600" />
                    <span>Attendance Intelligence</span>
                </h2>
                <p className="text-zinc-500 mt-2 font-medium">Global oversight of employee activity and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="space-y-6">
                    <div className="premium-card bg-white border border-zinc-100 p-6 space-y-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Filter className="h-4 w-4 text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Advanced Filters</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Month</label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Day</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={filters.day}
                                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setFilters({ day: "", month: filters.month, year: filters.year })}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                        >
                            Clear Day Filter
                        </button>
                    </div>

                    <div className="premium-card bg-zinc-900 border-none p-6 text-white overflow-hidden group">
                        <div className="relative z-10">
                            <Download className="h-8 w-8 text-blue-400 mb-4" />
                            <h4 className="text-lg font-black tracking-tight mb-1">Export Analytics</h4>
                            <p className="text-zinc-400 text-xs mb-6">Generate full attendance reports in CSV/PDF format.</p>
                            <button className="w-full py-3 bg-white text-zinc-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all group-hover:scale-[1.02]">Download v1.0</button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="premium-card bg-white border border-zinc-100 p-0 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Daily Logs</h3>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                        {filters.day ? `${filters.day} ` : ""}{months[parseInt(filters.month) - 1]} {filters.year}
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all w-64 font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Employee</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Check In</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Check Out</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6">
                                                    <div className="h-4 bg-zinc-100 rounded-lg w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="max-w-xs mx-auto space-y-4">
                                                    <Calendar className="h-12 w-12 text-zinc-200 mx-auto" />
                                                    <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No Records Found</h4>
                                                    <p className="text-zinc-500 text-sm">Adjust your filters to view historical attendance data.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        attendance.map((record: any) => (
                                            <tr key={record.id} className="hover:bg-zinc-50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center border border-zinc-200 group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
                                                            <User className="h-5 w-5 text-zinc-500 group-hover:text-blue-600" />
                                                        </div>
                                                        <span className="font-black text-zinc-900 tracking-tight">{record.employee?.name || "Anonymous"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center space-x-2 text-zinc-500 font-medium">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{record.employee?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-zinc-700">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-zinc-700">
                                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        record.checkOut ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {record.checkOut ? "Shift End" : "Active"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
