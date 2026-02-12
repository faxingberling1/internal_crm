"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    Zap,
    Coffee,
    Timer,
    History,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
    const [employee, setEmployee] = useState<any>(null);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            // Gets the logged-in employee profile
            const res = await fetch("/api/employee/me");
            const data = await res.json();
            if (res.ok) {
                setEmployee(data);
                // Also fetch full attendance history for this employee
                fetchAttendanceHistory();
            } else {
                setError(data.error || "Failed to load identity profile");
            }
        } catch (err) {
            setError("Connection failed. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const res = await fetch("/api/attendance");
            const data = await res.json();
            if (res.ok) {
                setAttendance(data);
            }
        } catch (error) {
            console.error("Fetch history error:", error);
        }
    };

    const handleClockToggle = async (type: "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END") => {
        if (!employee) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: employee.id,
                    type,
                    notes: `Logged via Personal Attendance Monitor`
                }),
            });

            const data = await res.json();
            if (res.ok) {
                // Refresh data to sync UI
                fetchEmployeeData();
            } else {
                alert(data.error || "Action could not be processed");
            }
        } catch (err) {
            alert("Network error. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const formatToPKT = (dateStr: string) => {
        if (!dateStr) return "---";
        const date = new Date(dateStr);
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const pkt = new Date(utc + (3600000 * 5));
        return pkt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-500/10" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Mission History...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-zinc-100 max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Identity Desync</h2>
                    <p className="text-zinc-500 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;
    const isOnBreak = latestAttendance?.isOnBreak;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Identity Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-purple-600">
                        <User className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] font-mono">Personal Mission Monitor</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                        My Attendance
                    </h1>
                    <p className="text-zinc-500 font-bold opacity-80 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                        Live Karachi Protocol (PKT)
                    </p>
                </div>

                <div className="bg-zinc-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center space-x-6 min-w-[300px]">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Status</p>
                        <p className="text-xl font-black tracking-tight flex items-center space-x-2">
                            {isClockedIn ? (
                                <span className="text-emerald-400">{isOnBreak ? "On Break" : "In Mission"}</span>
                            ) : (
                                <span className="text-zinc-500">Standby</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Control Hub */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-zinc-100 relative overflow-hidden group transition-all hover:shadow-purple-500/5">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-zinc-50 rounded-full -mr-20 -mt-20 group-hover:bg-purple-50 transition-colors duration-500" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Shift Controls</h3>
                                <Zap className="h-6 w-6 text-purple-600 animate-pulse" />
                            </div>

                            <div className="space-y-4">
                                {!isClockedIn ? (
                                    <button
                                        onClick={() => handleClockToggle("CLOCK_IN")}
                                        disabled={actionLoading}
                                        className="w-full bg-zinc-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-4 group active:scale-[0.98]"
                                    >
                                        <Zap className="h-6 w-6 fill-current group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-widest text-sm">Start Shift</span>
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                        <button
                                            onClick={() => handleClockToggle(isOnBreak ? "BREAK_END" : "BREAK_START")}
                                            disabled={actionLoading}
                                            className={cn(
                                                "w-full font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-4 active:scale-[0.98]",
                                                isOnBreak
                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                                            )}
                                        >
                                            <Coffee className="h-6 w-6" />
                                            <span className="uppercase tracking-widest text-sm">
                                                {isOnBreak ? "End Break" : "Start Break"}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleClockToggle("CLOCK_OUT")}
                                            disabled={actionLoading}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-4 active:scale-[0.98] shadow-red-500/10"
                                        >
                                            <XCircle className="h-6 w-6" />
                                            <span className="uppercase tracking-widest text-sm">End Shift</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-zinc-100">
                                <div className="flex items-center space-x-2 text-zinc-400">
                                    <Timer className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Identity Bounded: {employee.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                        <Sparkles className="absolute top-4 right-4 h-5 w-5 opacity-20 group-hover:rotate-12 transition-transform duration-500" />
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Operational Insight</p>
                        <h4 className="text-lg font-bold leading-tight">Your shift pattern is synchronized with the Karachi Regional Protocol.</h4>
                    </div>
                </div>

                {/* History Chronicle */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-zinc-100 min-h-[500px]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center">
                                <History className="mr-3 h-6 w-6 text-blue-600" />
                                Focus Chronicle
                            </h3>
                            <button
                                onClick={fetchEmployeeData}
                                className="text-[10px] font-black text-zinc-400 hover:text-purple-600 uppercase tracking-widest transition-colors"
                            >
                                Refresh Logs
                            </button>
                        </div>

                        <div className="space-y-4">
                            {attendance.length === 0 ? (
                                <div className="py-24 text-center">
                                    <Calendar className="h-16 w-16 text-zinc-100 mx-auto mb-6" />
                                    <h4 className="text-zinc-400 font-black uppercase tracking-widest text-xs">No Records Found</h4>
                                    <p className="text-zinc-500 text-sm mt-2">Begin your first shift to populate the chronicle.</p>
                                </div>
                            ) : (
                                attendance.map((record: any) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-6 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-purple-200 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center space-x-5">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                record.checkOut
                                                    ? "bg-zinc-200/50 text-zinc-400"
                                                    : "bg-purple-600 text-white shadow-lg shadow-purple-500/20 animate-pulse"
                                            )}>
                                                {record.checkOut ? <CheckCircle2 className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-base font-black text-zinc-900">
                                                        {new Date(record.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    {record.status === "ABSENT" && (
                                                        <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Absent</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-zinc-500 tabular-nums">
                                                    {formatToPKT(record.checkIn)}
                                                    {record.checkOut ? ` → ${formatToPKT(record.checkOut)}` : " → Active"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Session Integrity</p>
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tighter px-3 py-1 rounded-full",
                                                record.checkOut
                                                    ? "bg-zinc-200 text-zinc-600"
                                                    : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {record.checkOut ? "Finalized" : "In Progress"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}
