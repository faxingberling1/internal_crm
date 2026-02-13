"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Timer,
    Zap,
    Coffee
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ShiftWidget() {
    const [employee, setEmployee] = useState<any>(null);
    const [duration, setDuration] = useState("00:00:00");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const pkt = new Date(utc + (3600000 * 5));
            setCurrentTime(pkt);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchEmployeeData();
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
        try {
            const res = await fetch("/api/employee/me");
            const data = await res.json();
            if (res.ok) {
                setEmployee(data);
            }
        } catch (err) {
            console.error("Failed to fetch employee data for widget");
        } finally {
            setLoading(false);
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
                    notes: `Clocked ${type === "CLOCK_IN" ? "in" : "out"} from Admin HQ Portal`
                }),
            });

            if (res.ok) {
                fetchEmployeeData();
            } else {
                const data = await res.json();
                alert(data.error || "Action failed");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="h-44 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 animate-pulse flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-700 shadow-2xl",
            isClockedIn
                ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20"
                : "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white shadow-zinc-900/40"
        )}>
            {/* Decorative Glass Elements */}
            <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full blur-[60px] -mr-20 -mt-20" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-white/10 w-fit px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                        <div className={cn("h-2 w-2 rounded-full", isClockedIn ? "bg-white animate-pulse" : "bg-white/40")} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Shift Status: {isClockedIn ? "Active" : "Ready"}</span>
                        {employee?.shiftStart && (
                            <span className="text-[9px] font-black opacity-60 ml-2">{employee.shiftStart} - {employee.shiftEnd} PKT</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black leading-none mb-2">
                            {isClockedIn ? "Focus Period Active" : "Initiate Mission"}
                        </h2>
                        <p className="text-white/60 text-xs font-bold leading-tight max-w-[240px]">
                            {isClockedIn
                                ? `Initialized at ${new Date(latestAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : "Clock in to start tracking your session performance."}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {!isClockedIn ? (
                            <button
                                onClick={() => handleClockToggle("CLOCK_IN")}
                                disabled={actionLoading}
                                className="px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 shadow-xl hover:scale-[1.03] active:scale-[0.98] bg-white text-zinc-900"
                            >
                                {actionLoading ? (
                                    <div className="h-4 w-4 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 fill-current" />
                                        <span>Clock In</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleClockToggle(latestAttendance.isOnBreak ? "BREAK_END" : "BREAK_START")}
                                    disabled={actionLoading}
                                    className={cn(
                                        "px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 backdrop-blur-md border border-white/20",
                                        latestAttendance.isOnBreak ? "bg-amber-100/20 text-white" : "bg-white/10 text-white"
                                    )}
                                >
                                    <Coffee className="h-4 w-4" />
                                    <span>{latestAttendance.isOnBreak ? "End Break" : "Break"}</span>
                                </button>
                                <button
                                    onClick={() => handleClockToggle("CLOCK_OUT")}
                                    disabled={actionLoading}
                                    className="px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center space-x-2 bg-white text-emerald-700"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Clock Out</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="relative h-32 w-32 shrink-0">
                    <svg className="h-full w-full -rotate-90">
                        <circle cx="50%" cy="50%" r="45%" className="stroke-white/10 fill-none stroke-[4px]" />
                        <circle cx="50%" cy="50%" r="45%" className={cn("fill-none stroke-[6px] stroke-linecap-round transition-all", isClockedIn ? "stroke-white" : "stroke-white/20")} strokeDasharray="100 100" strokeDashoffset={isClockedIn ? 0 : 100} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-0.5">Elapsed</p>
                        <p className="text-xl font-black tabular-nums tracking-tighter">{duration}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
