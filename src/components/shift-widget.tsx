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
        <div className="h-44 bg-black/40 rounded-[2.5rem] border border-white/5 animate-pulse flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
        </div>
    );

    const latestAttendance = employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;

    return (
        <div className={cn(
            "relative overflow-hidden rounded-[3rem] p-10 transition-all duration-700 shadow-2xl border border-white/5 group",
            isClockedIn
                ? "bg-[#0c0c0c] shadow-[0_20px_50px_-15px_rgba(255,122,0,0.15)]"
                : "bg-[#050505] shadow-black/40"
        )}>
            {/* Premium Mesh Background */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-600/20 to-transparent" />
            <div className="absolute -right-20 -top-20 h-64 w-64 bg-orange-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-500" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2.5 bg-black/50 px-4 py-2 rounded-full border border-white/5 shadow-inner">
                            <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,122,0,0.5)]", isClockedIn ? "bg-orange-500 animate-pulse" : "bg-zinc-800")} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                {isClockedIn ? "Pulse Active" : "Grid Ready"}
                            </span>
                        </div>
                        {employee?.shiftStart && (
                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">{employee.shiftStart} — {employee.shiftEnd} PKT</span>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-black leading-none text-white tracking-widest uppercase italic">
                            {isClockedIn ? "Node Active" : "Initiate Node"}
                        </h2>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] max-w-[320px] leading-relaxed">
                            {isClockedIn
                                ? `Protocol execution started at ${new Date(latestAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : "Initialize your node connection to begin tracking matrix performance metrics."}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        {!isClockedIn ? (
                            <button
                                onClick={() => handleClockToggle("CLOCK_IN")}
                                disabled={actionLoading}
                                className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center space-x-3 shadow-2xl hover:scale-[1.05] active:scale-[0.98] bg-orange-600 text-black hover:bg-orange-500 shadow-orange-900/20 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                {actionLoading ? (
                                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Power On</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleClockToggle(latestAttendance.isOnBreak ? "BREAK_END" : "BREAK_START")}
                                    disabled={actionLoading}
                                    className={cn(
                                        "px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center space-x-3 border shadow-2xl",
                                        latestAttendance.isOnBreak
                                            ? "bg-orange-600 text-black border-orange-500 shadow-orange-500/20"
                                            : "bg-black/40 text-orange-600 border-white/5 hover:bg-white/5"
                                    )}
                                >
                                    <Coffee className="h-4 w-4" />
                                    <span>{latestAttendance.isOnBreak ? "Resume" : "Standby"}</span>
                                </button>
                                <button
                                    onClick={() => handleClockToggle("CLOCK_OUT")}
                                    disabled={actionLoading}
                                    className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center space-x-3 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Disconnect</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="relative h-40 w-40 shrink-0 group/time">
                    <div className="absolute inset-0 bg-orange-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <svg className="h-full w-full -rotate-90 relative z-10">
                        <circle cx="50%" cy="50%" r="42%" className="stroke-white/5 fill-none stroke-[8px]" />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="42%"
                            className={cn(
                                "fill-none stroke-[8px] stroke-linecap-round transition-all duration-1000",
                                isClockedIn ? "stroke-orange-600 drop-shadow-[0_0_8px_rgba(255,122,0,1)]" : "stroke-zinc-900"
                            )}
                            strokeDasharray="100 100"
                            strokeDashoffset={isClockedIn ? 0 : 100}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <Timer className={cn("h-5 w-5 mb-1 transition-colors duration-500", isClockedIn ? "text-orange-600" : "text-zinc-800")} />
                        <p className="text-xl font-black tabular-nums tracking-widest text-white">{duration}</p>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700 mt-1">Runtime</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
