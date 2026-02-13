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
    URGENT: "from-red-500 to-red-600",
    HIGH: "from-orange-500 to-orange-600",
    MEDIUM: "from-yellow-500 to-yellow-600",
    LOW: "from-green-500 to-green-600"
};

const PRIORITY_BADGES = {
    URGENT: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200"
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
            className={`bg-white rounded-2xl border border-zinc-200 p-5 cursor-pointer hover:shadow-xl transition-all space-y-4 ${isDragging ? 'opacity-50 shadow-2xl' : ''
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
                <h4 className="text-base font-black text-zinc-900 line-clamp-2 leading-tight">
                    {project.name}
                </h4>
                {project.description && (
                    <p className="text-xs text-zinc-500 font-medium mt-1 line-clamp-2">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]
                            } transition-all`}
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Tasks Count */}
            {totalTasks > 0 && (
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-[9px] font-black uppercase tracking-tight px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-lg"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                {/* Due Date */}
                {project.dueDate && (
                    <div className={`flex items-center space-x-1 text-[10px] font-bold ${isOverdue ? 'text-red-600' : 'text-zinc-500'
                        }`}>
                        <Calendar className="h-3 w-3" />
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
