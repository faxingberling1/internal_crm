"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-context";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

const CATEGORIES = [
    { id: "ALL", name: "All Packages", color: "text-zinc-600", bg: "bg-zinc-100" },
    { id: "WEB_DESIGN", name: "Web Design", color: "text-blue-600", bg: "bg-blue-100" },
    { id: "SEO", name: "SEO Services", color: "text-green-600", bg: "bg-green-100" },
    { id: "MARKETING", name: "Digital Marketing", color: "text-purple-600", bg: "bg-purple-100" },
    { id: "COPYWRITING", name: "Copywriting", color: "text-orange-600", bg: "bg-orange-100" },
    { id: "PORTAL_DESIGN", name: "Portal Design", color: "text-cyan-600", bg: "bg-cyan-100" },
    { id: "BRANDING", name: "Branding", color: "text-pink-600", bg: "bg-pink-100" },
    { id: "OTHER", name: "Other Services", color: "text-zinc-600", bg: "bg-zinc-100" },
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
        { label: "Total Packages", value: packages.length, icon: PackageIcon, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Active Services", value: packages.filter(p => p.isActive).length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
        { label: "Categories", value: new Set(packages.map(p => p.category)).size, icon: Tag, color: "text-blue-600", bg: "bg-blue-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                        Service Packages
                    </h2>
                    <p className="text-zinc-500 mt-1">
                        Manage your service offerings and pricing packages
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-xl hover:shadow-purple-500/20 font-bold"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Create Package</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="premium-card bg-white border border-zinc-100 p-6 flex items-center space-x-4">
                        <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                            "px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border",
                            selectedCategory === category.id
                                ? `${category.bg} ${category.color} border-current shadow-sm`
                                : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                        )}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search packages by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm text-zinc-900 shadow-sm"
                />
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-80 rounded-3xl bg-zinc-50 animate-pulse border border-zinc-100" />
                    ))
                ) : filteredPackages.length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                            <i className="mb-6 p-6 rounded-full bg-zinc-50 border border-zinc-100">
                                <PackageIcon className="h-12 w-12 text-zinc-300" />
                            </i>
                            <h3 className="text-xl font-bold text-zinc-900">No packages found</h3>
                            <p className="text-zinc-500 mt-2">
                                {isAdmin
                                    ? "Create your first service package to get started"
                                    : "No packages available at the moment"}
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredPackages.map((pkg) => {
                        const category = CATEGORIES.find((c) => c.id === pkg.category);
                        const features = pkg.features ? JSON.parse(pkg.features) : [];

                        return (
                            <div
                                key={pkg.id}
                                className="premium-card card-purple flex flex-col h-full hover:scale-[1.02] transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm",
                                            category?.bg,
                                            category?.color,
                                            "border-current"
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
                                                className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPackage(pkg);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-xl font-black text-zinc-900 group-hover:text-purple-600 transition-colors leading-tight mb-2 tracking-tight">
                                    {pkg.name}
                                </h4>

                                <p className="text-sm text-zinc-500 mb-4 leading-relaxed flex-grow">
                                    {pkg.description}
                                </p>

                                {features.length > 0 && (
                                    <div className="space-y-2 mb-6">
                                        {features.slice(0, 4).map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start space-x-2">
                                                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-zinc-600 font-medium">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                        {features.length > 4 && (
                                            <p className="text-xs text-zinc-400 font-bold ml-6">
                                                +{features.length - 4} more features
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-zinc-50">
                                    <div className="flex items-center text-3xl font-black text-zinc-900">
                                        <DollarSign className="h-6 w-6 mr-0.5 text-green-600" />
                                        {pkg.price.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                                        Starting Price
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <PackageModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingPackage(null);
                    }}
                    onSave={fetchPackages}
                    package_={editingPackage}
                />
            )}

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
        </div>
    );
}

// Package Create/Edit Modal Component
function PackageModal({
    isOpen,
    onClose,
    onSave,
    package_,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    package_?: Package | null;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h3 className="text-2xl font-black text-zinc-900">
                        {package_ ? "Edit Package" : "Create New Package"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Package Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Premium SEO Package"
                                className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                Category
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                            >
                                {CATEGORIES.filter((c) => c.id !== "ALL").map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-bold text-2xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Description
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the package..."
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Features (one per line)
                        </label>
                        <textarea
                            rows={6}
                            value={formData.features}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-3 px-6 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                        >
                            {package_ ? "Update Package" : "Create Package"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
