"use client";

import { useState, useEffect, useRef } from "react";
import {
    Package as PackageIcon,
    Plus,
    Search,
    Edit2,
    Trash2,
    DollarSign,
    Tag,
    CheckCircle2,
    Sparkles,
    X,
    PlusCircle,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-context";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

const BASE_CATEGORIES = [
    { id: "ALL", name: "All Packages", color: "text-orange-500", bg: "bg-orange-500/10", custom: false },
    { id: "WEB_DESIGN", name: "Web Systems", color: "text-orange-600", bg: "bg-orange-600/10", custom: false },
    { id: "SEO", name: "Search Intel", color: "text-orange-500", bg: "bg-orange-500/10", custom: false },
    { id: "MARKETING", name: "Market Ops", color: "text-orange-600", bg: "bg-orange-600/10", custom: false },
    { id: "COPYWRITING", name: "Content Node", color: "text-orange-500", bg: "bg-orange-500/10", custom: false },
    { id: "PORTAL_DESIGN", name: "Portal Architecture", color: "text-orange-600", bg: "bg-orange-600/10", custom: false },
    { id: "BRANDING", name: "Identity Design", color: "text-orange-500", bg: "bg-orange-500/10", custom: false },
    { id: "OTHER", name: "Auxiliary Nodes", color: "text-orange-600", bg: "bg-orange-600/10", custom: false },
];

const CUSTOM_CAT_STORAGE_KEY = "crm_custom_package_categories";

const CUSTOM_COLORS = [
    { color: "text-orange-500", bg: "bg-orange-500/10" },
    { color: "text-orange-600", bg: "bg-orange-600/10" },
    { color: "text-orange-400", bg: "bg-orange-400/10" },
];

interface Package {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    features: string;
    isActive: boolean;
    createdAt: string;
}

export default function PackagesPage() {
    const { user } = useUser();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [customCategories, setCustomCategories] = useState<{ id: string; name: string; color: string; bg: string; custom: boolean }[]>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const addCatInputRef = useRef<HTMLInputElement>(null);

    // Load custom categories from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CUSTOM_CAT_STORAGE_KEY);
            if (stored) setCustomCategories(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const allCategories = [...BASE_CATEGORIES, ...customCategories];

    const addCategory = () => {
        const name = newCategoryInput.trim();
        if (!name) return;
        const id = name.toUpperCase().replace(/\s+/g, "_");
        if (allCategories.some(c => c.id === id)) return; // duplicate guard
        const palette = CUSTOM_COLORS[customCategories.length % CUSTOM_COLORS.length];
        const newCat = { id, name, ...palette, custom: true };
        const updated = [...customCategories, newCat];
        setCustomCategories(updated);
        localStorage.setItem(CUSTOM_CAT_STORAGE_KEY, JSON.stringify(updated));
        setNewCategoryInput("");
        setShowAddCategory(false);
    };

    const removeCustomCategory = (id: string) => {
        const updated = customCategories.filter(c => c.id !== id);
        setCustomCategories(updated);
        localStorage.setItem(CUSTOM_CAT_STORAGE_KEY, JSON.stringify(updated));
        if (selectedCategory === id) setSelectedCategory("ALL");
    };

    const toggleExpand = (id: string) =>
        setExpandedCards(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/packages");
            const data = await res.json();
            setPackages(data || []);
        } catch (error) {
            console.error("Failed to fetch packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPackage) return;
        try {
            await fetch(`/api/packages?id=${selectedPackage.id}`, {
                method: "DELETE",
            });
            fetchPackages();
        } catch (error) {
            console.error("Failed to delete package:", error);
        }
    };

    const filteredPackages = packages.filter((pkg) => {
        const matchesCategory = selectedCategory === "ALL" || pkg.category === selectedCategory;
        const matchesSearch =
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const stats = [
        { label: "Matrix Nodes", value: packages.length, icon: PackageIcon, color: "text-orange-600", bg: "bg-orange-600/10" },
        { label: "Active Services", value: packages.filter(p => p.isActive).length, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "System Categories", value: new Set(packages.map(p => p.category)).size, icon: Tag, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase tracking-[0.1em]">
                        Service <span className="text-orange-600">Packages</span>
                    </h2>
                    <p className="text-zinc-600 font-bold mt-2 uppercase text-xs tracking-[0.3em]">
                        Manage your service offerings and pricing packages
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-8 py-4 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)] font-black uppercase text-xs tracking-widest"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Initialize Node</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-premium p-8 flex items-center space-x-5 border border-white/5 rounded-[2.5rem] shadow-2xl">
                        <div className={cn("p-4 rounded-2xl bg-black border border-white/5", stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-1">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-black text-white tracking-widest">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
                {allCategories.map((category) => (
                    <div key={category.id} className="relative group/chip flex items-center">
                        <button
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                                category.custom ? "pr-8" : "",
                                selectedCategory === category.id
                                    ? `bg-orange-600 text-black border-orange-500/50 shadow-[0_0_20px_rgba(255,122,0,0.4)]`
                                    : "bg-black/40 text-zinc-600 border-white/5 hover:bg-orange-600/5 hover:text-orange-500"
                            )}
                        >
                            {category.name}
                        </button>
                        {/* Delete button only for custom categories */}
                        {category.custom && (
                            <button
                                onClick={(e) => { e.stopPropagation(); removeCustomCategory(category.id); }}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-zinc-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover/chip:opacity-100"
                                title="Remove category"
                            >
                                <X className="h-2.5 w-2.5" />
                            </button>
                        )}
                    </div>
                ))}

                {/* Inline add category */}
                {showAddCategory ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                        <input
                            ref={addCatInputRef}
                            autoFocus
                            type="text"
                            value={newCategoryInput}
                            onChange={e => setNewCategoryInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setShowAddCategory(false); setNewCategoryInput(""); } }}
                            placeholder="Category name…"
                            className="px-3 py-2 rounded-xl border border-purple-300 bg-purple-50 text-sm font-bold text-purple-700 placeholder:text-purple-300 outline-none focus:ring-2 focus:ring-purple-500/20 w-40 transition-all"
                        />
                        <button
                            onClick={addCategory}
                            className="h-8 w-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-sm"
                            title="Confirm"
                        >
                            <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => { setShowAddCategory(false); setNewCategoryInput(""); }}
                            className="h-8 w-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-all"
                            title="Cancel"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    isAdmin && (
                        <button
                            onClick={() => setShowAddCategory(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-zinc-300 text-zinc-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 text-xs font-bold transition-all"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add Category
                        </button>
                    )
                )}
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search system items by identifier or service description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#080808] border border-white/5 rounded-[2rem] py-4.5 pl-14 pr-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 placeholder:text-zinc-800 shadow-2xl"
                />
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-[2.5rem] bg-zinc-950/40 animate-pulse border border-white/5" />
                    ))
                ) : filteredPackages.length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                            <div className="mb-8 p-10 rounded-full bg-zinc-950 border border-white/5 shadow-2xl">
                                <PackageIcon className="h-12 w-12 text-orange-600/30" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">No services identified</h3>
                            <p className="text-zinc-600 mt-3 font-bold uppercase text-[10px] tracking-widest">
                                {isAdmin
                                    ? "Create your first service to begin"
                                    : "No operational items available at this cycle"}
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredPackages.map((pkg) => {
                        const category = allCategories.find((c) => c.id === pkg.category);
                        const features = pkg.features ? JSON.parse(pkg.features) : [];

                        const isExpanded = expandedCards.has(pkg.id);
                        const visibleFeatures = isExpanded ? features : features.slice(0, 4);
                        const hasMore = features.length > 4;

                        return (
                            <div
                                key={pkg.id}
                                className="glass-obsidian-saturated flex flex-col hover:glow-orange transition-all group p-10 rounded-[2.5rem] border border-orange-500/30 h-full"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <span
                                        className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border",
                                            "text-orange-600 bg-orange-600/10 border-orange-500/20 shadow-lg"
                                        )}
                                    >
                                        {category?.name || pkg.category}
                                    </span>
                                    {isAdmin && (
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingPackage(pkg);
                                                    setShowCreateModal(true);
                                                }}
                                                className="p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 hover:bg-orange-600/10 text-zinc-700 hover:text-orange-500 transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPackage(pkg);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 hover:bg-red-500/20 text-zinc-700 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors leading-tight mb-3 tracking-widest uppercase">
                                    {pkg.name}
                                </h4>

                                <p className="text-[10px] text-zinc-600 mb-6 leading-relaxed font-bold uppercase tracking-widest">
                                    {pkg.description}
                                </p>

                                {features.length > 0 && (
                                    <div className="space-y-3 mb-8">
                                        {visibleFeatures.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start space-x-3">
                                                <Sparkles className="h-3.5 w-3.5 text-orange-600 mt-1 flex-shrink-0" />
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                        {hasMore && (
                                            <button
                                                onClick={() => toggleExpand(pkg.id)}
                                                className="ml-6 text-[9px] font-black text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-[0.2em] border-b border-orange-500/20"
                                            >
                                                {isExpanded
                                                    ? "Collapse Details"
                                                    : `View ${features.length} Features`}
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <div className="flex items-center text-3xl font-black text-white tracking-widest">
                                        <span className="text-lg mr-1 text-orange-600">$</span>
                                        {pkg.price.toLocaleString()}
                                    </div>
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-2">
                                        Baseline Credit Requirement
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {
                showCreateModal && (
                    <PackageModal
                        isOpen={showCreateModal}
                        onClose={() => {
                            setShowCreateModal(false);
                            setEditingPackage(null);
                        }}
                        onSave={fetchPackages}
                        package_={editingPackage}
                        allCategories={allCategories.filter(c => c.id !== "ALL")}
                    />
                )
            }

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedPackage(null);
                }}
                onConfirm={handleDelete}
                itemName={selectedPackage?.name || ""}
                itemType="Package"
            />
        </div >
    );
}

// Package Create/Edit Modal Component
function PackageModal({
    isOpen,
    onClose,
    onSave,
    package_,
    allCategories,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    package_?: Package | null;
    allCategories: { id: string; name: string }[];
}) {
    const [formData, setFormData] = useState({
        name: package_?.name || "",
        description: package_?.description || "",
        category: package_?.category || "WEB_DESIGN",
        price: package_?.price?.toString() || "",
        features: package_?.features ? JSON.parse(package_.features).join("\n") : "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const featuresArray = formData.features
            .split("\n")
            .map((f: string) => f.trim())
            .filter((f: string) => f);

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            features: featuresArray,
            ...(package_ && { id: package_.id }),
        };

        try {
            const method = package_ ? "PUT" : "POST";
            await fetch("/api/packages", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to save package:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-obsidian-saturated rounded-[3rem] shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-white/10">
                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">
                        {package_ ? "Reconfigure Node" : "Initialize Service Node"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">
                                Node Identifier
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., SEO_PROTOCOL_ALPHA"
                                className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase text-xs tracking-widest placeholder:text-zinc-900"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">
                                System Category
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-orange-500 font-black uppercase text-xs tracking-widest appearance-none"
                            >
                                {allCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id} className="bg-black text-white">
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">
                            Credit Requirement ($)
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            className="w-full bg-black border border-white/5 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black text-3xl tracking-widest placeholder:text-zinc-900"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">
                            Operational Description
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief service specification..."
                            className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-zinc-500 font-bold uppercase text-[10px] tracking-widest resize-none placeholder:text-zinc-900"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">
                            Service Features (one per line)
                        </label>
                        <textarea
                            rows={6}
                            value={formData.features}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            placeholder="FEATURE_01&#10;FEATURE_02&#10;FEATURE_03"
                            className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-orange-500/80 font-black uppercase text-[10px] tracking-[0.2em] resize-none placeholder:text-zinc-900"
                        />
                    </div>

                    <div className="flex items-center space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-black/40 border border-white/5 text-zinc-700 hover:text-orange-500 font-black uppercase text-xs tracking-widest py-4 px-6 rounded-2xl transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-widest py-4 px-6 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)]"
                        >
                            {package_ ? "Execute Manual Update" : "Authorize Node Initialization"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
