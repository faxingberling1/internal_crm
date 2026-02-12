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
            <div className="space-y-8">
                <div className="h-12 w-64 bg-zinc-100 rounded-2xl animate-pulse" />
                <div className="h-96 bg-zinc-50 rounded-3xl animate-pulse" />
            </div>
        );
    }

    if (!proposal) {
        return null;
    }

    const statusConfig = getStatusConfig(proposal.status);
    const totalFromItems = proposal.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/proposals")}
                        className="p-3 rounded-xl hover:bg-zinc-100 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                            {proposal.name}
                        </h2>
                        <p className="text-zinc-500 mt-1">
                            Proposal ID: {proposal.id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className={cn(
                            "flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-xl hover:shadow-purple-500/20 font-bold",
                            downloading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Download className="h-5 w-5" />
                        <span>{downloading ? "Generating..." : "Download PDF"}</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Status and Meta */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="premium-card bg-white border border-zinc-100 p-6">
                    <div className="flex items-center space-x-3">
                        <div className={cn("p-3 rounded-2xl", statusConfig.bg)}>
                            <statusConfig.icon className={cn("h-6 w-6", statusConfig.color)} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Status
                            </p>
                            <p className="text-lg font-black text-zinc-900">{proposal.status}</p>
                        </div>
                    </div>
                </div>

                <div className="premium-card bg-white border border-zinc-100 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-green-100">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Total Value
                            </p>
                            <p className="text-lg font-black text-zinc-900">
                                ${proposal.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="premium-card bg-white border border-zinc-100 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-blue-100">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Date
                            </p>
                            <p className="text-lg font-black text-zinc-900">
                                {new Date(proposal.proposalDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="premium-card bg-white border border-zinc-100 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-purple-100">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Type
                            </p>
                            <p className="text-lg font-black text-zinc-900">{proposal.type}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Information */}
            <div className="premium-card bg-white border border-zinc-100 p-8">
                <h3 className="text-xl font-black text-zinc-900 mb-6">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-xl bg-zinc-50">
                            <User className="h-5 w-5 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Name
                            </p>
                            <p className="text-base font-bold text-zinc-900">{proposal.lead.name}</p>
                        </div>
                    </div>

                    {proposal.lead.email && (
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-zinc-50">
                                <Mail className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    Email
                                </p>
                                <p className="text-base font-bold text-zinc-900">
                                    {proposal.lead.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {proposal.lead.phone && (
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-zinc-50">
                                <Phone className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    Phone
                                </p>
                                <p className="text-base font-bold text-zinc-900">
                                    {proposal.lead.phone}
                                </p>
                            </div>
                        </div>
                    )}

                    {proposal.lead.company && (
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-zinc-50">
                                <Building2 className="h-5 w-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    Company
                                </p>
                                <p className="text-base font-bold text-zinc-900">
                                    {proposal.lead.company}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Package Items */}
            {proposal.items && proposal.items.length > 0 && (
                <div className="premium-card bg-white border border-zinc-100 p-8">
                    <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center">
                        <PackageIcon className="h-6 w-6 mr-3 text-purple-600" />
                        Package Details
                    </h3>
                    <div className="space-y-4">
                        {proposal.items.map((item) => {
                            const features = item.package.features
                                ? JSON.parse(item.package.features)
                                : [];
                            return (
                                <div
                                    key={item.id}
                                    className="border border-zinc-100 rounded-2xl p-6 hover:border-purple-200 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-zinc-900">
                                                {item.package.name}
                                            </h4>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {item.package.description}
                                            </p>
                                        </div>
                                        <div className="text-right ml-6">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-2xl font-black text-zinc-900 mt-1">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                ${item.price.toLocaleString()} each
                                            </p>
                                        </div>
                                    </div>
                                    {features.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-50">
                                            {features.map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start space-x-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-zinc-600 font-medium">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Total */}
                        <div className="border-t-2 border-zinc-200 pt-6 flex items-center justify-between">
                            <p className="text-lg font-black text-zinc-900">Total Investment</p>
                            <p className="text-3xl font-black text-zinc-900">
                                ${totalFromItems.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposal Content */}
            {proposal.content && (
                <div className="premium-card bg-white border border-zinc-100 p-8">
                    <h3 className="text-xl font-black text-zinc-900 mb-6">Proposal Content</h3>
                    <div className="prose prose-zinc max-w-none">
                        <div className="whitespace-pre-wrap text-zinc-700 font-medium leading-relaxed">
                            {proposal.content}
                        </div>
                    </div>
                </div>
            )}

            {/* Signature */}
            {proposal.signature && (
                <div className="premium-card bg-white border border-zinc-100 p-8">
                    <h3 className="text-xl font-black text-zinc-900 mb-6">Signature</h3>
                    <div className="flex items-center space-x-8">
                        <div>
                            <p className="text-4xl font-bold text-purple-600 italic mb-2">
                                {proposal.signature}
                            </p>
                            <div className="w-64 h-0.5 bg-zinc-200" />
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">
                                Authorized Signature
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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
