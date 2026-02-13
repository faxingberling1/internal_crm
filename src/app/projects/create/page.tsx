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
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 font-bold mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Projects</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Create New Project</h1>
                    <p className="text-zinc-500 font-medium mt-1">Add a new project to your Kanban board</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-bold"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief project description"
                            rows={4}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-bold"
                            >
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-bold"
                            >
                                {PRIORITIES.map(priority => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-bold"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="e.g. web, design, urgent"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-zinc-900/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Project</span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
