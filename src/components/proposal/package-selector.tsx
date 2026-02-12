"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Package as PackageIcon, DollarSign, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Package {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    features: string;
}

interface SelectedPackage extends Package {
    quantity: number;
}

interface PackageSelectorProps {
    selectedPackages: SelectedPackage[];
    onChange: (packages: SelectedPackage[]) => void;
}

const CATEGORIES = [
    { id: "ALL", name: "All" },
    { id: "WEB_DESIGN", name: "Web Design" },
    { id: "SEO", name: "SEO" },
    { id: "MARKETING", name: "Marketing" },
    { id: "COPYWRITING", name: "Copywriting" },
    { id: "PORTAL_DESIGN", name: "Portal Design" },
    { id: "BRANDING", name: "Branding" },
    { id: "OTHER", name: "Other" },
];

export function PackageSelector({ selectedPackages, onChange }: PackageSelectorProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            setPackages(data || []);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPackages = packages.filter((pkg) => {
        const matchesCategory = selectedCategory === 'ALL' || pkg.category === selectedCategory;
        const matchesSearch =
            pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addPackage = (pkg: Package) => {
        const existing = selectedPackages.find(p => p.id === pkg.id);
        if (existing) {
            onChange(selectedPackages.map(p =>
                p.id === pkg.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            onChange([...selectedPackages, { ...pkg, quantity: 1 }]);
        }
    };

    const removePackage = (pkgId: string) => {
        onChange(selectedPackages.filter(p => p.id !== pkgId));
    };

    const updateQuantity = (pkgId: string, quantity: number) => {
        if (quantity < 1) {
            removePackage(pkgId);
        } else {
            onChange(selectedPackages.map(p =>
                p.id === pkgId ? { ...p, quantity } : p
            ));
        }
    };

    const totalValue = selectedPackages.reduce((sum, pkg) => sum + (pkg.price * pkg.quantity), 0);

    return (
        <div className="space-y-6">
            {/* Search and Filter */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                    />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                'px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border',
                                selectedCategory === category.id
                                    ? 'bg-purple-100 text-purple-600 border-purple-200'
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Available Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {loading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-2xl bg-zinc-50 animate-pulse" />
                    ))
                ) : filteredPackages.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <PackageIcon className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium">No packages found</p>
                    </div>
                ) : (
                    filteredPackages.map((pkg) => {
                        const features = pkg.features ? JSON.parse(pkg.features) : [];
                        const isSelected = selectedPackages.some(p => p.id === pkg.id);

                        return (
                            <div
                                key={pkg.id}
                                className={cn(
                                    'p-4 rounded-2xl border transition-all cursor-pointer',
                                    isSelected
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-white border-zinc-200 hover:border-purple-200'
                                )}
                                onClick={() => !isSelected && addPackage(pkg)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-black text-sm text-zinc-900">{pkg.name}</h4>
                                    <div className="flex items-center text-lg font-black text-zinc-900">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        {pkg.price.toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{pkg.description}</p>
                                {features.length > 0 && (
                                    <div className="space-y-1">
                                        {features.slice(0, 2).map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start space-x-1">
                                                <Sparkles className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-zinc-600 line-clamp-1">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isSelected && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addPackage(pkg);
                                        }}
                                        className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span>Add to Proposal</span>
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Selected Packages */}
            {selectedPackages.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Selected Packages</h3>
                    <div className="space-y-2">
                        {selectedPackages.map((pkg) => (
                            <div key={pkg.id} className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                                <div className="flex-1">
                                    <p className="font-black text-sm text-zinc-900">{pkg.name}</p>
                                    <p className="text-xs text-zinc-500">${pkg.price.toLocaleString()} each</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => updateQuantity(pkg.id, pkg.quantity - 1)}
                                            className="p-1 rounded-lg bg-white hover:bg-zinc-100 transition-colors"
                                        >
                                            <Minus className="h-4 w-4 text-zinc-600" />
                                        </button>
                                        <span className="font-black text-sm w-8 text-center">{pkg.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(pkg.id, pkg.quantity + 1)}
                                            className="p-1 rounded-lg bg-white hover:bg-zinc-100 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-zinc-600" />
                                        </button>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="font-black text-sm text-zinc-900">
                                            ${(pkg.price * pkg.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl">
                        <span className="font-black text-white uppercase tracking-wider text-sm">Total Value</span>
                        <span className="font-black text-2xl text-white">${totalValue.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
