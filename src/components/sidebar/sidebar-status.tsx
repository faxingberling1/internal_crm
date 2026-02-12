"use client";

import { Zap, Coffee, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-context";

export function SidebarStatus() {
    const { user } = useUser();

    if (!user || user.role === "ADMIN") return null;

    const latestAttendance = user.employee?.attendance?.[0];
    const isClockedIn = latestAttendance && !latestAttendance.checkOut;
    const isOnBreak = latestAttendance?.isOnBreak;

    return (
        <div className="px-3 pb-4">
            <div className={cn(
                "p-4 rounded-2xl border transition-all duration-500",
                isClockedIn
                    ? isOnBreak
                        ? "bg-amber-50 border-amber-200 shadow-amber-500/5"
                        : "bg-emerald-50 border-emerald-200 shadow-emerald-500/5"
                    : "bg-zinc-100/50 border-zinc-200 opacity-60 hover:opacity-100"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        isClockedIn
                            ? isOnBreak
                                ? "text-amber-600"
                                : "text-emerald-600"
                            : "text-zinc-400"
                    )}>
                        {isClockedIn ? isOnBreak ? "On Break" : "In Mission" : "In Standby"}
                    </span>
                    {isClockedIn && !isOnBreak && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                        isClockedIn
                            ? isOnBreak
                                ? "bg-amber-100 text-amber-600"
                                : "bg-emerald-100 text-emerald-600"
                            : "bg-zinc-200 text-zinc-400"
                    )}>
                        {isClockedIn ? isOnBreak ? <Coffee className="h-4 w-4" /> : <Zap className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="text-xs font-black text-zinc-900 tracking-tight">
                            {isClockedIn ? isOnBreak ? "Refresh Phase" : "Ops Synchronized" : "Awaiting Mission"}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-500">
                            {isClockedIn ? "Live Tracker Active" : "No Active Session"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
