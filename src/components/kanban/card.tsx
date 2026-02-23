"use client";

import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { Calendar, Users, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description?: string;
    priority: string;
    assignedTo: string[];
    tags: string[];
    progress: number;
    dueDate?: string;
    lead?: {
        name: string;
    };
    tasks?: any[];
}

interface ProjectCardProps {
    project: Project;
}

const PRIORITY_COLORS = {
    URGENT: "from-red-600 to-red-400",
    HIGH: "from-orange-600 to-orange-400",
    MEDIUM: "from-orange-500/40 to-orange-300/40",
    LOW: "from-emerald-600 to-emerald-400"
};

const PRIORITY_BADGES = {
    URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
    HIGH: "bg-orange-600/10 text-orange-600 border-orange-500/20",
    MEDIUM: "bg-orange-500/5 text-orange-500/40 border-orange-500/10",
    LOW: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
};

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: project.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();
    const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
    const totalTasks = project.tasks?.length || 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => router.push(`/projects/${project.id}`)}
            className={`glass-premium rounded-[2rem] border border-white/5 p-6 cursor-pointer hover:glow-orange transition-all duration-500 space-y-5 ${isDragging ? 'opacity-50 shadow-2xl scale-95' : ''
                }`}
        >
            {/* Priority Badge */}
            <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${PRIORITY_BADGES[project.priority as keyof typeof PRIORITY_BADGES]
                    }`}>
                    {project.priority}
                </span>
                {isOverdue && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                )}
            </div>

            {/* Project Name */}
            <div>
                <h4 className="text-[13px] font-black text-white line-clamp-2 leading-tight uppercase tracking-widest">
                    {project.name}
                </h4>
                {project.description && (
                    <p className="text-[10px] text-zinc-600 font-bold mt-2 line-clamp-2 uppercase tracking-tight">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                    <span>Progress</span>
                    <span className="text-orange-500">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full bg-gradient-to-r ${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]
                            } transition-all shadow-[0_0_10px_rgba(255,122,0,0.3)]`}
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Tasks Count */}
            {totalTasks > 0 && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                    <CheckCircle2 className="h-3 w-3 text-orange-600" />
                    <span>{completedTasks}/{totalTasks} Tasks Completed</span>
                </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 bg-orange-600/5 text-zinc-700 border border-orange-500/10 rounded-lg group-hover:text-orange-500/80 transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                {/* Due Date */}
                {project.dueDate && (
                    <div className={`flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-600' : 'text-zinc-700'
                        }`}>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                )}

                {/* Assignees */}
                {project.assignedTo && project.assignedTo.length > 0 && (
                    <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500">
                            {project.assignedTo.length}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
