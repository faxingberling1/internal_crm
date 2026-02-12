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
import { generateProposalPDF } from "@/lib/pdf-generator";
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
            const pdfBlob = await generateProposalPDF(proposal);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
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
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    if (!proposal) {
        return null;
    }

    const statusConfig = getStatusConfig(proposal.status);
    const primaryColor = proposal.brandColors?.primary || "#9333ea";

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push("/proposals")}
                    className="flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-bold">Back to Proposals</span>
                </button>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all font-bold disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        <span>{downloading ? "Generating..." : "Download PDF"}</span>
                    </button>

                    <button
                        onClick={handleDuplicate}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all font-bold"
                    >
                        <Copy className="h-4 w-4" />
                        <span>Duplicate</span>
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all font-bold"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            {/* Proposal Header Card */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        {proposal.brandLogo && (
                            <img src={proposal.brandLogo} alt="Logo" className="h-16 object-contain mb-4" />
                        )}
                        <h1 className="text-3xl font-black text-zinc-900 mb-2">{proposal.name}</h1>
                        <p className="text-zinc-500">ID: {proposal.id.slice(-8).toUpperCase()}</p>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                        <div className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-xl border font-bold text-sm",
                            statusConfig.bg,
                            statusConfig.color,
                            statusConfig.border
                        )}>
                            <statusConfig.icon className="h-4 w-4" />
                            <span>{proposal.status}</span>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-zinc-500">Total Value</p>
                            <p className="text-3xl font-black" style={{ color: primaryColor }}>
                                ${proposal.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-zinc-100">
                    <span className="text-sm font-bold text-zinc-500">Update Status:</span>
                    {["DRAFT", "SENT", "ACCEPTED", "REJECTED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={updatingStatus || proposal.status === status}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                proposal.status === status
                                    ? "bg-purple-600 text-white"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                <h2 className="text-xl font-black text-zinc-900 mb-6">Client Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                            <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Client Name</p>
                            <p className="text-lg font-bold text-zinc-900">{proposal.lead.name}</p>
                        </div>
                    </div>

                    {proposal.lead.email && (
                        <div className="flex items-start space-x-3">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</p>
                                <p className="text-lg font-bold text-zinc-900">{proposal.lead.email}</p>
                            </div>
                        </div>
                    )}

                    {proposal.lead.phone && (
                        <div className="flex items-start space-x-3">
                            <div className="p-3 bg-green-100 rounded-2xl">
                                <Phone className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</p>
                                <p className="text-lg font-bold text-zinc-900">{proposal.lead.phone}</p>
                            </div>
                        </div>
                    )}

                    {proposal.lead.company && (
                        <div className="flex items-start space-x-3">
                            <div className="p-3 bg-orange-100 rounded-2xl">
                                <Building2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Company</p>
                                <p className="text-lg font-bold text-zinc-900">{proposal.lead.company}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start space-x-3">
                        <div className="p-3 bg-indigo-100 rounded-2xl">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Proposal Date</p>
                            <p className="text-lg font-bold text-zinc-900">{proposal.proposalDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposal Content */}
            {proposal.content && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Proposal Content</h2>
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: proposal.content }}
                    />
                </div>
            )}

            {/* Package Items */}
            {proposal.items && proposal.items.length > 0 && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Package Details</h2>
                    <div className="space-y-4">
                        {proposal.items.map((item) => {
                            const features = item.package.features ? JSON.parse(item.package.features) : [];
                            return (
                                <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-zinc-900">{item.package.name}</h3>
                                            {item.package.description && (
                                                <p className="text-sm text-zinc-600 mt-1">{item.package.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-6">
                                            <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                                            <p className="text-2xl font-black text-zinc-900">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {features.length > 0 && (
                                        <div className="space-y-2 mt-4 pt-4 border-t border-zinc-200">
                                            {features.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start space-x-2">
                                                    <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-zinc-600">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center justify-between p-6 bg-zinc-900 rounded-2xl">
                            <span className="text-white font-black text-lg uppercase tracking-wider">Total Investment</span>
                            <span className="text-white font-black text-3xl">${proposal.value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms & Conditions */}
            {proposal.terms && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Terms & Conditions</h2>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{proposal.terms}</p>
                </div>
            )}

            {/* Signature */}
            {proposal.signature && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Authorized Signature</h2>
                    <div className="space-y-2">
                        <p className="text-3xl font-black text-purple-600 font-serif italic">{proposal.signature}</p>
                        <div className="h-px bg-zinc-200 w-64" />
                        <p className="text-sm text-zinc-500">{proposal.proposalDate}</p>
                    </div>
                </div>
            )}

            {/* Internal Notes (if any) */}
            {proposal.notes && (
                <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8">
                    <h2 className="text-xl font-black text-amber-900 mb-4">Internal Notes</h2>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">{proposal.notes}</p>
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
