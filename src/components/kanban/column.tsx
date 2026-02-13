"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    count: number;
    children: ReactNode;
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${color}`}></div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">{title}</h3>
                </div>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg">
                    {count}
                </span>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`flex-1 rounded-3xl border-2 border-dashed p-4 space-y-4 min-h-[600px] transition-all ${isOver
                        ? 'border-zinc-900 bg-zinc-100/50'
                        : 'border-zinc-200 bg-white/50'
                    }`}
            >
                {children}
            </div>
        </div>
    );
}
