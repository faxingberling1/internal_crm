"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Filter, Download, Eye, Edit, Trash2, Send, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
    id: string;
    type: 'PROPOSAL' | 'CUSTOM_PLAN' | 'NDA' | 'AGREEMENT';
    name: string;
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'REJECTED' | 'EXPIRED';
    value?: number;
    validUntil?: string;
    createdAt: string;
    lead?: { name: string; company?: string };
    client?: { name: string; company?: string };
}

const documentTypeIcons = {
    PROPOSAL: '📄',
    CUSTOM_PLAN: '📋',
    NDA: '🔒',
    AGREEMENT: '📝',
};

const statusConfig = {
    DRAFT: { label: 'Draft', color: 'bg-zinc-950/40 text-zinc-500 border-white/5', icon: Edit },
    SENT: { label: 'Sent', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: Send },
    VIEWED: { label: 'Viewed', color: 'bg-orange-600/10 text-orange-600 border-orange-600/20', icon: Eye },
    SIGNED: { label: 'Signed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
    EXPIRED: { label: 'Expired', color: 'bg-orange-950/20 text-orange-900 border-orange-900/30', icon: Clock },
};

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [selectedType, selectedStatus]);

    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedType !== 'ALL') params.append('type', selectedType);
            if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

            const res = await fetch(`/api/documents?${params}`);
            const data = await res.json();
            setDocuments(data || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (docId: string, docName: string) => {
        setDownloadingId(docId);
        try {
            const res = await fetch(`/api/documents/${docId}`);
            if (res.ok) {
                const fullDoc = await res.json();
                const { generateDocumentPDF } = await import('@/lib/pdf-generator');
                const pdfBlob = await generateDocumentPDF(fullDoc);
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${docName.replace(/\s+/g, "_")}_${docId.slice(-6)}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to download PDF:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.lead?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getClientName = (doc: Document) => {
        if (doc.client) return doc.client.name;
        if (doc.lead) return doc.lead.name;
        return 'No client';
    };

    const getClientCompany = (doc: Document) => {
        if (doc.client?.company) return doc.client.company;
        if (doc.lead?.company) return doc.lead.company;
        return null;
    };

    return (
        <div className="p-10 bg-[#050505] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-[0.1em]">Document <span className="text-orange-600">Archive</span></h1>
                    <p className="text-zinc-600 font-bold mt-2 uppercase text-xs tracking-[0.3em]">Manage proposals, plans, NDAs, and agreements</p>
                </div>
                <button
                    onClick={() => router.push('/documents/create')}
                    className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-8 py-4 rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)] font-black uppercase text-xs tracking-widest"
                >
                    <Plus className="h-5 w-5" />
                    <span>Initialize Document</span>
                </button>
            </div>

            {/* ... filters ... */}
            <div className="glass-premium rounded-[2.5rem] border border-white/5 p-8 mb-8 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                    {['ALL', 'PROPOSAL', 'CUSTOM_PLAN', 'NDA', 'AGREEMENT'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={cn(
                                'px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border',
                                selectedType === type
                                    ? 'bg-orange-600 text-black border-orange-500/50 shadow-[0_0_20px_rgba(255,122,0,0.4)]'
                                    : 'bg-black/40 text-zinc-600 border-white/5 hover:bg-orange-600/5 hover:text-orange-500'
                            )}
                        >
                            {type === 'ALL' ? 'All Matrix' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Scan archive for documents or identifiers..."
                            className="w-full pl-14 pr-4 py-4.5 bg-[#080808] border border-white/5 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 placeholder:text-zinc-800"
                        />
                    </div>
                    <div className="flex items-center space-x-3 bg-black/40 border border-white/5 rounded-[1.5rem] px-6 py-4.5">
                        <Filter className="h-5 w-5 text-zinc-700" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-transparent text-zinc-600 font-black uppercase text-[10px] tracking-widest outline-none appearance-none cursor-pointer hover:text-orange-500 transition-colors"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="VIEWED">Viewed</option>
                            <option value="SIGNED">Signed</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="glass-premium rounded-[3rem] border border-white/5 p-20 text-center shadow-2xl">
                    <div className="mb-8 p-10 rounded-full bg-zinc-950 border border-white/5 shadow-2xl inline-block">
                        <FileText className="h-16 w-16 text-orange-600/20" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">No archives identified</h3>
                    <p className="text-zinc-600 mb-10 font-bold uppercase text-xs tracking-widest">
                        No portfolio assets detected in this specialized category. Start your first project to begin your legacy.
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => router.push('/documents/create')}
                            className="inline-flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_30px_-5px_rgba(255,122,0,0.4)]"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Authorize Creation</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDocuments.map((doc) => {
                        const StatusIcon = statusConfig[doc.status].icon;
                        return (
                            <div
                                key={doc.id}
                                className="glass-obsidian-saturated rounded-[2rem] border border-white/5 p-8 hover:glow-orange transition-all cursor-pointer group shadow-2xl"
                                onClick={() => router.push(`/documents/${doc.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="text-5xl drop-shadow-[0_0_20px_rgba(255,122,0,0.2)]">{documentTypeIcons[doc.type]}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <h3 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-widest">
                                                    {doc.name}
                                                </h3>
                                                <span className={cn(
                                                    'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                                                    statusConfig[doc.status].color
                                                )}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    <span>{statusConfig[doc.status].label}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-5 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                                <span className="text-white/80">{getClientName(doc)}</span>
                                                {getClientCompany(doc) && (
                                                    <><span className="text-zinc-800">•</span><span className="text-zinc-700">{getClientCompany(doc)}</span></>
                                                )}
                                                <span className="text-zinc-800">•</span>
                                                <span className="text-zinc-800">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                                {doc.value && (
                                                    <><span className="text-zinc-800">•</span><span className="font-black text-orange-600">$ {doc.value.toLocaleString()}</span></>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/documents/${doc.id}`);
                                            }}
                                            className="p-3 bg-zinc-950/40 border border-white/5 hover:bg-orange-600/10 rounded-xl transition-all"
                                        >
                                            <Eye className="h-5 w-5 text-orange-600" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadPDF(doc.id, doc.name);
                                            }}
                                            disabled={downloadingId === doc.id}
                                            className="p-3 bg-zinc-950/40 border border-white/5 hover:bg-blue-600/10 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {downloadingId === doc.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                                            ) : (
                                                <Download className="h-5 w-5 text-blue-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
