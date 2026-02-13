"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUSES = [
    { id: "PLANNING", label: "Planning", color: "bg-blue-500" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-500" },
    { id: "REVIEW", label: "Review", color: "bg-purple-500" },
    { id: "COMPLETED", label: "Completed", color: "bg-green-500" },
    { id: "ON_HOLD", label: "On Hold", color: "bg-zinc-500" }
];

interface StatusUpdaterProps {
    project: {
        id: string;
        status: string;
    };
    onUpdate: () => void;
}

export function StatusUpdater({ project, onUpdate }: StatusUpdaterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const currentStatus = STATUSES.find(s => s.id === project.status) || STATUSES[0];

    const handleUpdate = async (statusId: string) => {
        if (statusId === project.status) {
            setIsOpen(false);
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusId })
            });

            if (res.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={updating}
                className="flex items-center space-x-3 px-4 py-1.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all shadow-lg min-w-[140px] justify-between"
            >
                <div className="flex items-center space-x-2">
                    {updating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <div className={cn("h-1.5 w-1.5 rounded-full", currentStatus.color)} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest">{currentStatus.label}</span>
                </div>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 p-2 space-y-1">
                        {STATUSES.map(status => (
                            <button
                                key={status.id}
                                onClick={() => handleUpdate(status.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-50",
                                    project.status === status.id ? "text-zinc-900 bg-zinc-50" : "text-zinc-400"
                                )}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", status.color)} />
                                    <span>{status.label}</span>
                                </div>
                                {project.status === status.id && <Check className="h-3 w-3 text-zinc-900" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
