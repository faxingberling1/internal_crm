"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { KanbanColumn } from "@/components/kanban/column";
import { ProjectCard } from "@/components/kanban/card";

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
    color?: string;
    assignedTo: string[];
    tags: string[];
    progress: number;
    dueDate?: string;
    lead?: {
        id: string;
        name: string;
    };
    tasks?: any[];
}

const STATUSES = [
    { id: "PLANNING", label: "Planning", color: "bg-blue-500" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-500" },
    { id: "REVIEW", label: "Review", color: "bg-purple-500" },
    { id: "COMPLETED", label: "Completed", color: "bg-green-500" },
    { id: "ON_HOLD", label: "On Hold", color: "bg-gray-500" }
];

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const projectId = active.id as string;
        const newStatus = over.id as string;

        // Update local state optimistically
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, status: newStatus } : p
        ));

        // Update on server
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update project status:', error);
            // Revert on error
            fetchProjects();
        }

        setActiveId(null);
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProjectsByStatus = (status: string) => {
        return filteredProjects.filter(p => p.status === status);
    };

    const activeProject = projects.find(p => p.id === activeId);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-orange-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-10">
            {/* Header */}
            <div className="max-w-[1800px] mx-auto mb-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-[0.1em]">Project <span className="text-orange-600">Dashboard</span></h1>
                        <p className="text-zinc-600 font-bold mt-2 uppercase text-xs tracking-[0.3em]">Manage your work with visual Kanban boards</p>
                    </div>
                    <button
                        onClick={() => router.push('/projects/create')}
                        className="flex items-center space-x-3 px-8 py-4 bg-orange-600 text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-500 transition-all shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#080808] border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 placeholder:text-zinc-800"
                        />
                    </div>
                    <button className="flex items-center space-x-3 px-8 py-4 bg-black/40 border border-white/5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-zinc-700 hover:text-orange-500 transition-all hover:bg-orange-500/5">
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {STATUSES.map(status => (
                            <KanbanColumn
                                key={status.id}
                                id={status.id}
                                title={status.label}
                                color={status.color}
                                count={getProjectsByStatus(status.id).length}
                            >
                                {getProjectsByStatus(status.id).map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </KanbanColumn>
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeProject ? (
                        <div className="opacity-50">
                            <ProjectCard project={activeProject} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
