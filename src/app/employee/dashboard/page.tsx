"use client";

import { useState, useEffect } from "react";
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
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<any>(null);
    const [stats, setStats] = useState({ today: "0.0", weekly: "0.0", monthly: "0.0" });
    const [duration, setDuration] = useState("00:00:00");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleClockToggle = async (type: "CLOCK_IN" | "CLOCK_OUT") => {
        if (!employee) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: employee.id,
                    type,
                    notes: `Clocked ${type === "CLOCK_IN" ? "in" : "out"} from personal dashboard`
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
                    <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 font-medium animate-pulse">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-black text-zinc-900">Access Restricted</h2>
                    <p className="text-zinc-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-purple-600 mb-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Employee Portal</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900">
                        Hello, {employee?.name?.split(" ")[0]}!
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Here's your shift summary for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.
                    </p>
                </div>

                <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-2xl border border-zinc-100 shadow-sm">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Status & Controls */}
                <div className="lg:col-span-2 space-y-8">
                    <div className={cn(
                        "premium-card relative overflow-hidden p-8 border-none shadow-2xl transition-all duration-500",
                        isClockedIn
                            ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white"
                            : "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white"
                    )}>
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                                    <div className={cn("h-2 w-2 rounded-full", isClockedIn ? "bg-green-300 animate-pulse" : "bg-zinc-400")} />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {isClockedIn ? "Currently on Shift" : "Off Duty"}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black">
                                    {isClockedIn ? "You are clocked in." : "Ready to start your shift?"}
                                </h2>
                                {isClockedIn && latestAttendance && (
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-green-50 font-medium flex items-center">
                                            <Timer className="h-4 w-4 mr-2" />
                                            Shift started at {new Date(latestAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div className="flex items-center space-x-2 bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                            <Clock className="h-3 w-3 text-white" />
                                            <span className="text-xl font-black tabular-nums tracking-tighter">{duration}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleClockToggle(isClockedIn ? "CLOCK_OUT" : "CLOCK_IN")}
                                disabled={actionLoading}
                                className={cn(
                                    "px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center space-x-3 shadow-xl hover:scale-105 active:scale-95",
                                    isClockedIn
                                        ? "bg-white text-green-700 hover:bg-zinc-100"
                                        : "bg-purple-600 text-white hover:bg-purple-700"
                                )}
                            >
                                {isClockedIn ? (
                                    <>
                                        <XCircle className="h-6 w-6" />
                                        <span>{actionLoading ? "Processing..." : "Clock Out Now"}</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-6 w-6" />
                                        <span>{actionLoading ? "Processing..." : "Clock In Now"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Today</span>
                            </div>
                            <p className="text-2xl font-black text-zinc-900">{stats.today} <span className="text-xs font-medium text-zinc-400">Hrs</span></p>
                        </div>

                        <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Timer className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">This Week</span>
                            </div>
                            <p className="text-2xl font-black text-zinc-900">{stats.weekly} <span className="text-xs font-medium text-zinc-400">Hrs</span></p>
                        </div>

                        <div className="premium-card bg-white p-6 border border-zinc-100 shadow-xl">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <History className="h-5 w-5 text-orange-600" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">This Month</span>
                            </div>
                            <p className="text-2xl font-black text-zinc-900">{stats.monthly} <span className="text-xs font-medium text-zinc-400">Hrs</span></p>
                        </div>
                    </div>
                </div>

                {/* Side History */}
                <div className="space-y-6">
                    <div className="premium-card bg-white p-8 border border-zinc-100 shadow-2xl h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-zinc-900 flex items-center">
                                <History className="mr-2 h-5 w-5 text-purple-600" />
                                Recent Logs
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {!employee?.attendance || employee.attendance.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No activity recorded yet.</p>
                                </div>
                            ) : (
                                employee.attendance.map((record: any) => (
                                    <div key={record.id} className="p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-purple-200 hover:bg-white transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className={cn("h-2 w-2 rounded-full", record.checkOut ? "bg-zinc-300" : "bg-green-500")} />
                                                <span className="text-xs font-black text-zinc-900 uppercase">
                                                    {new Date(record.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                                record.checkOut ? "bg-zinc-200 text-zinc-600" : "bg-green-100 text-green-600"
                                            )}>
                                                {record.checkOut ? "Shift End" : "Active"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">
                                                {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {record.checkOut ? (
                                                <span className="text-zinc-900 font-bold">
                                                    {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : (
                                                <span className="text-purple-600 font-black animate-pulse">Running</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-8 py-4 border-2 border-zinc-100 rounded-2xl text-sm font-black text-zinc-400 hover:text-purple-600 hover:border-purple-100 transition-all flex items-center justify-center space-x-2">
                            <span>View All Activity</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
