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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Personalizing your workspace...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-6 max-w-md p-10 bg-white rounded-[3rem] border border-zinc-100 shadow-2xl">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Access Restricted</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-zinc-200"
                    >
                        Re-Authorize
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
                <div className="space-y-2">
                    <motion.div variants={item} className="flex items-center space-x-2 text-purple-600">
                        <Sparkles className="h-4 w-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Motivation Portal</span>
                    </motion.div>
                    <motion.h1 variants={item} className="text-5xl font-black tracking-tighter text-zinc-900">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{employee?.name?.split(" ")[0]}!</span>
                    </motion.h1>
                    <motion.p variants={item} className="text-zinc-500 font-bold text-lg max-w-xl">
                        Today is {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. Let's make it productive!
                    </motion.p>
                </div>

                <motion.div variants={item} className="hidden lg:flex items-center p-2 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50">
                    <div className="flex items-center space-x-4 px-6 py-2">
                        <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                            <Coffee className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Karachi Phase (PKT)</p>
                            <p className="text-sm font-black text-zinc-900 tracking-tighter">
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
                        "relative overflow-hidden rounded-[4rem] p-12 transition-all duration-700 shadow-2xl",
                        isClockedIn
                            ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20"
                            : "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white shadow-zinc-900/40"
                    )}>
                        {/* Decorative Glass Elements */}
                        <div className="absolute top-0 right-0 h-96 w-96 bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 bg-white/5 rounded-full blur-[80px] -ml-20 -mb-20" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                        <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]", isClockedIn ? "bg-white animate-pulse" : "bg-white/40")} />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Nexus Status: {isClockedIn ? "Active" : "Ready"}</span>
                                        {(employee?.shiftStart || employee?.shiftEnd) && (
                                            <>
                                                <div className="h-4 w-[1px] bg-white/20 mx-1" />
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3 opacity-50" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{employee.shiftStart || "??"} - {employee.shiftEnd || "??"} PKT</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-4xl font-black leading-tight">
                                        {isClockedIn ? "Your Focus Period is Active." : "Initiate Your Daily Mission."}
                                    </h2>
                                    <p className="text-white/70 font-medium">
                                        {isClockedIn
                                            ? `Shift initialized at ${new Date(latestAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                            : "Clock in to start tracking your performance and contributions."}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!isClockedIn ? (
                                        <button
                                            onClick={() => handleClockToggle("CLOCK_IN")}
                                            disabled={actionLoading}
                                            className="flex-1 px-10 py-6 rounded-3xl font-black text-lg transition-all flex items-center justify-center space-x-4 shadow-2xl hover:scale-[1.03] active:scale-[0.98] bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-purple-500/40"
                                        >
                                            {actionLoading ? (
                                                <div className="h-6 w-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="h-7 w-7 fill-current" />
                                                    <span>Start Shift</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                                            <button
                                                onClick={() => handleClockToggle(latestAttendance.isOnBreak ? "BREAK_END" : "BREAK_START")}
                                                disabled={actionLoading}
                                                className={cn(
                                                    "flex-1 px-8 py-5 rounded-3xl font-black text-base transition-all flex items-center justify-center space-x-3 shadow-xl hover:scale-[1.03] active:scale-[0.98]",
                                                    latestAttendance.isOnBreak
                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20"
                                                )}
                                            >
                                                {actionLoading ? (
                                                    <div className="h-5 w-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : latestAttendance.isOnBreak ? (
                                                    <>
                                                        <Coffee className="h-5 w-5" />
                                                        <span>End Break</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Coffee className="h-5 w-5" />
                                                        <span>Hit Break</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleClockToggle("CLOCK_OUT")}
                                                disabled={actionLoading}
                                                className="flex-1 px-8 py-5 rounded-3xl font-black text-base transition-all flex items-center justify-center space-x-3 shadow-xl hover:scale-[1.03] active:scale-[0.98] bg-white text-emerald-700 hover:bg-zinc-100"
                                            >
                                                {actionLoading ? (
                                                    <div className="h-5 w-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <XCircle className="h-5 w-5" />
                                                        <span>End Shift</span>
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
                                            className="stroke-white/10 fill-none stroke-[8px]"
                                        />
                                        <motion.circle
                                            cx="50%" cy="50%" r="45%"
                                            className={cn("fill-none stroke-[10px] stroke-linecap-round transition-all", isClockedIn ? "stroke-white" : "stroke-white/20")}
                                            strokeDasharray="100 100"
                                            strokeDashoffset={isClockedIn ? 0 : 100}
                                            initial={{ strokeDashoffset: 100 }}
                                            animate={{ strokeDashoffset: isClockedIn ? 0 : 100 }}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Today's Yield", value: stats.today, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", progress: 75 },
                            { label: "Weekly Velocity", value: stats.weekly, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", progress: 60 },
                            { label: "Monthly Output", value: stats.monthly, icon: Target, color: "text-orange-600", bg: "bg-orange-50", progress: 85 }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon className="h-20 w-20" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-4xl font-black text-zinc-900 tracking-tighter">{stat.value}</span>
                                            <span className="text-xs font-bold text-zinc-400">HRS</span>
                                        </div>
                                        <div className="mt-4 h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.progress}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                                                className={cn("h-full rounded-full bg-gradient-to-r",
                                                    i === 0 ? "from-blue-500 to-indigo-500" :
                                                        i === 1 ? "from-purple-500 to-indigo-500" :
                                                            "from-orange-500 to-amber-500"
                                                )}
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
                    <div className="bg-white rounded-[3.5rem] p-10 border border-zinc-100 shadow-2xl shadow-zinc-200/60 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
                                    <History className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Focus Chronicle</h3>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {!employee?.attendance || employee.attendance.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100 border-dashed">
                                        <Clock className="h-8 w-8 text-zinc-200" />
                                    </div>
                                    <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">No chronicle data yet.</p>
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
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-100 group-last:bg-transparent" />
                                        <div className={cn(
                                            "absolute left-[-4px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-150 duration-500",
                                            record.checkOut ? "bg-zinc-300" : "bg-purple-600 animate-pulse"
                                        )} />

                                        <div className="p-5 rounded-3xl bg-zinc-50 border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest leading-none">
                                                    {new Date(record.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border",
                                                    record.checkOut ? "bg-zinc-100 text-zinc-500 border-zinc-200" : "bg-purple-50 text-purple-600 border-purple-100"
                                                )}>
                                                    {record.checkOut ? "Archived" : "Active Now"}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end mt-4">
                                                <div className="flex items-center space-x-2 text-zinc-500 font-bold text-xs uppercase tracking-tighter">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                    {record.checkOut && (
                                                        <>
                                                            <ArrowRight className="h-2 w-2" />
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

                        <button className="w-full mt-10 py-5 border-2 border-zinc-100 rounded-[2rem] text-xs font-black text-zinc-400 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center justify-center space-x-3 group bg-white">
                            <span>Expand Chronicle History</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

