"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    LayoutDashboard,
    Timer,
    History,
    AlertCircle,
    ArrowRight,
    Zap,
    TrendingUp,
    Target,
    Coffee,
    Plus,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<any>(null);
    const [stats, setStats] = useState({ today: "0.0", weekly: "0.0", monthly: "0.0" });
    const [duration, setDuration] = useState("00:00:00");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            // Synchronize with Karachi Time (PKT: UTC+5)
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const pkt = new Date(utc + (3600000 * 5));
            setCurrentTime(pkt);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchEmployeeData();
        fetchStatsData();
    }, []);

    useEffect(() => {
        const latestAttendance = employee?.attendance?.[0];
        const isClockedIn = latestAttendance && !latestAttendance.checkOut;

        if (isClockedIn && latestAttendance.checkIn) {
            const interval = setInterval(() => {
                const start = new Date(latestAttendance.checkIn).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);

                setDuration(
                    `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                );
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setDuration("00:00:00");
        }
    }, [employee]);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/employee/me");
            const data = await res.json();
            if (res.ok) {
                setEmployee(data);
            } else {
                setError(data.error || "Failed to load dashboard data");
            }
        } catch (err) {
            setError("Something went wrong. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatsData = async () => {
        try {
            const res = await fetch("/api/attendance/stats");
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch stats");
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
                    notes: `Clocked ${type === "CLOCK_IN" ? "in" : "out"} from premium motivation portal`
                }),
            });

            const data = await res.json();
            if (res.ok) {
                fetchEmployeeData();
                fetchStatsData();
            } else {
                alert(data.error || "Action failed");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
                    <p className="text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Personalizing Your Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#050505]">
                <div className="text-center space-y-8 max-w-md p-12 glass-premium rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-3">Access Locked</h2>
                        <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest leading-relaxed">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-orange-600 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/10"
                    >
                        Re-Authorize Node
                    </button>
                </div>
            </div>
        );
    }

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-10 pb-10"
        >
            {/* Motivation Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <motion.div variants={item} className="flex items-center space-x-2 text-orange-600">
                        <Sparkles className="h-4 w-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Motivation Portal</span>
                    </motion.div>
                    <motion.h1 variants={item} className="text-6xl font-black tracking-tighter text-white uppercase">
                        {getGreeting()}, <span className="text-orange-600">{employee?.name?.split(" ")[0]}</span>
                    </motion.h1>
                    <motion.p variants={item} className="text-zinc-600 font-bold text-sm uppercase tracking-[0.2em]">
                        Today is {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. System Efficiency: Optmized.
                    </motion.p>
                </div>

                <motion.div variants={item} className="hidden lg:flex items-center p-3 glass-premium rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center space-x-5 px-8 py-3">
                        <div className="h-12 w-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                            <Coffee className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Temporal Phase (PKT)</p>
                            <p className="text-lg font-black text-white tracking-widest">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Shift Nexus Hub */}
                <motion.div variants={item} className="lg:col-span-8 space-y-10">
                    <div className={cn(
                        "relative overflow-hidden rounded-[4rem] p-16 transition-all duration-700 shadow-2xl border border-white/5",
                        isClockedIn
                            ? "bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-orange-950/20 shadow-orange-500/5 hover:glow-orange"
                            : "bg-gradient-to-br from-[#080808] via-[#050505] to-black shadow-black hover:glow-orange"
                    )}>
                        {/* Decorative Glass Elements */}
                        <div className="absolute top-0 right-0 h-96 w-96 bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 bg-white/5 rounded-full blur-[80px] -ml-20 -mb-20" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 bg-black border border-white/10 w-fit px-5 py-2.5 rounded-2xl shadow-xl">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", isClockedIn ? "bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(255,122,0,0.8)]" : "bg-zinc-800")} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Nexus Status: <span className={isClockedIn ? "text-orange-500" : "text-zinc-700"}>{isClockedIn ? "Active" : "Ready"}</span></span>
                                        {(employee?.shiftStart || employee?.shiftEnd) && (
                                            <>
                                                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-3 w-3 text-orange-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{employee.shiftStart || "??"} - {employee.shiftEnd || "??"} PKT</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-5xl font-black leading-tight uppercase tracking-tight text-white">
                                        {isClockedIn ? "Currently on duty." : "Start your shift."}
                                    </h2>
                                    <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                                        {isClockedIn
                                            ? `Shift started at ${new Date(latestAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                            : "Authorize shift initialization to synchronize with team schedules."}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!isClockedIn ? (
                                        <button
                                            onClick={() => handleClockToggle("CLOCK_IN")}
                                            disabled={actionLoading}
                                            className="flex-1 px-12 py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-5 shadow-[0_0_50px_-10px_rgba(255,122,0,0.5)] hover:scale-[1.02] active:scale-[0.98] bg-orange-600 text-black hover:bg-orange-500"
                                        >
                                            {actionLoading ? (
                                                <div className="h-6 w-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="h-7 w-7" />
                                                    <span>Start Session</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                                            <button
                                                onClick={() => handleClockToggle(latestAttendance.isOnBreak ? "BREAK_END" : "BREAK_START")}
                                                disabled={actionLoading}
                                                className={cn(
                                                    "flex-1 px-8 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-4 shadow-xl hover:scale-[1.03] active:scale-[0.98] border border-white/5",
                                                    latestAttendance.isOnBreak
                                                        ? "bg-orange-600 text-black hover:bg-orange-500 shadow-orange-500/20"
                                                        : "bg-black/40 text-orange-500 hover:bg-orange-600/10"
                                                )}
                                            >
                                                {actionLoading ? (
                                                    <div className="h-5 w-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : latestAttendance.isOnBreak ? (
                                                    <>
                                                        <Plus className="h-5 w-5 rotate-45" />
                                                        <span>Resume Session</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Coffee className="h-5 w-5" />
                                                        <span>Take Break</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleClockToggle("CLOCK_OUT")}
                                                disabled={actionLoading}
                                                className="flex-1 px-8 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-4 shadow-xl hover:scale-[1.03] active:scale-[0.98] bg-red-600 text-white hover:bg-red-500 shadow-red-500/10"
                                            >
                                                {actionLoading ? (
                                                    <div className="h-5 w-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <XCircle className="h-5 w-5" />
                                                        <span>Deauthorize Presence</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="relative h-64 w-64 md:h-80 md:w-80 group">
                                    {/* Circular Progress Visual */}
                                    <svg className="h-full w-full -rotate-90">
                                        <circle
                                            cx="50%" cy="50%" r="45%"
                                            className="stroke-orange-500/5 fill-none stroke-[2px]"
                                        />
                                        <motion.circle
                                            cx="50%" cy="50%" r="45%"
                                            className={cn("fill-none stroke-[6px] stroke-linecap-round transition-all shadow-[0_0_20px_rgba(255,122,0,0.4)]", isClockedIn ? "stroke-orange-600" : "stroke-white/5")}
                                            strokeDasharray="100 100"
                                            strokeDashoffset={isClockedIn ? 20 : 100}
                                            initial={{ strokeDashoffset: 100 }}
                                            animate={{ strokeDashoffset: isClockedIn ? 20 : 100 }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Elapsed Time</p>
                                        <p className="text-5xl md:text-6xl font-black tabular-nums tracking-tighter transition-all group-hover:scale-110 duration-500">
                                            {duration}
                                        </p>
                                        <div className="mt-4 flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                            <Timer className="h-3 w-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Productivity Pulse Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "Today's Yield", value: stats.today, icon: Clock, color: "text-orange-500", progress: 75 },
                            { label: "Weekly Velocity", value: stats.weekly, icon: TrendingUp, color: "text-orange-600", progress: 60 },
                            { label: "Monthly Output", value: stats.monthly, icon: Target, color: "text-orange-400", progress: 85 }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="glass-premium p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:glow-orange transition-all"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <stat.icon className="h-24 w-24 text-orange-600" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center space-x-5">
                                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center bg-black border border-white/5 shadow-lg shadow-orange-500/5 group-hover:border-orange-500/20 transition-all", stat.color)}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">{stat.label}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-baseline space-x-3">
                                            <span className="text-5xl font-black text-white tracking-widest">{stat.value}</span>
                                            <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">HRS</span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.progress}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                                                className={cn("h-full rounded-full bg-orange-600 shadow-[0_0_15px_rgba(255,122,0,0.4)]")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Side Chronicle Activity */}
                <motion.div variants={item} className="lg:col-span-4 space-y-8">
                    <div className="glass-premium rounded-[3.5rem] p-10 border border-white/5 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-lg border border-white/5 group-hover:border-orange-500/20 transition-all">
                                    <History className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-widest uppercase">Focus Chronicle</h3>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {!employee?.attendance || employee.attendance.length === 0 ? (
                                <div className="py-24 text-center space-y-6">
                                    <div className="h-20 w-20 bg-zinc-950 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                                        <Clock className="h-8 w-8 text-zinc-800" />
                                    </div>
                                    <p className="text-zinc-700 font-black uppercase tracking-[0.3em] text-[10px]">No archives identified.</p>
                                </div>
                            ) : (
                                employee.attendance.slice(0, 5).map((record: any, idx: number) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative pl-8 group"
                                    >
                                        {/* Timeline Line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 group-last:bg-transparent" />
                                        <div className={cn(
                                            "absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full border border-black shadow-[0_0_10px_currentColor] transition-transform group-hover:scale-150 duration-500 z-10",
                                            record.checkOut ? "bg-zinc-800 text-zinc-800" : "bg-orange-600 text-orange-500 animate-pulse"
                                        )} />

                                        <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-orange-500/20 hover:bg-orange-600/[0.02] hover:glow-orange transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                                                    {new Date(record.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                    record.checkOut ? "bg-zinc-950 text-zinc-700 border-white/5" : "bg-orange-600/10 text-orange-500 border-orange-500/20 shadow-lg"
                                                )}>
                                                    {record.checkOut ? "Archived" : "Active Node"}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end mt-5">
                                                <div className="flex items-center space-x-3 text-zinc-600 font-bold text-[9px] uppercase tracking-widest">
                                                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                                                    <span>{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                    {record.checkOut && (
                                                        <>
                                                            <ArrowRight className="h-2.5 w-2.5 text-zinc-800" />
                                                            <span>{new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-10 py-6 border border-white/5 rounded-[2.5rem] text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] hover:text-orange-500 hover:border-orange-500/20 transition-all flex items-center justify-center space-x-4 group bg-black shadow-xl">
                            <span>Execute Archive Expansion</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

