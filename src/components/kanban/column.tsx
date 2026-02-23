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
                <div className="flex items-center space-x-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${color.replace('bg-', 'bg-')} shadow-[0_0_10px_currentColor]`}></div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</h3>
                </div>
                <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg">
                    {count}
                </span>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`flex-1 rounded-[2.5rem] border-2 border-dashed p-4 space-y-4 min-h-[600px] transition-all duration-500 ${isOver
                    ? 'border-orange-500/40 bg-orange-500/[0.02]'
                    : 'border-white/5 bg-black/20'
                    }`}
            >
                {children}
            </div>
        </div>
    );
}
