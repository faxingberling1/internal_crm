"use client";

import { Clock as ClockIcon } from "lucide-react";
import { useState, useEffect } from "react";

export function SidebarClock() {
    const [time, setTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatToPKT = (date: Date) => {
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const pkt = new Date(utc + (3600000 * 5));
        return pkt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="mx-3 mt-4 p-4 rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/5 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/10 transition-colors duration-500" />
            <div className="relative z-10 flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <ClockIcon className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Karachi Pulse</p>
                    <p className="text-sm font-black text-white tabular-nums tracking-tight">
                        {formatToPKT(time)}
                    </p>
                </div>
            </div>
        </div>
    );
}
