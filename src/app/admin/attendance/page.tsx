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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 flex items-center space-x-3">
                        <UserCheck className="h-10 w-10 text-blue-600" />
                        <span>Attendance Intelligence</span>
                    </h2>
                    <p className="text-zinc-500 mt-2 font-medium">Global oversight of employee activity and performance metrics.</p>
                </div>

                <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 shadow-inner">
                    <button
                        onClick={() => setViewMode("LIST")}
                        className={cn(
                            "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                            viewMode === "LIST"
                                ? "bg-white text-zinc-900 shadow-xl"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <LayoutList className="h-4 w-4" />
                        <span>Detailed Logs</span>
                    </button>
                    <button
                        onClick={() => setViewMode("SUMMARY")}
                        className={cn(
                            "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all",
                            viewMode === "SUMMARY"
                                ? "bg-white text-zinc-900 shadow-xl"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <PieChart className="h-4 w-4" />
                        <span>Summary Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="space-y-6">
                    <div className="premium-card bg-white border border-zinc-100 p-6 space-y-4 shadow-xl">
                        <div className="flex items-center space-x-2 mb-2">
                            <Filter className="h-4 w-4 text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Time Range Filters</span>
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
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Day (Optional)</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={filters.day}
                                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="Full Month"
                            />
                        </div>

                        <button
                            onClick={() => setFilters({ day: "", month: filters.month, year: filters.year })}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                        >
                            View Entire Month
                        </button>
                    </div>

                    <div className="premium-card bg-zinc-900 border-none p-6 text-white overflow-hidden group shadow-2xl">
                        <div className="relative z-10">
                            <Download className="h-8 w-8 text-blue-400 mb-4" />
                            <h4 className="text-lg font-black tracking-tight mb-1">Export Data</h4>
                            <p className="text-zinc-400 text-xs mb-6">Generate attendance reports in CSV/PDF format.</p>
                            <button className="w-full py-3 bg-white text-zinc-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all group-hover:scale-[1.02]">Initial Download</button>
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
                                    {viewMode === "LIST" ? <Clock className="h-5 w-5" /> : <Timer className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                                        {viewMode === "LIST" ? "Daily Attendance Logs" : "Monthly Performance Summary"}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                        {filters.day ? `${filters.day} ` : ""}{months[parseInt(filters.month) - 1]} {filters.year}
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all w-64 font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {viewMode === "SUMMARY" ? (
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-50 border-b border-zinc-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Employee</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Total Shifts</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Total Worked Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={3} className="px-8 py-8"><div className="h-4 bg-zinc-100 rounded w-full" /></td>
                                                </tr>
                                            ))
                                        ) : totals.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-20 text-center text-zinc-400 italic font-medium">No performance data found for this selection.</td>
                                            </tr>
                                        ) : (
                                            totals.map((sum: any) => (
                                                <tr key={sum.email} className="hover:bg-zinc-50 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                                                                <User className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-zinc-900 tracking-tight">{sum.name}</p>
                                                                <p className="text-xs text-zinc-500 font-bold">{sum.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                            {sum.count} Sessions
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className="text-2xl font-black text-purple-600 tracking-tighter">{formatDuration(sum.totalMs)}</p>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Selected Period</p>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : (
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
                                                    <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-zinc-100 rounded-lg w-full" /></td>
                                                </tr>
                                            ))
                                        ) : filteredAttendance.length === 0 ? (
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
                                            employeesWithAbsences.map((record: any) => (
                                                <tr key={record.id} className={cn(
                                                    "hover:bg-zinc-50 transition-colors group",
                                                    record.isAbsent && "bg-red-50/30 opacity-80"
                                                )}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                                                                record.isAbsent
                                                                    ? "bg-red-50 border-red-100 text-red-400"
                                                                    : "bg-gradient-to-br from-zinc-100 to-zinc-200 border-zinc-200 group-hover:from-blue-50 group-hover:to-blue-100"
                                                            )}>
                                                                <User className={cn("h-5 w-5", !record.isAbsent && "text-zinc-500 group-hover:text-blue-600")} />
                                                            </div>
                                                            <span className={cn("font-black tracking-tight", record.isAbsent ? "text-red-900" : "text-zinc-900")}>
                                                                {record.employee?.name || "Anonymous"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-2 text-zinc-500 font-medium">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{record.employee?.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={cn("font-bold tabular-nums", record.isAbsent ? "text-red-300 italic" : "text-zinc-700")}>
                                                            {record.checkIn ? formatToPKT(record.checkIn) : "Not Reported"}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={cn("font-bold tabular-nums", record.isAbsent ? "text-red-300 italic" : "text-zinc-700")}>
                                                            {record.checkOut ? formatToPKT(record.checkOut) : record.isAbsent ? "Not Reported" : "---"}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                            record.isAbsent
                                                                ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                                                                : record.isOnBreak
                                                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                                    : record.checkOut
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 animate-pulse"
                                                        )}>
                                                            {record.isAbsent ? "Absent" : record.isOnBreak ? "On Break" : record.checkOut ? "Shift End" : "Active"}
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
