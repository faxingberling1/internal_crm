"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Monitor,
    Shield,
    FileSignature,
    PenTool,
    Target,
    Zap,
    DollarSign,
    Save,
    Upload,
    Calendar,
    Stamp,
    Image as ImageIcon,
    Type,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROPOSAL_TEMPLATES } from "@/lib/templates";

const SERVICE_TYPES = [
    { id: "LOGO_DESIGN", name: "Logo Design", icon: PenTool, color: "text-orange-600", bg: "bg-orange-100", glow: "card-blue", description: "Brand identity and emblem creation." },
    { id: "WEB_DESIGN", name: "Web Design", icon: Monitor, color: "text-blue-600", bg: "bg-blue-100", glow: "card-blue", description: "Custom UI/UX and website development." },
    { id: "SEO", name: "SEO Optimization", icon: Target, color: "text-green-600", bg: "bg-green-100", glow: "card-green", description: "Search engine ranking and visibility." },
    { id: "DIGITAL_MARKETING", name: "Digital Marketing", icon: Zap, color: "text-purple-600", bg: "bg-purple-100", glow: "card-purple", description: "Social media and online ad campaigns." },
    { id: "NDA", name: "NDA", icon: Shield, color: "text-red-600", bg: "bg-red-100", glow: "card-blue", description: "Non-disclosure agreement for project safety." },
    { id: "AGREEMENTS", name: "Master Agreement", icon: FileSignature, color: "text-zinc-600", bg: "bg-zinc-100", glow: "card-purple", description: "Standard service level agreements." },
];

