"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Edit2,
    Trash2,
    DollarSign,
    Calendar,
    User,
    Mail,
    Phone,
    Building2,
    FileText,
    Package as PackageIcon,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Copy,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDocumentPDF } from "@/lib/pdf-generator";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

interface ProposalData {
    id: string;
    name: string;
    type: string;
    status: string;
    value: number;
    content: string;
    brandLogo?: string;
    signature?: string;
    proposalDate: string;
    brandColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    headerText?: string;
    footerText?: string;
    terms?: string;
    notes?: string;
    createdAt: string;
    lead: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        company?: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        package: {
            id: string;
            name: string;
            description?: string;
            category: string;
            features?: string;
        };
    }>;
}

export default function ProposalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [proposal, setProposal] = useState<ProposalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchProposal();
        }
    }, [params.id]);

    const fetchProposal = async () => {
        try {
            const res = await fetch(`/api/proposals/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setProposal(data);
            } else {
                router.push("/proposals");
            }
        } catch (error) {
            console.error("Failed to fetch proposal:", error);
            router.push("/proposals");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!proposal) return;
        setDownloading(true);
        try {
            // Transform proposal data to DocumentData format for the unified generator
            const docData: any = {
                ...proposal,
                type: 'PROPOSAL',
                content: {
                    projectOverview: proposal.content,
                    packages: proposal.items.map(item => ({
                        name: item.package.name,
                        description: item.package.description,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    objectives: [] // Proposals in this view don't seem to have objectives list
                }
            };

            const pdfBlob = await generateDocumentPDF(docData);
            const url = URL.createObjectURL(pdfBlob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = `${proposal.name.replace(/\s+/g, "_")}_${proposal.id.slice(-6)}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`/api/proposals/${params.id}`, {
                method: "DELETE",
            });
            router.push("/proposals");
        } catch (error) {
            console.error("Failed to delete proposal:", error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!proposal) return;
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/proposals/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setProposal({ ...proposal, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDuplicate = async () => {
        if (!proposal) return;
        try {
            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...proposal,
                    name: `${proposal.name} (Copy)`,
                    status: "DRAFT",
                    packages: proposal.items.map(item => ({
                        packageId: item.package.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                }),
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/proposals/${data.id}`);
            }
        } catch (error) {
            console.error("Failed to duplicate proposal:", error);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "SENT":
                return {
                    icon: Send,
                    color: "text-blue-700",
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                };
            case "ACCEPTED":
                return {
                    icon: CheckCircle2,
                    color: "text-green-700",
                    bg: "bg-green-50",
                    border: "border-green-200",
                };
            case "REJECTED":
                return {
                    icon: XCircle,
                    color: "text-red-700",
                    bg: "bg-red-50",
                    border: "border-red-200",
                };
            default:
                return {
                    icon: Clock,
                    color: "text-zinc-600",
                    bg: "bg-zinc-100",
                    border: "border-zinc-200",
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-2 border-orange-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-orange-600 animate-pulse" />
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 animate-pulse">Decrypting Mandate...</p>
            </div>
        );
    }

    if (!proposal) {
        return null;
    }

    const statusConfig = getStatusConfig(proposal.status);
    const primaryColor = proposal.brandColors?.primary || "#9333ea";

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 relative">
            {/* Architectural Glows */}
            <div className="absolute top-[10%] right-[-10%] w-[40%] h-[30%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[40%] bg-orange-600/5 blur-[100px] -z-10" />

            {/* Header / Actions Flow */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <button
                    onClick={() => router.push("/proposals")}
                    className="group flex items-center space-x-4 bg-zinc-950/40 border border-white/5 px-6 py-4 rounded-2xl text-zinc-600 hover:text-orange-500 hover:border-orange-500/20 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Interface</span>
                </button>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center space-x-3 bg-zinc-950 text-orange-500 border border-orange-500/20 px-8 py-4 rounded-2xl hover:bg-orange-600 hover:text-black transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl disabled:opacity-30 group"
                    >
                        <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>{downloading ? "Generating..." : "Export Manifest"}</span>
                    </button>

                    <button
                        onClick={handleDuplicate}
                        className="flex items-center space-x-3 bg-zinc-950 text-zinc-400 border border-white/5 px-8 py-4 rounded-2xl hover:text-white hover:bg-zinc-900 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                        <Copy className="h-4 w-4" />
                        <span>Clone</span>
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center space-x-3 bg-black/40 text-zinc-800 border border-red-900/10 px-8 py-4 rounded-2xl hover:bg-red-950/20 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Purge</span>
                    </button>
                </div>
            </div>

            {/* Proposal Header Card */}
            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden group hover:glow-orange transition-all duration-1000">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/[0.03] blur-[80px] -z-10" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="flex-1 space-y-8">
                        {proposal.brandLogo && (
                            <div className="p-8 bg-zinc-950 rounded-[2.5rem] border border-white/5 shadow-inner inline-block relative group/logo">
                                <div className="absolute inset-0 bg-orange-600/5 blur-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                <img src={proposal.brandLogo} alt="Logo" className="h-20 object-contain relative" />
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-orange-500">
                                <div className="h-px w-8 bg-orange-500/50" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Status: {proposal.type.split('_').join(' ')}</span>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">{proposal.name}</h1>
                            <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em]">Project ID: <span className="text-orange-600">{proposal.id.slice(-12).toUpperCase()}</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-10">
                        <div className={cn(
                            "flex items-center space-x-4 px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl",
                            proposal.status === "ACCEPTED" ? "bg-orange-600 text-black border-orange-500" : "bg-black/40 text-orange-500 border-orange-500/20"
                        )}>
                            <statusConfig.icon className="h-4 w-4" />
                            <span>{proposal.status}</span>
                        </div>

                        <div className="text-right space-y-2">
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Total Amount</p>
                            <p className="text-6xl font-black text-white tracking-tighter italic">
                                <span className="text-[14px] text-orange-600 mr-4 tracking-normal font-sans not-italic">$</span>
                                {proposal.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-3 pt-12 border-t border-white/5 mt-12">
                    <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] mr-4">Status:</span>
                    {["DRAFT", "SENT", "ACCEPTED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={updatingStatus || proposal.status === status}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border",
                                proposal.status === status
                                    ? "bg-orange-600 text-black border-orange-500 shadow-[0_0_20px_rgba(255,122,0,0.3)]"
                                    : "bg-zinc-950 text-zinc-700 border-white/5 hover:border-orange-500/20 hover:text-zinc-400"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Client Intelligence */}
            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl space-y-10">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                        <User className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Target Parameters</h2>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Entity Intelligence Grid</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="space-y-3 p-8 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Designation</p>
                        <p className="text-lg font-black text-white italic uppercase">{proposal.lead.name}</p>
                    </div>

                    {proposal.lead.email && (
                        <div className="space-y-3 p-8 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Signal (Email)</p>
                            <p className="text-sm font-black text-orange-500 uppercase tracking-widest">{proposal.lead.email}</p>
                        </div>
                    )}

                    {proposal.lead.phone && (
                        <div className="space-y-3 p-8 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Frequency (Phone)</p>
                            <p className="text-sm font-black text-white">{proposal.lead.phone}</p>
                        </div>
                    )}

                    {proposal.lead.company && (
                        <div className="space-y-3 p-8 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Corporate Entity</p>
                            <p className="text-lg font-black text-white uppercase italic tracking-tight">{proposal.lead.company}</p>
                        </div>
                    )}

                    <div className="space-y-3 p-8 bg-zinc-950/40 rounded-[2rem] border border-white/5 shadow-inner">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Manifest Date</p>
                        <p className="text-lg font-black text-orange-500 uppercase italic">{proposal.proposalDate}</p>
                    </div>
                </div>
            </div>

            {/* Mandate Narrative */}
            {proposal.content && (
                <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                            <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Mandate Narrative</h2>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Operational Strategy & Scale</p>
                        </div>
                    </div>
                    <div
                        className="prose prose-invert prose-orange max-w-none prose-p:text-zinc-500 prose-p:font-bold prose-p:text-lg prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: proposal.content }}
                    />
                </div>
            )}

            {/* Service Payload Grid */}
            {proposal.items && proposal.items.length > 0 && (
                <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl space-y-12">
                    <div className="flex items-center space-x-6 mb-4">
                        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                            <PackageIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Service Payload</h2>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Modular Operational Units</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {proposal.items.map((item) => {
                            const features = item.package.features ? JSON.parse(item.package.features) : [];
                            return (
                                <div key={item.id} className="p-10 bg-zinc-950/60 rounded-[2.5rem] border border-white/5 shadow-inner hover:border-orange-500/20 transition-all group/item">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{item.package.name}</h3>
                                            {item.package.description && (
                                                <p className="text-sm font-bold text-zinc-500 max-w-2xl">{item.package.description}</p>
                                            )}
                                        </div>
                                        <div className="text-left lg:text-right space-y-1">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Unit Quantifier: <span className="text-orange-500">{item.quantity}</span></p>
                                            <p className="text-3xl font-black text-white italic tracking-tighter">
                                                <span className="text-[12px] text-orange-600 mr-3 italic">$</span>
                                                {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {features.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                            {features.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-center space-x-4 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                                                    <Sparkles className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex flex-col md:flex-row items-center justify-between p-12 bg-orange-600 text-black rounded-[3rem] shadow-[0_0_60px_-10px_rgba(255,122,0,0.6)] relative overflow-hidden group/total">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover/total:translate-x-[100%] transition-transform duration-1000" />
                            <div className="space-y-1">
                                <span className="text-xs font-black uppercase tracking-[0.4em] italic opacity-80">Total Value</span>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Signed Contract</h4>
                            </div>
                            <span className="text-6xl font-black tracking-tighter italic">$ {proposal.value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Systemic Terms */}
            {proposal.terms && (
                <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl">
                    <div className="flex items-center space-x-6 mb-10">
                        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                            <CheckCircle2 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Systemic Terms</h2>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Legal & Operational Constraints</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-600 font-bold whitespace-pre-wrap leading-relaxed border-l-2 border-orange-600/20 pl-8 ml-4 italic">{proposal.terms}</p>
                </div>
            )}

            {/* Strategic Signature */}
            {proposal.signature && (
                <div className="flex flex-col items-end pt-12">
                    <div className="space-y-2 text-right">
                        <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] mb-4">Strategic Authorization</p>
                        <p className="text-7xl font-black text-white tracking-tighter uppercase italic px-12 py-8 bg-zinc-950 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                            <div className="absolute inset-0 bg-orange-600/[0.02] blur-3xl -z-10" />
                            {proposal.signature}
                        </p>
                        <div className="h-px bg-white/10 w-full mt-8" />
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mt-4">{proposal.proposalDate}</p>
                    </div>
                </div>
            )}

            {/* Internal Intelligence (Encrypted Notes) */}
            {proposal.notes && (
                <div className="bg-orange-600/[0.05] rounded-[2.5rem] border border-orange-600/10 p-10 mt-12 group hover:border-orange-500/30 transition-all">
                    <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        Internal Intelligence Cipher
                    </h2>
                    <p className="text-sm text-zinc-500 font-bold italic leading-relaxed">{proposal.notes}</p>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={proposal.name}
                itemType="Proposal"
            />
        </div>
    );
}
