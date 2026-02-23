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
                    notes: `Updated via dashboard`
                }),
            });

            const data = await res.json();
            if (res.ok) {
                // Refresh data to sync UI
                fetchEmployeeData();
            } else {
                setError(data.error || "Action could not be processed");
                // Auto-clear error after 5 seconds
                setTimeout(() => setError(""), 5000);
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setTimeout(() => setError(""), 5000);
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
                <div className="flex flex-col items-center space-y-6">
                    <div className="h-20 w-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]" />
                    <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Syncing Mission History...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-16 glass-premium rounded-[3.5rem] border border-white/5 max-w-md hover:glow-orange transition-all duration-700">
                    <AlertCircle className="h-16 w-16 text-orange-600 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Identity Desync</h2>
                    <p className="text-zinc-500 mt-4 font-bold tracking-tight">{error}</p>
                    <button onClick={fetchEmployeeData} className="mt-10 px-8 py-4 bg-orange-600 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all">
                        Reconnect System
                    </button>
                </div>
            </div>
        );
    }

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;
    const isOnBreak = latestAttendance?.isOnBreak;

    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
            {/* Header Identity Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10 relative overflow-hidden group">
                {/* Header Glow */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600/5 blur-[80px] -z-10 group-hover:bg-orange-600/10 transition-colors duration-1000" />

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group/title">
                        <div className="h-px w-8 bg-orange-500/50 group-hover/title:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Attendance Hub</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
                        My <span className="text-orange-500">Attendance</span>
                    </h1>
                    <p className="text-zinc-500 font-bold flex items-center tracking-tight text-lg">
                        <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse mr-3 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                        Status <span className="text-orange-500/80 mx-2">//</span> Karachi Branch
                    </p>
                </div>

                <div className="glass-premium p-8 rounded-[2.5rem] flex items-center space-x-8 min-w-[350px] border border-white/5 hover:glow-orange transition-all duration-700">
                    <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]">
                        <Clock className="h-8 w-8 text-black" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">Active Status</p>
                        <p className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            {isClockedIn ? (
                                <span className="text-orange-500">{isOnBreak ? "On Break" : "Present"}</span>
                            ) : (
                                <span className="text-zinc-700">Standby</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Control Hub */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-premium p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group transition-all hover:glow-orange duration-700">
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 h-40 w-40 bg-zinc-900/40 rounded-full -mr-20 -mt-20 group-hover:bg-orange-500/5 transition-colors duration-700" />

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white tracking-tighter italic">Shift Controls</h3>
                                <Zap className="h-6 w-6 text-orange-600 animate-pulse" />
                            </div>

                            <div className="space-y-6">
                                {!isClockedIn ? (
                                    <button
                                        onClick={() => handleClockToggle("CLOCK_IN")}
                                        disabled={actionLoading}
                                        className="w-full bg-orange-600 hover:bg-orange-500 text-black font-black py-6 rounded-[1.75rem] shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)] transition-all flex items-center justify-center space-x-4 group active:scale-[0.98] overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        <Zap className="h-7 w-7 fill-current group-hover:scale-110 transition-transform" />
                                        <span className="uppercase tracking-[0.3em] font-black text-xs">Start Shift</span>
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-6">
                                        <button
                                            onClick={() => handleClockToggle(isOnBreak ? "BREAK_END" : "BREAK_START")}
                                            disabled={actionLoading}
                                            className={cn(
                                                "w-full font-black py-6 rounded-[1.75rem] transition-all flex items-center justify-center space-x-4 active:scale-[0.98] border shadow-xl relative overflow-hidden group",
                                                isOnBreak
                                                    ? "bg-zinc-950 text-orange-500 border-orange-500/20 hover:bg-orange-500/10"
                                                    : "bg-zinc-950/40 text-zinc-400 border-white/5 hover:text-orange-500 hover:border-orange-500/20 hover:bg-zinc-900/60"
                                            )}
                                        >
                                            <Coffee className="h-7 w-7" />
                                            <span className="uppercase tracking-[0.3em] font-black text-xs">
                                                {isOnBreak ? "End Break" : "Start Break"}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleClockToggle("CLOCK_OUT")}
                                            disabled={actionLoading}
                                            className="w-full bg-zinc-950 border border-red-900/30 hover:bg-red-950/20 text-red-500 font-black py-6 rounded-[1.75rem] transition-all flex items-center justify-center space-x-4 active:scale-[0.98] group"
                                        >
                                            <XCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
                                            <span className="uppercase tracking-[0.3em] font-black text-xs">Terminate Shift</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-4">
                                <div className="flex items-center space-x-3 text-zinc-700">
                                    <Timer className="h-4 w-4" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.5em]">Identity Bounded: {employee.email}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-zinc-800">
                                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Version: Obsidian-X-2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0A0A0A] to-black p-10 rounded-[3rem] text-white border border-white/5 shadow-2xl relative overflow-hidden group hover:border-orange-500/20 transition-all duration-700">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px] rounded-full group-hover:bg-orange-600/10 transition-colors" />
                        <Sparkles className="absolute top-6 right-6 h-6 w-6 text-orange-600/20 group-hover:rotate-12 group-hover:text-orange-600/40 transition-all duration-700" />
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mb-4">Operational Insight</p>
                        <h4 className="text-xl font-black leading-tight tracking-tighter text-zinc-300">
                            Your shift pattern is synchronized with the <span className="text-white italic">Karachi Regional Protocol.</span> Stay focused.
                        </h4>
                    </div>
                </div>

                {/* History Chronicle */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="glass-premium p-10 rounded-[4rem] border border-white/5 min-h-[600px] hover:glow-orange transition-all duration-700 overflow-hidden relative isolate">
                        {/* Background mesh effect */}
                        <div className="absolute inset-0 bg-zinc-950/20 -z-10" />

                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-black text-white tracking-tighter italic flex items-center">
                                <History className="mr-4 h-7 w-7 text-orange-600" />
                                Focus Chronicle
                            </h3>
                            <button
                                onClick={fetchEmployeeData}
                                className="text-[9px] font-black text-zinc-600 hover:text-orange-500 uppercase tracking-[0.4em] transition-all bg-zinc-900/40 px-6 py-2.5 rounded-xl border border-white/5"
                            >
                                Refresh Page
                            </button>
                        </div>

                        <div className="space-y-6">
                            {attendance.length === 0 ? (
                                <div className="py-32 text-center">
                                    <div className="p-10 bg-zinc-950 rounded-full border border-white/5 inline-block mb-8 shadow-2xl">
                                        <Calendar className="h-16 w-16 text-zinc-800" />
                                    </div>
                                    <h4 className="text-white font-black uppercase tracking-[0.6em] text-[10px]">No Records Detected</h4>
                                    <p className="text-zinc-600 font-bold max-w-xs mx-auto mt-4 leading-relaxed tracking-tight">
                                        The chronicle is currently empty. Initiate your first shift to begin session logging.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {attendance.map((record: any) => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between p-8 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-orange-500/20 hover:bg-orange-500/[0.02] transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-700 border",
                                                    record.checkOut
                                                        ? "bg-zinc-950 border-white/5 text-zinc-700"
                                                        : "bg-orange-600 border-orange-500 text-black shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)] animate-pulse"
                                                )}>
                                                    {record.checkOut ? <CheckCircle2 className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3">
                                                        <p className="text-lg font-black text-white tracking-tighter">
                                                            {new Date(record.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        {record.status === "ABSENT" && (
                                                            <span className="text-[8px] font-black bg-red-950/40 text-red-500 border border-red-900/30 px-3 py-1 rounded-full uppercase tracking-widest">Desync</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-black text-zinc-600 tracking-widest mt-1">
                                                        {formatToPKT(record.checkIn)}
                                                        {record.checkOut ? <span className="mx-3 text-zinc-800">→</span> : <span className="mx-3 text-orange-600">→</span>}
                                                        {record.checkOut ? formatToPKT(record.checkOut) : <span className="text-orange-500 animate-pulse">ACTIVE MISSION</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-2">Integrity Status</p>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl border transition-colors",
                                                    record.checkOut
                                                        ? "bg-zinc-950 text-zinc-500 border-white/5"
                                                        : "bg-orange-600/10 text-orange-500 border-orange-500/30"
                                                )}>
                                                    {record.checkOut ? "Finalized" : "Operational"}
                                                </span>
                                            </div>

                                            {/* Hover decorative line */}
                                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-orange-600 group-hover:w-full transition-all duration-1000" />
                                        </div>
                                    ))}
                                </div>
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
