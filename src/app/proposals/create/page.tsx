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
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichEditor } from "@/components/proposal/rich-editor";
import { PackageSelector } from "@/components/proposal/package-selector";
import { HexColorPicker } from "react-colorful";
import { PaymentScheduleBuilder, type PaymentMilestone } from "@/components/proposal/payment-schedule-builder";

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
        clientLogo: "",
        clientBrandColors: {
            primary: "#64748b",
            secondary: "#94a3b8",
            accent: "#cbd5e1",
        },
        headerText: "",
        footerText: "",
        terms: "",
        notes: "",
        signature: "",
        paymentTerms: { schedule: [] as PaymentMilestone[] },
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
                    paymentTerms: formData.paymentTerms,
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
                    paymentTerms: formData.paymentTerms,
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
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Create Proposal 2.1</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Create <span className="text-orange-500">Proposal</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg">Engineer a high-fidelity, obsidian-branded business mandate.</p>
                </div>
                <button
                    onClick={handleSaveDraft}
                    disabled={saving || !formData.name || !formData.leadId}
                    className="flex items-center space-x-3 bg-zinc-950 text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 px-8 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] border border-white/5 disabled:opacity-30 group"
                >
                    <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Store Draft</span>
                </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between gap-4 px-4 overflow-x-auto pb-4 scrollbar-hide">
                {STEPS.map((step, idx) => (
                    <div key={step.id} className="flex items-center flex-1 min-w-[120px]">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "h-16 w-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 border relative overflow-hidden",
                                    currentStep >= step.id
                                        ? "bg-orange-600 text-black border-orange-500 shadow-[0_0_30px_-5px_rgba(255,122,0,0.4)]"
                                        : "bg-zinc-950 text-zinc-700 border-white/5"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-20" />
                                {currentStep > step.id ? (
                                    <Check className="h-7 w-7" />
                                ) : (
                                    <step.icon className="h-7 w-7" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[9px] font-black mt-4 uppercase tracking-[0.3em] transition-colors",
                                currentStep >= step.id ? "text-orange-500" : "text-zinc-800"
                            )}>
                                {step.name}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={cn(
                                "h-px flex-1 mx-4 transition-all duration-700",
                                currentStep > step.id ? "bg-orange-500/50" : "bg-white/5"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden isolate hover:glow-orange transition-all duration-1000">
                <div className="absolute inset-0 bg-zinc-950/20 -z-10" />

                {/* Step 1: Basics */}
                {currentStep === 1 && (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                Strategic <span className="text-orange-500">Core</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </h2>
                            <p className="text-zinc-500 font-bold">Initialize the primary mandate parameters.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Mandate Designation *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., ARCHITECTURAL REDESIGN PROTOCOL"
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold placeholder:text-zinc-800 shadow-inner"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Target Entity *
                                </label>
                                <select
                                    required
                                    value={formData.leadId}
                                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold shadow-inner"
                                >
                                    <option value="" className="bg-zinc-950">Select Target Entity...</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id} className="bg-zinc-950 text-white">
                                            {lead.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Proposal Classification
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold shadow-inner"
                                >
                                    <option value="WEBSITE" className="bg-zinc-950">WEB DESIGN</option>
                                    <option value="SOCIAL_MEDIA" className="bg-zinc-950">SOCIAL MEDIA</option>
                                    <option value="SEO" className="bg-zinc-950">SEO SERVICES</option>
                                    <option value="BRANDING" className="bg-zinc-950">BRANDING SERVICES</option>
                                    <option value="OTHER" className="bg-zinc-950">CUSTOM TYPE</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                    Proposal Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.proposalDate}
                                    onChange={(e) => setFormData({ ...formData, proposalDate: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Branding */}
                {currentStep === 2 && (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Company Branding */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                                        Vault <span className="text-orange-500">Identity</span>
                                        <Sparkles className="h-5 w-5 text-orange-600 animate-pulse" />
                                    </h3>
                                    <p className="text-zinc-600 text-xs font-bold leading-relaxed">Embed your internal tactical identifiers.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                        Source Interface (Logo URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brandLogo}
                                        onChange={(e) => setFormData({ ...formData, brandLogo: e.target.value })}
                                        placeholder="https://vault.internal/identity.png"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold shadow-inner"
                                    />
                                    {formData.brandLogo && (
                                        <div className="mt-4 p-8 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner flex items-center justify-center">
                                            <img src={formData.brandLogo} alt="Identity preview" className="h-16 object-contain filter drop-shadow-[0_0_10px_rgba(255,100,0,0.2)]" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                        Tactical Color Spectrum
                                    </label>
                                    <div className="grid grid-cols-3 gap-6">
                                        {(['primary', 'secondary', 'accent'] as const).map((colorKey) => (
                                            <div key={colorKey} className="space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowColorPicker(`brand-${colorKey}`)}
                                                    className="w-full h-16 rounded-2xl border-2 border-white/5 transition-all hover:scale-105 shadow-2xl relative overflow-hidden group"
                                                    style={{ backgroundColor: formData.brandColors[colorKey] }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </button>
                                                <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest text-center block uppercase italic">{colorKey}</span>
                                                {showColorPicker === `brand-${colorKey}` && (
                                                    <div className="absolute z-50 mt-4">
                                                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                                                        <div className="relative bg-zinc-950 p-6 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10">
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
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Client Branding */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                                        Target <span className="text-orange-500">Surface</span>
                                        <User className="h-5 w-5 text-zinc-700" />
                                    </h3>
                                    <p className="text-zinc-600 text-xs font-bold leading-relaxed">Map the target entity's brand markers.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                        Surface Interface (Client Logo)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.clientLogo}
                                        onChange={(e) => setFormData({ ...formData, clientLogo: e.target.value })}
                                        placeholder="https://entity.target/identity.png"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold shadow-inner"
                                    />
                                    {formData.clientLogo && (
                                        <div className="mt-4 p-8 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner flex items-center justify-center">
                                            <img src={formData.clientLogo} alt="Target preview" className="h-16 object-contain" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                        Target Spectrum
                                    </label>
                                    <div className="grid grid-cols-3 gap-6">
                                        {(['primary', 'secondary', 'accent'] as const).map((colorKey) => (
                                            <div key={colorKey} className="space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowColorPicker(`client-${colorKey}`)}
                                                    className="w-full h-16 rounded-2xl border-2 border-white/5 transition-all hover:scale-105 shadow-2xl relative overflow-hidden group"
                                                    style={{ backgroundColor: formData.clientBrandColors[colorKey] }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </button>
                                                <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest text-center block uppercase italic">{colorKey}</span>
                                                {showColorPicker === `client-${colorKey}` && (
                                                    <div className="absolute z-50 mt-4">
                                                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                                                        <div className="relative bg-zinc-950 p-6 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10">
                                                            <HexColorPicker
                                                                color={formData.clientBrandColors[colorKey]}
                                                                onChange={(color) => setFormData({
                                                                    ...formData,
                                                                    clientBrandColors: { ...formData.clientBrandColors, [colorKey]: color }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Content */}
                {currentStep === 3 && (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                Narrative <span className="text-orange-500">Core</span>
                                <Type className="h-6 w-6 text-orange-600" />
                            </h2>
                            <p className="text-zinc-500 font-bold">Construct the business mandate articulation.</p>
                        </div>

                        <div className="glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                            <RichEditor
                                content={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Constructing mandate details..."
                                className="min-h-[400px] bg-zinc-950/40"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Packages */}
                {currentStep === 4 && (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                Service <span className="text-orange-500">Details</span>
                                <PackageIcon className="h-6 w-6 text-orange-600" />
                            </h2>
                            <p className="text-zinc-500 font-bold">Encapsulate tactical service modules.</p>
                        </div>

                        <div className="glass-premium rounded-[2.5rem] border border-white/5 p-4 shadow-inner">
                            <PackageSelector
                                selectedPackages={selectedPackages}
                                onChange={setSelectedPackages}
                            />
                        </div>
                    </div>
                )}

                {/* Step 5: Terms */}
                {currentStep === 5 && (
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                Fiscal <span className="text-orange-500">Terms</span>
                                <FileSignature className="h-6 w-6 text-orange-600" />
                            </h2>
                            <p className="text-zinc-500 font-bold">Define disbursement schedule and liability protocols.</p>
                        </div>

                        <div className="space-y-12">
                            <div className="glass-premium rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[80px] -z-10" />
                                <PaymentScheduleBuilder
                                    paymentTerms={formData.paymentTerms}
                                    onChange={(paymentTerms) => setFormData({ ...formData, paymentTerms })}
                                    totalValue={totalValue}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                        Mandate Liability (Terms)
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={formData.terms}
                                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                        placeholder="Articulate legal and technical protocols..."
                                        className="w-full bg-zinc-950 border border-white/10 rounded-[2rem] py-6 px-8 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold resize-none shadow-inner"
                                    />
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                            Strategic Signature
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.signature}
                                            onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                                            placeholder="CRYPTOGRAPHIC IDENTIFIER / NAME"
                                            className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-black italic shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-2">
                                            Internal Cipher (Private Notes)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Encrypted tactical briefing..."
                                            className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-zinc-500 font-bold resize-none shadow-inner italic"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Preview */}
                {currentStep === 6 && (
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                Mandate <span className="text-orange-500">Preview</span>
                                <Eye className="h-6 w-6 text-orange-600 shadow-[0_0_15px_rgba(255,100,0,0.5)]" />
                            </h2>
                            <p className="text-zinc-500 font-bold">Audit the finalized business ledger before deployment.</p>
                        </div>

                        <div className="bg-[#0A0A0A] rounded-[3.5rem] p-12 border border-white/5 space-y-12 shadow-[0_0_80px_rgba(0,0,0,1)] relative overflow-hidden group hover:border-orange-500/20 transition-all duration-1000">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/[0.02] blur-[150px] -z-10" />

                            <div className="flex flex-col md:flex-row items-start justify-between gap-8 border-b border-white/5 pb-12">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase">{formData.name}</h3>
                                    <p className="text-orange-500 font-black text-sm tracking-[0.3em] uppercase">
                                        TARGET: {leads.find(l => l.id === formData.leadId)?.name || "UNDEFINED ENTITY"}
                                    </p>
                                </div>
                                {formData.brandLogo && (
                                    <img src={formData.brandLogo} alt="Identity" className="h-20 object-contain filter drop-shadow-[0_0_15px_rgba(255,100,0,0.2)]" />
                                )}
                            </div>

                            <div className="prose prose-invert prose-orange max-w-none prose-p:font-bold prose-p:text-zinc-500" dangerouslySetInnerHTML={{ __html: formData.content }} />

                            {selectedPackages.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Service Spectrum</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <div className="grid gap-4">
                                        {selectedPackages.map((pkg) => (
                                            <div key={pkg.id} className="flex justify-between items-center p-8 bg-zinc-950/60 rounded-3xl border border-white/5 shadow-inner hover:border-orange-500/20 transition-all">
                                                <div>
                                                    <p className="text-white font-black text-lg italic tracking-tight uppercase leading-none mb-1">{pkg.name}</p>
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Quantity Factor: {pkg.quantity}</p>
                                                </div>
                                                <p className="text-2xl font-black text-white tracking-tighter">
                                                    <span className="text-[10px] text-orange-600 mr-2 italic">$</span>
                                                    {(pkg.price * pkg.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center p-10 bg-orange-600 text-black rounded-[2.5rem] shadow-[0_0_50px_-10px_rgba(255,122,0,0.4)]">
                                            <p className="font-black text-xs uppercase tracking-[0.4em] italic">Total Amount</p>
                                            <p className="text-5xl font-black tracking-tighter italic">$ {totalValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.paymentTerms?.schedule?.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Disbursement Log</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.paymentTerms.schedule.map((milestone: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-6 bg-zinc-950/40 rounded-2xl border border-white/5 shadow-inner">
                                                <div className="space-y-1">
                                                    <p className="text-white font-black text-sm italic uppercase tracking-tight">{milestone.milestone}</p>
                                                    <p className="text-[9px] text-orange-600 font-black uppercase tracking-[0.2em]">{milestone.percentage}% FACTOR</p>
                                                </div>
                                                <p className="text-lg font-black text-white italic tracking-tighter">$ {milestone.amount?.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.terms && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Technical Terms</span>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                    <p className="text-sm text-zinc-600 font-bold whitespace-pre-wrap leading-relaxed px-4 border-l-2 border-orange-600/30">{formData.terms}</p>
                                </div>
                            )}

                            {formData.signature && (
                                <div className="pt-12 border-t border-white/5 flex flex-col items-end">
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-4 italic">Strategic Authorization</p>
                                    <p className="font-black text-white text-4xl tracking-tighter uppercase italic py-4 px-10 bg-zinc-950 rounded-2xl shadow-inner border border-white/5">{formData.signature}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-6 pb-24">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-3 bg-zinc-950 text-zinc-600 hover:text-white hover:bg-zinc-900 px-10 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.3em] border border-white/5 disabled:opacity-20 flex-1 sm:flex-none justify-center"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Rollback</span>
                </button>

                {currentStep < 6 ? (
                    <button
                        onClick={nextStep}
                        disabled={currentStep === 1 && (!formData.name || !formData.leadId)}
                        className="flex items-center space-x-3 bg-orange-600 text-black hover:bg-orange-500 px-12 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.05] flex-1 sm:flex-none justify-center"
                    >
                        <span>Continue</span>
                        <ChevronRight className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center space-x-3 bg-orange-600 text-black hover:bg-orange-500 px-16 py-6 rounded-[2rem] transition-all font-black text-sm uppercase tracking-[0.4em] shadow-[0_0_60px_-10px_rgba(255,122,0,0.6)] hover:scale-[1.05] relative overflow-hidden flex-1 sm:flex-none justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                        <Sparkles className="h-6 w-6" />
                        <span>{saving ? "Deploying..." : "Finalize Deployment"}</span>
                    </button>
                )}
            </div>
        </div >
    );
}
