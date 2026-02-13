"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentSection } from "@/components/project/comment-section";
import { ImageGallery } from "@/components/project/image-gallery";
import { CredentialVault } from "@/components/project/credential-vault";
import { StatusUpdater } from "@/components/project/status-updater";
import { TeamManager } from "@/components/project/team-manager";
import { motion, AnimatePresence } from "framer-motion";

type Tab = 'overview' | 'comments' | 'files' | 'credentials';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
    progress: number;
    startDate?: string;
    dueDate?: string;
    assignedTo: string[];
    tags: string[];
    lead?: {
        name: string;
        email: string;
    };
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (error) {
            console.error("Failed to fetch project:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-2xl font-black text-zinc-900 mb-2">Project Not Found</h1>
                <p className="text-zinc-500 mb-6 font-medium">The project you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => router.push('/projects')}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Professional Smooth Sticky Header */}
            <div className={cn(
                "sticky top-0 z-40 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/90 backdrop-blur-xl py-3 border-zinc-200 shadow-sm"
                    : "bg-white py-6 border-transparent"
            )}>
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => router.push('/projects')}
                                className="p-2.5 hover:bg-zinc-100 rounded-2xl transition-all group flex-shrink-0"
                                title="Back to Projects"
                            >
                                <ArrowLeft className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            </button>

                            <div className="flex flex-col justify-center">
                                <div className="flex items-center space-x-4">
                                    <h1 className={cn(
                                        "font-black text-zinc-900 tracking-tight transition-all duration-300 origin-left",
                                        scrolled ? "text-xl" : "text-4xl"
                                    )}>
                                        {project.name}
                                    </h1>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-sm transition-all",
                                        project.priority === 'URGENT' ? "bg-red-50 text-red-700 border-red-200" :
                                            project.priority === 'HIGH' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                project.priority === 'MEDIUM' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                    "bg-green-50 text-green-700 border-green-200",
                                        scrolled ? "scale-90 opacity-80" : "scale-100"
                                    )}>
                                        {project.priority}
                                    </span>
                                </div>
                                {!scrolled && (
                                    <p className="text-[10px] font-black text-zinc-900/40 uppercase tracking-[0.3em] mt-1 transition-all duration-300">
                                        Project Command Center
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            {/* Status Container */}
                            <div className="flex flex-col items-end justify-center h-10">
                                {!scrolled && (
                                    <span className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1.5">Status</span>
                                )}
                                <StatusUpdater project={project} onUpdate={fetchProject} />
                            </div>

                            <div className="h-10 w-px bg-zinc-200/60" />

                            {/* Completion Container */}
                            <div className="flex flex-col items-end justify-center h-10">
                                {!scrolled && (
                                    <span className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1.5">Completion</span>
                                )}
                                <div className="flex items-center space-x-4">
                                    <div className={cn(
                                        "h-1.5 bg-zinc-100 rounded-full overflow-hidden transition-all duration-500",
                                        scrolled ? "w-16" : "w-32"
                                    )}>
                                        <div className="h-full bg-zinc-900 transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                                    </div>
                                    <span className={cn(
                                        "font-black text-zinc-900 transition-all",
                                        scrolled ? "text-xs" : "text-sm"
                                    )}>{project.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-12 pb-40">

                {/* 1. Overview Section */}
                <motion.section
                    id="overview"
                    className="scroll-mt-40"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase tracking-widest text-sm">Project Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Detailed Info */}
                            <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm h-full">
                                <p className="text-zinc-500 font-medium text-lg leading-relaxed mb-8">{project.description || "No description provided."}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-zinc-50 text-zinc-900 rounded-2xl">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Timeline</p>
                                                <p className="font-bold text-zinc-900">
                                                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                                                    <span className="mx-2 text-zinc-300">→</span>
                                                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-zinc-50 text-zinc-900 rounded-2xl">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lead & Client</p>
                                                <p className="font-bold text-zinc-900">{project.lead?.name || "No lead assigned"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Team Management */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                            <TeamManager projectId={projectId} />
                        </div>
                    </div>
                </motion.section>

                <div className="h-px bg-zinc-200" />

                {/* 2. Comments Section */}
                <motion.section
                    id="comments"
                    className="scroll-mt-40"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase tracking-widest text-sm">Project Activity & Comments</h2>
                    </div>
                    <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                        <CommentSection projectId={projectId} />
                    </div>
                </motion.section>

                <div className="h-px bg-zinc-200" />

                {/* 3. Media Gallery Section */}
                <motion.section
                    id="files"
                    className="scroll-mt-40"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase tracking-widest text-sm">Media & Assets</h2>
                    </div>
                    <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                        <ImageGallery projectId={projectId} />
                    </div>
                </motion.section>

                <div className="h-px bg-zinc-200" />

                {/* 4. Credentials Section */}
                <motion.section
                    id="credentials"
                    className="scroll-mt-40"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase tracking-widest text-sm">Access & Security</h2>
                    </div>
                    <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                        <CredentialVault projectId={projectId} />
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
