"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Trash2,
    Calendar,
    User,
    Mail,
    Phone,
    Building2,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Eye,
    Lock,
    Scale,
    ClipboardList,
    Save,
    History,
    RotateCcw,
    Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDocumentPDF, DocumentData } from "@/lib/pdf-generator";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [document, setDocument] = useState<any>(null);
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingVersions, setFetchingVersions] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [creatingVersion, setCreatingVersion] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [viewMode, setViewMode] = useState<'DETAILS' | 'PREVIEW'>('DETAILS');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchDocument();
            fetchVersions();
        }
    }, [params.id]);

    useEffect(() => {
        if (document) {
            generatePreview();
        }
    }, [document]);

    const fetchDocument = async () => {
        try {
            const res = await fetch(`/api/documents/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setDocument(data);
            } else {
                router.push("/documents");
            }
        } catch (error) {
            console.error("Failed to fetch document:", error);
            router.push("/documents");
        } finally {
            setLoading(false);
        }
    };

    const fetchVersions = async () => {
        setFetchingVersions(true);
        try {
            const res = await fetch(`/api/documents/${params.id}/versions`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data);
            }
        } catch (error) {
            console.error("Failed to fetch versions:", error);
        } finally {
            setFetchingVersions(false);
        }
    };

    const generatePreview = async () => {
        if (!document) return;
        try {
            const pdfBlob = await generateDocumentPDF(document);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const url = URL.createObjectURL(pdfBlob);
            setPreviewUrl(url);
        } catch (error) {
            console.error("Failed to generate preview:", error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!document) return;
        setDownloading(true);
        try {
            const pdfBlob = await generateDocumentPDF(document);
            const url = URL.createObjectURL(pdfBlob);
            const link = window.document.createElement("a");
            link.href = url;
            link.download = `${document.name.replace(/\s+/g, "_")}_${document.id.slice(-6)}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleSaveVersion = async () => {
        if (!document) return;
        setCreatingVersion(true);
        try {
            const res = await fetch(`/api/documents/${params.id}/versions`, {
                method: "POST",
            });
            if (res.ok) {
                fetchVersions();
                alert("Version saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save version:", error);
        } finally {
            setCreatingVersion(false);
        }
    };

    const handleRestoreVersion = async (versionId: string) => {
        if (!confirm("Are you sure you want to restore this version? The current state will be saved as a snapshot first.")) return;

        setRestoring(true);
        try {
            const res = await fetch(`/api/documents/${params.id}/versions/${versionId}/restore`, {
                method: "POST",
            });
            if (res.ok) {
                const updatedDoc = await res.json();
                setDocument(updatedDoc);
                fetchVersions();
                alert("Document restored successfully!");
            }
        } catch (error) {
            console.error("Failed to restore version:", error);
        } finally {
            setRestoring(false);
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`/api/documents/${params.id}`, {
                method: "DELETE",
            });
            router.push("/documents");
        } catch (error) {
            console.error("Failed to delete document:", error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!document) return;
        setUpdatingStatus(true);
        try {
            if (newStatus === 'SENT' || newStatus === 'SIGNED') {
                await fetch(`/api/documents/${params.id}/versions`, { method: "POST" });
                fetchVersions();
            }

            const res = await fetch(`/api/documents/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setDocument({ ...document, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "SENT":
                return { icon: Send, label: "Sent", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
            case "VIEWED":
                return { icon: Eye, label: "Viewed", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" };
            case "SIGNED":
                return { icon: CheckCircle2, label: "Signed", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" };
            case "REJECTED":
                return { icon: XCircle, label: "Rejected", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
            default:
                return { icon: Clock, label: "Draft", color: "text-zinc-600", bg: "bg-zinc-100", border: "border-zinc-200" };
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case "NDA":
                return { icon: Lock, label: "Non-Disclosure Agreement", color: "text-emerald-600", bg: "bg-emerald-50" };
            case "AGREEMENT":
                return { icon: Scale, label: "Service Agreement", color: "text-orange-600", bg: "bg-orange-50" };
            case "CUSTOM_PLAN":
                return { icon: ClipboardList, label: "Custom Plan", color: "text-blue-600", bg: "bg-blue-50" };
            default:
                return { icon: FileText, label: "Proposal", color: "text-purple-600", bg: "bg-purple-50" };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    if (!document) return null;

    const statusConfig = getStatusConfig(document.status);
    const typeConfig = getTypeConfig(document.type);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push("/documents")}
                        className="flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-bold">Back</span>
                    </button>

                    <div className="flex bg-zinc-100 p-1 rounded-xl shadow-inner border border-zinc-200">
                        <button
                            onClick={() => setViewMode('DETAILS')}
                            className={cn(
                                "px-6 py-1.5 rounded-lg text-sm font-black transition-all",
                                viewMode === 'DETAILS' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setViewMode('PREVIEW')}
                            className={cn(
                                "px-6 py-1.5 rounded-lg text-sm font-black transition-all",
                                viewMode === 'PREVIEW' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            PDF Preview
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center space-x-2 bg-zinc-900 hover:bg-black text-white px-6 py-2.5 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" />
                        <span>{downloading ? "Generating..." : "Download PDF"}</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'DETAILS' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Document Title Card */}
                        <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 -mr-16 -mt-16 rounded-full opacity-50" />
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider", typeConfig.bg, typeConfig.color)}>
                                            <typeConfig.icon className="h-4 w-4" />
                                            <span>{typeConfig.label}</span>
                                        </div>
                                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 font-bold text-xs uppercase tracking-wider">
                                            <History className="h-3 w-3" />
                                            <span>v{document.version || 1}</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl font-black text-zinc-900">{document.name}</h1>
                                </div>
                                <div className="flex flex-col md:items-end space-y-4">
                                    <div className={cn("flex items-center space-x-2 px-4 py-2 rounded-xl border font-bold text-sm shadow-sm", statusConfig.bg, statusConfig.color, statusConfig.border)}>
                                        <statusConfig.icon className="h-4 w-4" />
                                        <span>{statusConfig.label}</span>
                                    </div>
                                    {document.value && (
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Value</p>
                                            <p className="text-3xl font-black text-zinc-900">${document.value.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-zinc-500 mr-2">Quick Actions:</span>
                                    {["DRAFT", "SENT", "SIGNED", "REJECTED"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={updatingStatus || document.status === status}
                                            className={cn(
                                                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                                document.status === status
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                                    : "bg-white text-zinc-600 border-zinc-200 hover:border-purple-200 hover:bg-purple-50"
                                            )}
                                        >
                                            {status === "SENT" ? "Mark as Sent" : status === "SIGNED" ? "Mark as Signed" : status}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSaveVersion}
                                    disabled={creatingVersion}
                                    className="flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 transition-all shadow-sm"
                                >
                                    <Save className="h-3 w-3" />
                                    <span>{creatingVersion ? "Saving..." : "Save Current Version"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Document Content */}
                        <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                            <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                                <FileText className="h-6 w-6 text-purple-600" />
                                Document Content
                            </h2>

                            {document.type === 'NDA' || document.type === 'AGREEMENT' ? (
                                <div className="space-y-8 font-serif">
                                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 mb-8">
                                        <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-zinc-700">Parties</h3>
                                        {document.content.parties?.map((party: any, i: number) => (
                                            <div key={i} className="mb-2">
                                                <span className="font-bold">{i === 0 ? 'Provider: ' : 'Recipient: '}</span>
                                                <span>{party.name}</span>
                                                {party.address && <p className="text-sm text-zinc-500 ml-4 italic">{party.address}</p>}
                                            </div>
                                        ))}
                                        <div className="mt-4 pt-4 border-t border-zinc-200 grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="font-bold">Effective Date: </span>
                                                <span className="text-zinc-600">{document.content.effectiveDate}</span>
                                            </div>
                                            {document.content.termLength && (
                                                <div>
                                                    <span className="font-bold">Term Length: </span>
                                                    <span className="text-zinc-600">{document.content.termLength}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-8">
                                        <section>
                                            <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">1. Purpose</h3>
                                            <p>{document.content.purpose || document.content.projectOverview || document.content.scope}</p>
                                        </section>

                                        {document.type === 'NDA' && (
                                            <>
                                                <section>
                                                    <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">2. Confidential Information</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="font-bold mb-1">a) Definition:</p>
                                                            <p>{document.content.confidentialInfo}</p>
                                                        </div>
                                                        {document.content.exclusions?.length > 0 && (
                                                            <div>
                                                                <p className="font-bold mb-1">b) Exclusions:</p>
                                                                <ul className="list-disc ml-6 space-y-1">
                                                                    {document.content.exclusions.map((ex: string, i: number) => (
                                                                        <li key={i}>{ex}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                                                <section>
                                                    <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">3. Obligations</h3>
                                                    <ul className="list-decimal ml-6 space-y-2">
                                                        {document.content.obligations?.map((ob: string, i: number) => (
                                                            <li key={i}>{ob}</li>
                                                        ))}
                                                    </ul>
                                                </section>

                                                <section>
                                                    <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">4. Ownership</h3>
                                                    <p>{document.content.ownership}</p>
                                                </section>
                                            </>
                                        )}

                                        {document.type === 'AGREEMENT' && (
                                            <>
                                                {document.content.deliverables?.length > 0 && (
                                                    <section>
                                                        <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">Deliverables</h3>
                                                        <ul className="list-disc ml-6 space-y-1">
                                                            {document.content.deliverables.map((del: string, i: number) => (
                                                                <li key={i}>{del}</li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                )}
                                                <section>
                                                    <h3 className="text-xl font-bold border-b border-zinc-100 pb-2 mb-4">Compensation</h3>
                                                    <p>{document.content.compensation}</p>
                                                </section>
                                            </>
                                        )}

                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {document.content.jurisdiction && (
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 mb-1">Governing Law</h4>
                                                    <p className="text-sm">{document.content.jurisdiction}</p>
                                                </div>
                                            )}
                                            {document.content.returnInfo && (
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 mb-1">Return of Info</h4>
                                                    <p className="text-sm">{document.content.returnInfo}</p>
                                                </div>
                                            )}
                                            {document.content.remedies && (
                                                <div className="md:col-span-2">
                                                    <h4 className="font-bold text-zinc-900 mb-1">Remedies</h4>
                                                    <p className="text-sm italic">{document.content.remedies}</p>
                                                </div>
                                            )}
                                            {document.content.entireAgreement && (
                                                <div className="md:col-span-2 pt-4 border-t border-zinc-100">
                                                    <h4 className="font-bold text-zinc-900 mb-1">Entire Agreement</h4>
                                                    <p className="text-sm text-zinc-500">{document.content.entireAgreement}</p>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <section>
                                        <h3 className="text-xl font-black text-zinc-900 mb-4 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-600" />
                                            Overview
                                        </h3>
                                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 text-zinc-600 leading-relaxed">
                                            {document.content.overview || document.content.projectOverview || "No overview provided."}
                                        </div>
                                    </section>

                                    {(document.content.objectives?.length > 0 || document.content.goals?.length > 0) && (
                                        <section>
                                            <h3 className="text-xl font-black text-zinc-900 mb-4">Strategic Goals</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(document.content.objectives || document.content.goals).map((goal: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-zinc-700 font-medium">{goal}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {document.type === 'PROPOSAL' && document.content.packages?.length > 0 && (
                                        <section>
                                            <h3 className="text-xl font-black text-zinc-900 mb-4">Investment Roadmap</h3>
                                            <div className="space-y-4">
                                                {document.content.packages.map((pkg: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-900 text-white rounded-3xl shadow-xl">
                                                        <div>
                                                            <h4 className="text-lg font-black">{pkg.name}</h4>
                                                            <p className="text-zinc-400 text-sm mt-1">{pkg.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black">${pkg.price.toLocaleString()}</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Qty: {pkg.quantity || 1}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {document.type === 'CUSTOM_PLAN' && (document.content.phases?.length > 0 || document.content.timeline?.length > 0) && (
                                        <section>
                                            <h3 className="text-xl font-black text-zinc-900 mb-4">Implementation Phases</h3>
                                            <div className="space-y-6">
                                                {(document.content.phases || document.content.timeline).map((phase: any, i: number) => (
                                                    <div key={i} className="relative pl-8 border-l-2 border-zinc-100 py-2">
                                                        <div className="absolute left-[-9px] top-4 h-4 w-4 rounded-full bg-purple-600 border-4 border-white shadow-sm" />
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-black text-zinc-900">{phase.name || phase.phase}</h4>
                                                            <span className="text-xs font-black bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">{phase.duration}</span>
                                                        </div>
                                                        <p className="text-zinc-600 text-sm">{phase.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Signatures */}
                        {(document.signature || document.status === 'SIGNED') && (
                            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40">
                                <h2 className="text-xl font-black text-zinc-900 mb-6 font-serif">Execution & Signatures</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{document.brandName || 'PROVIDER'}</p>
                                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                                            <p className="text-2xl font-black text-purple-600 font-serif italic mb-2">{document.brandName || 'PROVIDER'}</p>
                                            <div className="h-px bg-zinc-200 mx-auto w-32 mb-2" />
                                            <p className="text-xs text-zinc-400">{new Date(document.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Client Signature</p>
                                        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                                            <p className="text-2xl font-black text-purple-600 font-serif italic mb-2">{document.signature || "Digitally Verified"}</p>
                                            <div className="h-px bg-zinc-200 mx-auto w-32 mb-2" />
                                            <p className="text-xs text-zinc-400">{document.signedAt ? new Date(document.signedAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-xl shadow-zinc-200/40 space-y-6">
                            <h3 className="text-lg font-black text-zinc-900">Client Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg"><User className="h-4 w-4 text-zinc-600" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Contact</p>
                                        <p className="font-bold text-zinc-900">{document.client?.name || document.lead?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg"><Mail className="h-4 w-4 text-zinc-600" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Email</p>
                                        <p className="font-bold text-zinc-900">{document.client?.email || document.lead?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-xl shadow-zinc-200/40 space-y-6">
                            <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                                <Palette className="h-5 w-5 text-purple-600" />
                                Branding
                            </h3>
                            <div className="space-y-4">
                                {document.brandLogo && (
                                    <img src={document.brandLogo} alt="Logo" className="h-10 object-contain" />
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {['primary', 'secondary', 'accent'].map((k) => (
                                        <div key={k} className="h-8 rounded-lg border border-zinc-100" style={{ backgroundColor: (document.brandColors as any)?.[k] || '#eee' }} />
                                    ))}
                                </div>
                                {document.brandName && (
                                    <div className="pt-2 border-t border-zinc-100">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Brand Name</p>
                                        <p className="font-bold text-zinc-900">{document.brandName}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                            <div className="flex justify-between items-center text-zinc-400">
                                <span className="text-xs font-bold uppercase tracking-widest">Created</span>
                                <span className="text-sm font-bold text-white">{new Date(document.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400">
                                <span className="text-xs font-black uppercase tracking-widest text-purple-400">Type</span>
                                <span className="text-sm font-black text-white">{document.type}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-xl shadow-zinc-200/40">
                            <h3 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-600" />
                                Versions
                            </h3>
                            <div className="space-y-4">
                                {versions.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-900">v{v.version}</span>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(v.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button onClick={() => handleRestoreVersion(v.id)} className="opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase text-purple-600 transition-all">Restore</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-zinc-100 rounded-3xl border border-zinc-200 p-1 md:p-8 h-[calc(100vh-280px)] min-h-[600px] shadow-inner animate-in fade-in zoom-in-95 duration-500">
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full rounded-2xl border border-zinc-200 shadow-2xl bg-white"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl border border-zinc-200 shadow-2xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
                            <p className="text-zinc-500 font-bold tracking-tight">Generating Live Preview...</p>
                        </div>
                    )}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={document.name}
                itemType="Document"
            />
        </div>
    );
}
