"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    ChevronRight,
    ChevronLeft,
    Save,
    Eye,
    Download,
    Palette,
    Type,
    Package as PackageIcon,
    FileSignature,
    Sparkles,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichEditor } from "@/components/proposal/rich-editor";
import { PackageSelector } from "@/components/proposal/package-selector";
import { HexColorPicker } from "react-colorful";

const STEPS = [
    { id: 1, name: "Basics", icon: FileText },
    { id: 2, name: "Branding", icon: Palette },
    { id: 3, name: "Content", icon: Type },
    { id: 4, name: "Packages", icon: PackageIcon },
    { id: 5, name: "Terms", icon: FileSignature },
    { id: 6, name: "Preview", icon: Eye },
];

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}

interface SelectedPackage {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    features: string;
    quantity: number;
}

export default function CreateProposalPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [brandingSettings, setBrandingSettings] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        leadId: "",
        type: "WEBSITE",
        proposalDate: new Date().toISOString().split('T')[0],
        content: "",
        customFields: {} as Record<string, string>,
        brandLogo: "",
        brandColors: {
            primary: "#9333ea",
            secondary: "#6366f1",
            accent: "#8b5cf6",
        },
        headerText: "",
        footerText: "",
        terms: "",
        notes: "",
        signature: "",
    });

    const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
        fetchBrandingSettings();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/leads");
            const data = await res.json();
            setLeads(data || []);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        }
    };

    const fetchBrandingSettings = async () => {
        try {
            const res = await fetch("/api/settings/branding");
            const data = await res.json();
            setBrandingSettings(data);

            // Pre-fill branding data
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    brandLogo: data.logoUrl || "",
                    brandColors: {
                        primary: data.primaryColor || "#9333ea",
                        secondary: data.secondaryColor || "#6366f1",
                        accent: data.accentColor || "#8b5cf6",
                    },
                    headerText: data.defaultHeader || "",
                    footerText: data.defaultFooter || "",
                    terms: data.defaultTerms || "",
                }));
            }
        } catch (error) {
            console.error("Failed to fetch branding settings:", error);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            const totalValue = selectedPackages.reduce((sum, pkg) => sum + (pkg.price * pkg.quantity), 0);

            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    value: totalValue,
                    status: "DRAFT",
                    packages: selectedPackages.map(pkg => ({
                        packageId: pkg.id,
                        quantity: pkg.quantity,
                        price: pkg.price,
                    })),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/proposals/${data.id}`);
            }
        } catch (error) {
            console.error("Failed to save proposal:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const totalValue = selectedPackages.reduce((sum, pkg) => sum + (pkg.price * pkg.quantity), 0);

            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    value: totalValue,
                    status: "SENT",
                    packages: selectedPackages.map(pkg => ({
                        packageId: pkg.id,
                        quantity: pkg.quantity,
                        price: pkg.price,
                    })),
                }),
            });

            if (res.ok) {
                router.push("/proposals");
            }
        } catch (error) {
            console.error("Failed to create proposal:", error);
        } finally {
            setSaving(false);
        }
    };

    const totalValue = selectedPackages.reduce((sum, pkg) => sum + (pkg.price * pkg.quantity), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Create Proposal</h1>
                    <p className="text-zinc-500 mt-1">Build a professional, branded proposal in 6 easy steps</p>
                </div>
                <button
                    onClick={handleSaveDraft}
                    disabled={saving || !formData.name || !formData.leadId}
                    className="flex items-center space-x-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl transition-all font-bold disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    <span>Save Draft</span>
                </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {STEPS.map((step, idx) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all",
                                    currentStep >= step.id
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                        : "bg-zinc-100 text-zinc-400"
                                )}
                            >
                                {currentStep > step.id ? (
                                    <Check className="h-6 w-6" />
                                ) : (
                                    <step.icon className="h-6 w-6" />
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-bold mt-2 transition-colors",
                                currentStep >= step.id ? "text-purple-600" : "text-zinc-400"
                            )}>
                                {step.name}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={cn(
                                "h-1 flex-1 mx-2 rounded-full transition-colors",
                                currentStep > step.id ? "bg-purple-600" : "bg-zinc-100"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                {/* Step 1: Basics */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Basic Information</h2>
                            <p className="text-zinc-500">Start with the essential details for your proposal</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Proposal Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Website Redesign Proposal"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Client/Lead *
                                </label>
                                <select
                                    required
                                    value={formData.leadId}
                                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                >
                                    <option value="">Select a client...</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Proposal Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                >
                                    <option value="WEBSITE">Website</option>
                                    <option value="SOCIAL_MEDIA">Social Media</option>
                                    <option value="SEO">SEO</option>
                                    <option value="BRANDING">Branding</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Proposal Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.proposalDate}
                                    onChange={(e) => setFormData({ ...formData, proposalDate: e.target.value })}
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Branding */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Branding & Customization</h2>
                            <p className="text-zinc-500">Customize the look and feel of your proposal</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Company Logo URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.brandLogo}
                                    onChange={(e) => setFormData({ ...formData, brandLogo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                />
                                {formData.brandLogo && (
                                    <div className="mt-2 p-4 bg-zinc-50 rounded-xl">
                                        <img src={formData.brandLogo} alt="Logo preview" className="h-16 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Brand Colors
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['primary', 'secondary', 'accent'] as const).map((colorKey) => (
                                        <div key={colorKey} className="space-y-2">
                                            <p className="text-xs font-bold text-zinc-500 capitalize">{colorKey}</p>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowColorPicker(showColorPicker === colorKey ? null : colorKey)}
                                                    className="w-full h-12 rounded-xl border-2 border-zinc-200 transition-all hover:scale-105"
                                                    style={{ backgroundColor: formData.brandColors[colorKey] }}
                                                />
                                                {showColorPicker === colorKey && (
                                                    <div className="absolute z-10 mt-2">
                                                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                                                        <div className="relative">
                                                            <HexColorPicker
                                                                color={formData.brandColors[colorKey]}
                                                                onChange={(color) => setFormData({
                                                                    ...formData,
                                                                    brandColors: { ...formData.brandColors, [colorKey]: color }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Content */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Proposal Content</h2>
                            <p className="text-zinc-500">Write the main body of your proposal</p>
                        </div>

                        <RichEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                            placeholder="Start writing your proposal content..."
                            className="min-h-[400px]"
                        />
                    </div>
                )}

                {/* Step 4: Packages */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Select Packages</h2>
                            <p className="text-zinc-500">Add service packages to your proposal</p>
                        </div>

                        <PackageSelector
                            selectedPackages={selectedPackages}
                            onChange={setSelectedPackages}
                        />
                    </div>
                )}

                {/* Step 5: Terms */}
                {currentStep === 5 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Terms & Signature</h2>
                            <p className="text-zinc-500">Add terms, conditions, and signature</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Terms & Conditions
                                </label>
                                <textarea
                                    rows={6}
                                    value={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                    placeholder="Enter terms and conditions..."
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Signature
                                </label>
                                <input
                                    type="text"
                                    value={formData.signature}
                                    onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                                    placeholder="Your name or company name"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Internal Notes (Not visible to client)
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add internal notes..."
                                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Preview */}
                {currentStep === 6 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Preview & Submit</h2>
                            <p className="text-zinc-500">Review your proposal before sending</p>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl p-8 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900">{formData.name}</h3>
                                    <p className="text-zinc-500 mt-1">
                                        {leads.find(l => l.id === formData.leadId)?.name}
                                    </p>
                                </div>
                                {formData.brandLogo && (
                                    <img src={formData.brandLogo} alt="Logo" className="h-16 object-contain" />
                                )}
                            </div>

                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />

                            {selectedPackages.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-black text-zinc-900">Packages</h4>
                                    {selectedPackages.map((pkg) => (
                                        <div key={pkg.id} className="flex justify-between items-center p-4 bg-white rounded-xl">
                                            <div>
                                                <p className="font-bold">{pkg.name}</p>
                                                <p className="text-sm text-zinc-500">Quantity: {pkg.quantity}</p>
                                            </div>
                                            <p className="font-black">${(pkg.price * pkg.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-4 bg-zinc-900 text-white rounded-xl">
                                        <p className="font-black">Total</p>
                                        <p className="text-2xl font-black">${totalValue.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            {formData.terms && (
                                <div className="space-y-2">
                                    <h4 className="font-black text-zinc-900">Terms & Conditions</h4>
                                    <p className="text-sm text-zinc-600 whitespace-pre-wrap">{formData.terms}</p>
                                </div>
                            )}

                            {formData.signature && (
                                <div className="pt-4 border-t border-zinc-200">
                                    <p className="text-sm text-zinc-500">Signature:</p>
                                    <p className="font-black text-zinc-900 text-xl">{formData.signature}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-xl transition-all font-bold disabled:opacity-30"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Previous</span>
                </button>

                {currentStep < 6 ? (
                    <button
                        onClick={nextStep}
                        disabled={currentStep === 1 && (!formData.name || !formData.leadId)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
                    >
                        <span>Next Step</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
                    >
                        <Sparkles className="h-5 w-5" />
                        <span>{saving ? "Sending..." : "Send Proposal"}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
