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
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            {/* Header */}
            <div className="max-w-[1800px] mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Projects</h1>
                        <p className="text-zinc-500 font-medium mt-1">Manage your projects with Kanban</p>
                    </div>
                    <button
                        onClick={() => router.push('/projects/create')}
                        className="flex items-center space-x-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-all">
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
