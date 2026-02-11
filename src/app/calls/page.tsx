"use client";

import { useState, useEffect } from "react";
import {
    PhoneCall,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    MinusCircle,
    MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CallsPage() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/calls")
            .then((res) => res.json())
            .then((data) => {
                setCalls(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Call History</h2>
                    <p className="text-zinc-500 mt-2">Track all communications with your leads.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search calls..."
                    className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500/50 transition-all outline-none text-sm text-zinc-900 shadow-sm"
                />
            </div>

            <div className="premium-card p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="p-6 animate-pulse flex items-center space-x-4">
                                <div className="h-10 w-10 bg-zinc-100 rounded-full animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/4 bg-zinc-100 rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : calls.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            No call logs found.
                        </div>
                    ) : (
                        calls.map((call: any) => (
                            <div key={call.id} className="p-6 hover:bg-zinc-50/50 transition-colors flex items-center justify-between group border-b border-zinc-100 last:border-0">
                                <div className="flex items-center space-x-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center border border-zinc-200 shadow-sm",
                                        call.status === "COMPLETED" ? "text-green-700 bg-green-100" :
                                            call.status === "NO_ANSWER" ? "text-orange-700 bg-orange-100" :
                                                "text-red-700 bg-red-100"
                                    )}>
                                        {call.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6" /> :
                                            call.status === "NO_ANSWER" ? <MinusCircle className="h-6 w-6" /> :
                                                <XCircle className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                                            Call with {call.lead?.name || "Unknown"}
                                        </h4>
                                        <div className="flex items-center text-xs text-zinc-500 mt-1 space-x-3">
                                            <span className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1 text-zinc-400" />
                                                {call.duration} sec
                                            </span>
                                            <span>•</span>
                                            <span className="font-medium">{new Date(call.timestamp).toLocaleString()}</span>
                                        </div>
                                        {call.notes && (
                                            <p className="text-sm text-zinc-600 mt-2 line-clamp-1 italic bg-zinc-50 p-2 rounded border border-zinc-100">"{call.notes}"</p>
                                        )}
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