export default function CreateProposalPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [leads, setLeads] = useState<any[]>([]);
    const [mode, setMode] = useState<"TEMPLATE" | "UPLOAD">("TEMPLATE");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        leadId: "",
        type: "",
        value: "",
        content: "",
        status: "DRAFT",
        brandLogo: "",
        signature: "",
        date: new Date().toISOString().split('T')[0],
        uploadedFile: null as File | null
    });

    useEffect(() => {
        fetch("/api/leads")
            .then(res => res.json())
            .then(data => {
                setLeads(data || []);
            });
    }, []);

    const handleTypeSelect = (typeId: string) => {
        const template = (PROPOSAL_TEMPLATES as any)[typeId];
        setFormData({
            ...formData,
            type: typeId,
            name: template?.title || formData.name,
            content: template?.content || formData.content,
            value: template?.value?.toString() || formData.value
        });
        nextStep();
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                router.push("/proposals");
            }
        } catch (error) {
            console.error("Failed to save proposal:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900">Impactful Proposals</h2>
                    <p className="text-zinc-500 mt-2 font-medium">Drafting the future of your business partnerships.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-xl shadow-inner">
                    <button
                        onClick={() => setMode("TEMPLATE")}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            mode === "TEMPLATE" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                        )}
                    >
                        Templates
                    </button>
                    <button
                        onClick={() => setMode("UPLOAD")}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            mode === "UPLOAD" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                        )}
                    >
                        Upload Document
                    </button>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-4">
                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex items-center flex-1 last:flex-none">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm border",
                            step >= num ? "bg-purple-600 text-white border-purple-500 shadow-purple-500/20" : "bg-white text-zinc-400 border-zinc-100"
                        )}>
                            {step > num ? <CheckCircle2 className="h-6 w-6" /> : num}
                        </div>
                        {num < 4 && (
                            <div className={cn(
                                "flex-1 h-1 mx-4 rounded-full transition-all",
                                step > num ? "bg-purple-600" : "bg-zinc-100"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[500px]">
                {step === 1 && mode === "TEMPLATE" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Step 1: Choose Your Template</h3>
                            <p className="text-zinc-500 font-medium mt-1">Starting with a professional base ensures consistency and impact.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SERVICE_TYPES.map((type) => (
                                <div
                                    key={type.id}
                                    onClick={() => handleTypeSelect(type.id)}
                                    className={cn(
                                        "premium-card group cursor-pointer transition-all border-zinc-100 hover:border-purple-200 p-8",
                                        formData.type === type.id ? "ring-2 ring-purple-600 shadow-2xl scale-[1.02]" : "",
                                        type.glow
                                    )}
                                >
                                    <div className={cn("p-4 rounded-3xl w-fit mb-6 shadow-sm", type.bg, type.color)}>
                                        <type.icon className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-xl font-black text-zinc-900 tracking-tight">{type.name}</h4>
                                    <p className="text-sm text-zinc-500 mt-3 leading-relaxed font-medium">{type.description}</p>
                                    <div className="mt-6 flex items-center text-purple-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        Use Template <ChevronRight className="ml-1 h-3 w-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 && mode === "UPLOAD" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Step 1: Upload Existing Proposal</h3>
                            <p className="text-zinc-500 font-medium mt-1">Easily digitize and track your external documents.</p>
                        </div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="premium-card border-2 border-dashed border-zinc-200 bg-zinc-50 py-24 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-all text-center"
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFormData({ ...formData, uploadedFile: e.target.files[0], type: "UPLOADED" });
                                        nextStep();
                                    }
                                }}
                            />
                            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-purple-600">
                                <Upload className="h-10 w-10" />
                            </div>
                            <h4 className="text-xl font-black text-zinc-900">Drop your file here</h4>
                            <p className="text-zinc-500 font-medium mt-2">Support for PDF, DOCX, and high-res Images.</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Step 2: Client & Identity</h3>
                            <p className="text-zinc-500 font-medium mt-1">Personalize the proposal with client details and your branding.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Proposal Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                        <input
                                            type="text"
                                            placeholder="e.g., Q1 Brand Identity Overhaul"
                                            className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-bold text-lg shadow-sm"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Client Selection</label>
                                    <div className="relative">
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                        <select
                                            className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-bold text-lg shadow-sm appearance-none"
                                            value={formData.leadId}
                                            onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                                        >
                                            <option value="">Choose a lead...</option>
                                            {leads.map((lead: any) => (
                                                <option key={lead.id} value={lead.id}>{lead.name} • {lead.company || "Individual"}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Budget ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                        <input
                                            type="number"
                                            placeholder="Budget amount"
                                            className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-black text-2xl shadow-sm"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Brand Logo URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                        <input
                                            type="text"
                                            placeholder="https://logo-url.com/logo.png"
                                            className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-medium text-sm shadow-sm"
                                            value={formData.brandLogo}
                                            onChange={(e) => setFormData({ ...formData, brandLogo: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Step 3: Content Refining</h3>
                            <p className="text-zinc-500 font-medium mt-1">Modify the template to perfectly match your discussion.</p>
                        </div>
                        <div className="premium-card bg-white border border-zinc-100 p-0 overflow-hidden shadow-2xl">
                            <div className="bg-zinc-50 border-b border-zinc-100 px-8 py-3 flex items-center space-x-4">
                                <div className="flex space-x-1">
                                    <div className="h-3 w-3 rounded-full bg-zinc-200" />
                                    <div className="h-3 w-3 rounded-full bg-zinc-200" />
                                    <div className="h-3 w-3 rounded-full bg-zinc-200" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Document Editor</span>
                            </div>
                            <textarea
                                rows={15}
                                placeholder="Edit the proposal content here..."
                                className="w-full bg-white py-10 px-12 focus:ring-0 outline-none text-zinc-800 font-medium leading-relaxed resize-none text-lg"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Signature Line</label>
                                <div className="relative">
                                    <FileSignature className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                    <input
                                        type="text"
                                        placeholder="Enter name for signature"
                                        className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-medium shadow-sm"
                                        value={formData.signature}
                                        onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Proposal Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-zinc-200 rounded-3xl py-5 pl-12 pr-6 focus:ring-8 focus:ring-purple-500/5 transition-all outline-none text-zinc-900 font-medium shadow-sm"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Step 4: Impactful Preview</h3>
                            <p className="text-zinc-500 font-medium mt-1">This is how your client will experience your proposal.</p>
                        </div>

                        {/* High Fidelity Paper View */}
                        <div className="bg-zinc-200 p-12 rounded-[3rem] shadow-inner relative">
                            <div className="max-w-[800px] mx-auto bg-white shadow-2xl p-20 min-h-[1000px] flex flex-col relative overflow-hidden ring-1 ring-zinc-100">

                                {/* Aesthetic Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -ml-32 -mb-32" />

                                {/* Document Header */}
                                <div className="flex justify-between items-start mb-20 relative z-10">
                                    <div>
                                        {formData.brandLogo ? (
                                            <img src={formData.brandLogo} alt="Logo" className="h-16 object-contain mb-8" />
                                        ) : (
                                            <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-8">
                                                {formData.name.charAt(0)}
                                            </div>
                                        )}
                                        <h1 className="text-4xl font-black text-zinc-900 leading-tight tracking-tighter">
                                            {formData.name || "Business Proposal"}
                                        </h1>
                                        <p className="text-sm font-black text-purple-600 uppercase tracking-[0.2em] mt-2">
                                            Prepared for {leads.find((l: any) => l.id === formData.leadId)?.name || "Valued Client"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">{formData.date}</p>
                                        <div className="mt-8">
                                            <p className="text-3xl font-black text-zinc-900">${parseFloat(formData.value).toLocaleString()}</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Investment Total</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 space-y-12 relative z-10">
                                    <div className="prose prose-zinc max-w-none">
                                        <div className="whitespace-pre-wrap text-zinc-700 font-medium leading-relaxed text-lg">
                                            {formData.content || "Proposal content not defined."}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer & Signature */}
                                <div className="mt-20 pt-12 border-t border-zinc-100 flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Prepared By</p>
                                        <p className="font-black text-zinc-900">CRM Agent Operations</p>
                                        <p className="text-xs text-zinc-500 font-medium">Antigravity Internal Systems</p>
                                    </div>
                                    <div className="text-right">
                                        {formData.signature && (
                                            <div className="mb-4">
                                                <p className="signature-font text-4xl text-purple-600 animate-in fade-in slide-in-from-bottom-2">
                                                    {formData.signature}
                                                </p>
                                                <div className="w-48 h-0.5 bg-zinc-100 mt-2 ml-auto" />
                                            </div>
                                        )}
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client Signature</p>
                                    </div>
                                </div>

                                {/* Digital Stamp */}
                                <div className="absolute bottom-12 right-12 opacity-10">
                                    <Stamp className="h-24 w-24 text-zinc-900 rotate-12" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleSubmit}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-black py-5 px-10 rounded-[2rem] shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center space-x-3 text-lg"
                            >
                                <Save className="h-6 w-6" />
                                <span>Save & Transmit Proposal</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-12">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className={cn(
                        "flex items-center space-x-2 px-8 py-4 rounded-2xl font-black transition-all",
                        step === 1 ? "text-zinc-200 pointer-events-none" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Previous Phase</span>
                </button>
                {step < 4 && (
                    <button
                        onClick={nextStep}
                        className="flex items-center space-x-3 bg-zinc-900 hover:bg-black text-white px-10 py-4 rounded-[1.5rem] font-black transition-all shadow-2xl hover:shadow-zinc-900/20 active:scale-95"
                    >
                        <span>Advance to Next Step</span>
                        <ChevronRight className="h-6 w-6" />
                    </button>
                )}
            </div>

            <style jsx>{`
                .signature-font {
                    font-family: 'Dancing Script', cursive, sans-serif;
                }
            `}</style>
        </div>
    );
}
