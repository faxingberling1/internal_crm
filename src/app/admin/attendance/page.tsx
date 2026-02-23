"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    User,
    Search,
    Filter,
    Download,
    UserCheck,
    Clock,
    Mail,
    LayoutList,
    PieChart,
    Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Attendance {
    id: string;
    employeeId: string;
    checkIn: string;
    checkOut?: string;
    status: string;
    notes?: string;
    employee: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminAttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [viewMode, setViewMode] = useState<"LIST" | "SUMMARY">("LIST");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        day: new Date().getDate().toString(),
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        fetchAttendance();
        fetchEmployees();
    }, [filters]);

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/admin/employees");
            const data = await res.json();
            if (Array.isArray(data)) setEmployees(data);
        } catch (error) {
            console.error("Fetch employees error:", error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/attendance?${query}`);
            const data = await res.json();

            if (data && Array.isArray(data)) {
                setAttendance(data);
            } else {
                setAttendance([]);
            }
        } catch (error) {
            console.error("Fetch attendance error:", error);
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        const summary: Record<string, { name: string, email: string, totalMs: number, count: number }> = {};

        const attendanceData = Array.isArray(attendance) ? attendance : [];

        attendanceData.forEach((record: Attendance) => {
            if (!record.employee) return;
            const empId = record.employeeId;
            if (!summary[empId]) {
                summary[empId] = {
                    name: record.employee.name,
                    email: record.employee.email,
                    totalMs: 0,
                    count: 0
                };
            }
            if (record.checkIn && record.checkOut) {
                summary[empId].totalMs += new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
            }
            summary[empId].count += 1;
        });

        return Object.values(summary).filter(emp =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [attendance, search]);

    const formatDuration = (ms: number) => {
        const hrs = Math.floor(ms / (1000 * 60 * 60));
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hrs}h ${mins}m`;
    };

    const formatToPKT = (dateStr: string) => {
        if (!dateStr) return "---";
        const date = new Date(dateStr);
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const pkt = new Date(utc + (3600000 * 5));
        return pkt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const filteredAttendance = useMemo(() => {
        const attendanceData = Array.isArray(attendance) ? attendance : [];
        const baseFiltered = attendanceData.filter((record: Attendance) =>
            record.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
            record.employee?.email?.toLowerCase().includes(search.toLowerCase())
        );

        // If viewing Today, we could inject Absences here or in a separate view
        // For now, let's ensure the list reflects what we have
        return baseFiltered;
    }, [attendance, search]);

    const employeesWithAbsences = useMemo(() => {
        const attendanceData = Array.isArray(attendance) ? attendance : [];
        const baseFiltered = attendanceData.filter((record: any) =>
            record.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
            record.employee?.email?.toLowerCase().includes(search.toLowerCase())
        );

        // Map existing attendance by employeeId for easy lookup
        const attendanceMap = new Map();
        attendanceData.forEach(rec => attendanceMap.set(rec.employeeId, rec));

        // Detect Absences: If viewing today (or a specific date), find employees with NO records
        const today = new Date();
        const isViewingToday = filters.day === today.getDate().toString() &&
            filters.month === (today.getMonth() + 1).toString() &&
            filters.year === today.getFullYear().toString();

        if (isViewingToday && employees.length > 0) {
            const absences: any[] = [];
            employees.forEach(emp => {
                if (!attendanceMap.has(emp.id) && emp.user?.role !== "ADMIN") {
                    // This employee hasn't clocked in today
                    absences.push({
                        id: `absent-${emp.id}`,
                        employeeId: emp.id,
                        checkIn: null,
                        checkOut: null,
                        status: "ABSENT",
                        employee: emp,
                        isAbsent: true
                    });
                }
            });

            // Merge and filter by search
            const merged = [...baseFiltered, ...absences.filter(a =>
                a.employee.name.toLowerCase().includes(search.toLowerCase()) ||
                a.employee.email.toLowerCase().includes(search.toLowerCase())
            )];
            return merged;
        }

        return baseFiltered;
    }, [attendance, employees, search, filters]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-32 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[10%] right-[-5%] w-[40%] h-[30%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-10 relative group">
                {/* Header Glow */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600/5 blur-[80px] -z-10 group-hover:bg-orange-600/10 transition-colors duration-1000" />

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group/title">
                        <div className="h-px w-8 bg-orange-500/50 group-hover/title:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Admin Command Center</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
                        Attendance <span className="text-orange-500 italic">Intelligence</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg max-w-xl tracking-tight">
                        <span className="h-2 w-2 rounded-full bg-orange-600 inline-block animate-pulse mr-3 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                        Global oversight of employee performance and regional activity metrics.
                    </p>
                </div>

                <div className="flex bg-zinc-950 p-1.5 rounded-3xl border border-white/5 shadow-2xl relative z-10">
                    <button
                        onClick={() => setViewMode("LIST")}
                        className={cn(
                            "flex items-center space-x-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn",
                            viewMode === "LIST"
                                ? "bg-orange-600 text-black shadow-lg shadow-orange-600/20"
                                : "text-zinc-500 hover:text-orange-500"
                        )}
                    >
                        <LayoutList className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Detailed Logs</span>
                        {viewMode === "LIST" && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />}
                    </button>
                    <button
                        onClick={() => setViewMode("SUMMARY")}
                        className={cn(
                            "flex items-center space-x-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn",
                            viewMode === "SUMMARY"
                                ? "bg-orange-600 text-black shadow-lg shadow-orange-600/20"
                                : "text-zinc-500 hover:text-orange-500"
                        )}
                    >
                        <PieChart className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Summary Report</span>
                        {viewMode === "SUMMARY" && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Filters Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-8 self-start">
                    <div className="glass-premium border border-white/5 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                        <div className="flex items-center space-x-3 mb-2">
                            <Filter className="h-4 w-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Attendance Filters</span>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Archive Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-5 text-xs font-black text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                            >
                                <option value="2026">CY-2026</option>
                                <option value="2025">CY-2025</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Select Month</label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-5 text-xs font-black text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Archive Day (Optional)</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={filters.day}
                                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-5 text-xs font-black text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all shadow-inner"
                                placeholder="FULL MONTH PERSPECTIVE"
                            />
                        </div>

                        <button
                            onClick={() => setFilters({ day: "", month: filters.month, year: filters.year })}
                            className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-orange-500 transition-colors border-t border-white/5 pt-6 mt-2"
                        >
                            Reset to Comprehensive View
                        </button>
                    </div>

                    <div className="glass-premium border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group hover:glow-orange transition-all duration-700">
                        <div className="relative z-10">
                            <Download className="h-8 w-8 text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <h4 className="text-xl font-black text-white tracking-tighter mb-2 italic">Data Retrieval</h4>
                            <p className="text-zinc-500 text-xs font-bold leading-relaxed mb-8">Export high-fidelity intelligence reports in obsidian-themed PDF/CSV formats.</p>
                            <button className="w-full py-4 bg-orange-600 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group/export">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/export:translate-x-[100%] transition-transform duration-700" />
                                Download Report
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-orange-600/5 rounded-full blur-3xl group-hover:bg-orange-600/10 transition-all" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="glass-premium border border-white/5 p-0 rounded-[3.5rem] overflow-hidden shadow-2xl relative group hover:glow-orange transition-all duration-1000">
                        <div className="absolute inset-0 bg-black/40 -z-10" />
                        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0c0c0c]/40">
                            <div className="flex items-center space-x-5">
                                <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center text-black shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                                    {viewMode === "LIST" ? <Clock className="h-6 w-6" /> : <Timer className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter italic">
                                        {viewMode === "LIST" ? "Daily Attendance Logs" : "Monthly Attendance Overview"}
                                    </h3>
                                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mt-1">
                                        {filters.day ? `${filters.day} ` : ""}{months[parseInt(filters.month) - 1]?.toUpperCase()} {filters.year} LOGS
                                    </p>
                                </div>
                            </div>
                            <div className="relative group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500 group-focus-within/search:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH EMPLOYEE NAME..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-12 pr-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 outline-none transition-all w-80 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {viewMode === "SUMMARY" ? (
                                <table className="w-full text-left">
                                    <thead className="bg-[#0c0c0c]/60 border-b border-white/5">
                                        <tr>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Employee</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">Sessions</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-right">Total Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={3} className="px-10 py-12"><div className="h-6 bg-orange-600/5 rounded-xl w-full animate-pulse" /></td>
                                                </tr>
                                            ))
                                        ) : totals.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-10 py-32 text-center text-zinc-600 italic font-black text-sm uppercase tracking-widest">No intelligence found for the selected temporal range.</td>
                                            </tr>
                                        ) : (
                                            totals.map((sum: any) => (
                                                <tr key={sum.email} className="hover:bg-orange-600/[0.02] transition-all group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="h-14 w-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:border-orange-500/30 group-hover:text-orange-500 transition-all duration-500 shadow-xl">
                                                                <User className="h-7 w-7" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xl font-black text-white tracking-tighter uppercase italic">{sum.name}</p>
                                                                <p className="text-xs text-zinc-500 font-bold tracking-tight">{sum.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-zinc-600 italic font-black text-sm uppercase tracking-widest">
                                                        <span className="px-6 py-2 rounded-xl bg-zinc-950 text-orange-500 border border-white/5 text-[10px] font-black tracking-[0.3em] shadow-inner">
                                                            {sum.count} SESSIONS
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <p className="text-4xl font-black text-orange-500 tracking-tighter italic">{formatDuration(sum.totalMs)}</p>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">TOTAL HOURS</p>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-[#0c0c0c]/60 border-b border-white/5">
                                        <tr>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Employee</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center whitespace-nowrap">Email</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">Check In</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">Check Out</th>
                                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={5} className="px-10 py-8"><div className="h-24 bg-orange-600/5 rounded-[2rem] w-full animate-pulse" /></td>
                                                </tr>
                                            ))
                                        ) : filteredAttendance.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-40 text-center">
                                                    <div className="max-w-xs mx-auto space-y-8 group/empty">
                                                        <div className="h-28 w-28 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner group-hover/empty:border-orange-500/20 transition-all duration-700">
                                                            <Calendar className="h-12 w-12 text-zinc-800 group-hover/empty:text-orange-600/40 transition-colors" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h4 className="text-white font-black uppercase tracking-[0.5em] text-sm">No Intel Found</h4>
                                                            <p className="text-zinc-600 font-bold tracking-tight">Adjust temporal filters to view historical regional records.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            employeesWithAbsences.map((record: any) => (
                                                <tr key={record.id} className={cn(
                                                    "hover:bg-orange-600/[0.02] transition-colors group",
                                                    record.isAbsent && "bg-orange-950/5 opacity-80"
                                                )}>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center space-x-6">
                                                            <div className={cn(
                                                                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all shadow-xl",
                                                                record.isAbsent
                                                                    ? "bg-zinc-950 border-white/5 text-zinc-800"
                                                                    : "bg-zinc-950 border-white/5 text-zinc-600 group-hover:border-orange-500/30 group-hover:text-orange-500"
                                                            )}>
                                                                <User className="h-7 w-7" />
                                                            </div>
                                                            <span className={cn("font-black tracking-tighter text-2xl uppercase italic", record.isAbsent ? "text-zinc-500" : "text-white")}>
                                                                {record.employee?.name || "ANONYMOUS NODE"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center justify-center space-x-3 text-zinc-500 font-bold tracking-tight">
                                                            <Mail className="h-3.5 w-3.5 text-orange-600/40" />
                                                            <span>{record.employee?.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-zinc-600 italic font-black text-sm uppercase tracking-widest">
                                                        <span className={cn("font-black tabular-nums tracking-widest", record.isAbsent ? "text-zinc-800 italic" : "text-white")}>
                                                            {record.checkIn ? formatToPKT(record.checkIn) : "∅ NO DATA"}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-center text-zinc-600 italic font-black text-sm uppercase tracking-widest">
                                                        <span className={cn("font-black tabular-nums tracking-widest", record.isAbsent ? "text-zinc-800 italic" : "text-white/60")}>
                                                            {record.checkOut ? formatToPKT(record.checkOut) : record.isAbsent ? "∅ NO DATA" : "---"}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <span className={cn(
                                                            "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] inline-block shadow-lg border",
                                                            record.isAbsent
                                                                ? "bg-zinc-950 text-zinc-700 border-white/5"
                                                                : record.isOnBreak
                                                                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                                    : record.checkOut
                                                                        ? "bg-zinc-950 text-zinc-400 border-white/5"
                                                                        : "bg-orange-600 text-black border-transparent animate-pulse shadow-orange-500/20"
                                                        )}>
                                                            {record.isAbsent ? "Absent" : record.isOnBreak ? "Recess" : record.checkOut ? "Concluded" : "Present"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
