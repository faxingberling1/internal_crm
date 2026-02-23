"use client";

import { useState, useEffect } from "react";
import {
    Briefcase,
    Plus,
    Filter,
    ExternalLink,
    Tag,
    Calendar,
    Globe,
    Layers,
    Search,
    MoreVertical,
    Trash2,
    Edit3,
    CheckCircle2,
    EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    category: string;
    clientName: string | null;
    liveUrl: string | null;
    imageUrl: string | null;
    tags: string[];
    isPublished: boolean;
    completedAt: string | null;
    createdAt: string;
}

const CATEGORIES = [
    { id: "ALL", name: "All Work" },
    { id: "WEB_DESIGN", name: "Web Design" },
    { id: "SEO", name: "SEO" },
    { id: "MARKETING", name: "Marketing" },
    { id: "BRANDING", name: "Branding" },
    { id: "COPYWRITING", name: "Copywriting" },
    { id: "OTHER", name: "Other" }
];

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({
        title: "",
        category: "WEB_DESIGN",
        description: "",
        clientName: "",
        liveUrl: "",
        imageUrl: "",
        tagsString: "",
        isPublished: true,
        completedAt: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchItems();
    }, [filter]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/portfolio${filter !== "ALL" ? `?category=${filter}` : ""}`);
            const data = await res.json();
            setItems(data || []);
        } catch (error) {
            console.error("Failed to fetch portfolio items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newItem.title || !newItem.category) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newItem,
                    tags: newItem.tagsString.split(",").map(t => t.trim()).filter(t => t),
                    completedAt: newItem.completedAt ? new Date(newItem.completedAt).toISOString() : null
                })
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewItem({
                    title: "",
                    category: "WEB_DESIGN",
                    description: "",
                    clientName: "",
                    liveUrl: "",
                    imageUrl: "",
                    tagsString: "",
                    isPublished: true,
                    completedAt: new Date().toISOString().split('T')[0]
                });
                fetchItems();
            }
        } catch (error) {
            console.error("Failed to create portfolio item:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = [
        { name: "Total Projects", value: items.length, icon: Briefcase, color: "text-orange-500", bg: "bg-orange-500/10" },
        { name: "Published", value: items.filter(i => i.isPublished).length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
        { name: "Websites", value: items.filter(i => i.category === "WEB_DESIGN").length, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "Brandings", value: items.filter(i => i.category === "BRANDING").length, icon: Layers, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];

    return (
        <div className="space-y-12 pb-32 bg-[#050505] min-h-screen -m-10 p-10 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group">
                        <div className="h-px w-8 bg-orange-500/50 group-hover:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Work Dashboard Matrix</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
                        Portfolio <span className="text-orange-500">3.0</span>
                    </h1>
                    <p className="text-zinc-500 font-bold max-w-lg text-lg tracking-tight leading-relaxed">
                        Curate your professional legacy with high-fidelity project indexing and global architectural presence.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group relative flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-10 py-5 rounded-[1.5rem] transition-all font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_40px_-10px_rgba(255,122,0,0.5)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/20 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Plus className="h-5 w-5" />
                    <span>Post New Work</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-premium p-8 rounded-[2.5rem] flex items-center space-x-6 group hover:glow-orange transition-all duration-500">
                        <div className={cn("p-5 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">{stat.name}</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-3 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-[0.2em] border border-transparent",
                                filter === cat.id
                                    ? "bg-orange-600 text-black shadow-[0_0_20px_-5px_rgba(255,122,0,0.6)] border-orange-500/50"
                                    : "text-zinc-600 hover:text-orange-500 hover:bg-orange-500/[0.03]"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="relative group min-w-[350px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan architecture database..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#080808] border border-white/5 rounded-2xl py-4 pl-14 pr-4 transition-all outline-none text-xs font-black uppercase tracking-widest text-orange-500/80 placeholder:text-zinc-800 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20"
                    />
                </div>
            </div>

            {/* Portfolio Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[4/3] bg-zinc-950/40 rounded-[2.5rem] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -12 }}
                            className="group glass-premium rounded-[3rem] overflow-hidden hover:glow-orange transition-all duration-700 isolate"
                        >
                            {/* Image Placeholder */}
                            <div className="aspect-[16/10] bg-[#0A0A0A] relative overflow-hidden group/image">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#080808] to-[#0A0A0A]">
                                        <Briefcase className="h-16 w-16 text-zinc-900 group-hover:text-orange-500/20 transition-colors duration-700" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex space-x-2">
                                    <span className="px-3 py-1.5 bg-orange-600 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                                        {CATEGORIES.find(c => c.id === item.category)?.name}
                                    </span>
                                </div>
                                {!item.isPublished && (
                                    <div className="absolute top-6 right-6">
                                        <span className="px-3 py-1.5 bg-black/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-600 shadow-sm flex items-center gap-2">
                                            <EyeOff className="h-3 w-3" /> Draft
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-4">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors duration-500">{item.title}</h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(255,90,0,0.8)]" />
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">{item.clientName || "Project Details"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-3 bg-zinc-900/50 border border-white/5 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all text-zinc-600"><Edit3 className="h-4 w-4" /></button>
                                        <button className="p-3 bg-zinc-900/50 border border-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all text-zinc-600 group/delete"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                                    {item.description || "Experimental architectural framework engineered for maximum scalability and visual impact."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-orange-500/[0.03] border border-orange-500/10 rounded-lg text-[9px] font-black text-zinc-600 uppercase tracking-tighter hover:text-orange-500 hover:bg-orange-500/[0.05] transition-all">
                                            // {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                    <div className="flex items-center space-x-3 text-zinc-700">
                                        <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center bg-zinc-950/20">
                                            <Calendar className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                            {item.completedAt ? new Date(item.completedAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Operational'}
                                        </span>
                                    </div>
                                    {item.liveUrl && (
                                        <a
                                            href={item.liveUrl}
                                            target="_blank"
                                            className="group/link flex items-center space-x-3 text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] bg-orange-600/10 px-5 py-2.5 rounded-xl transition-all hover:bg-orange-600 hover:text-black shadow-[0_0_20px_rgba(255,122,0,0.1)] hover:shadow-[0_0_30px_rgba(255,122,0,0.4)]"
                                        >
                                            <span>Explore</span>
                                            <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-40 flex flex-col items-center justify-center bg-orange-500/[0.01] rounded-[4rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="p-10 bg-zinc-950 rounded-full border border-white/5 shadow-[0_0_50px_rgba(0,0,0,1)] text-orange-600/20 mb-8 animate-float">
                        <Briefcase className="h-24 w-24" />
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">Vast <span className="text-orange-500">Silence</span></h3>
                    <p className="text-zinc-600 font-bold max-w-sm text-center mt-4 leading-relaxed tracking-tight">
                        No portfolio assets detected in this specialized category. Initiate the first project protocol to begin your legacy.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-12 bg-orange-600 hover:bg-orange-500 text-black px-12 py-5 rounded-2xl font-black shadow-[0_0_40px_rgba(255,122,0,0.4)] transition-all uppercase text-xs tracking-[0.3em]"
                    >
                        Initiate First Asset
                    </button>
                </div>
            )}

            {/* Placeholder for Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="relative bg-[#050505]/90 backdrop-blur-3xl w-full max-w-3xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden border border-white/10 isolate"
                        >
                            {/* Modal Mesh Glow */}
                            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/10 blur-[100px] -z-10" />
                            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-orange-500/5 blur-[100px] -z-10" />

                            <div className="p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-orange-500 mb-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Project ID</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-white tracking-tighter">New <span className="text-orange-500">Asset</span></h2>
                                        <p className="text-zinc-600 text-sm font-bold tracking-tight">Index a new architectural achievement into the global showcase.</p>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="h-14 w-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center hover:bg-orange-600 group transition-all">
                                        <Plus className="h-7 w-7 text-zinc-700 group-hover:text-black rotate-45 transition-transform duration-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Project Title *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                                placeholder="e.g., E-commerce Redesign"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category *</label>
                                            <select
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                            >
                                                {CATEGORIES.filter(c => c.id !== "ALL").map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Client Name</label>
                                            <input
                                                type="text"
                                                value={newItem.clientName}
                                                onChange={(e) => setNewItem({ ...newItem, clientName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                                placeholder="Client or Project Owner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Completion Date</label>
                                            <input
                                                type="date"
                                                value={newItem.completedAt}
                                                onChange={(e) => setNewItem({ ...newItem, completedAt: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium text-sm resize-none text-white placeholder:text-zinc-600"
                                            placeholder="Describe the architectural masterpiece..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Live URL</label>
                                            <input
                                                type="text"
                                                value={newItem.liveUrl}
                                                onChange={(e) => setNewItem({ ...newItem, liveUrl: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                                placeholder="https://project-demo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                value={newItem.tagsString}
                                                onChange={(e) => setNewItem({ ...newItem, tagsString: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                                placeholder="Next.js, Prisma, Tailwind"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={newItem.imageUrl}
                                            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-sm text-white placeholder:text-zinc-600"
                                            placeholder="https://example.com/cover.jpg"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4 pt-10 border-t border-white/5 mt-12">
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            disabled={submitting}
                                            className="px-10 py-5 rounded-2xl text-zinc-700 font-black uppercase text-[10px] tracking-[0.3em] hover:text-orange-500 transition-all"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            disabled={submitting || !newItem.title}
                                            className="group relative bg-orange-600 hover:bg-orange-500 text-black px-12 py-5 rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)] transition-all disabled:opacity-50 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/20 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            {submitting ? "Processing..." : "Authorize Publication"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
