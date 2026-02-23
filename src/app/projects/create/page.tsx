"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"];

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        startDate: "",
        dueDate: "",
        tags: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                })
            });

            if (res.ok) {
                router.push('/projects');
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-10 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-orange-600/5 blur-[100px] -z-10" />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Flow */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-orange-500">
                            <div className="h-px w-8 bg-orange-500/50" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Project Setup</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            New <span className="text-orange-500">Project</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-lg">Define the project details and goals.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center space-x-4 bg-zinc-950/40 border border-white/5 px-8 py-4 rounded-2xl text-zinc-600 hover:text-orange-500 hover:border-orange-500/20 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Cancel</span>
                    </button>
                </div>

                {/* Form Matrix */}
                <form onSubmit={handleSubmit} className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden group hover:glow-orange transition-all duration-1000 space-y-10">
                    <div className="absolute inset-0 bg-zinc-950/20 -z-10" />

                    <div className="space-y-10">
                        {/* Project Designation */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., QUANTUM SYSTEMS REDESIGN"
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs placeholder:text-zinc-800 shadow-inner"
                            />
                        </div>

                        {/* Operational Brief */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Briefly describe the project goals..."
                                rows={4}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold resize-none shadow-inner"
                            />
                        </div>

                        {/* Status & Priority Spectrum */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs shadow-inner"
                                >
                                    {STATUSES.map(status => (
                                        <option key={status} value={status} className="bg-zinc-950">
                                            {status.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Priority Level
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs shadow-inner"
                                >
                                    {PRIORITIES.map(priority => (
                                        <option key={priority} value={priority} className="bg-zinc-950">
                                            {priority}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Temporal Markers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs shadow-inner"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Tactical Identifiers */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                Tags (Comma Separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g. INFRASTRUCTURE, SECURITY, OPS"
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs placeholder:text-zinc-800 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Submit Flow */}
                    <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-4 px-12 py-6 bg-orange-600 text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-orange-500 transition-all shadow-[0_0_60px_-10px_rgba(255,122,0,0.6)] hover:scale-[1.02] disabled:opacity-50 relative overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Project</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
