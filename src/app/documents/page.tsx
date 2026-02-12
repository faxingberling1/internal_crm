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
    DRAFT: { label: 'Draft', color: 'bg-zinc-100 text-zinc-700', icon: Edit },
    SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
    VIEWED: { label: 'Viewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
    SIGNED: { label: 'Signed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    EXPIRED: { label: 'Expired', color: 'bg-orange-100 text-orange-700', icon: Clock },
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
        <div className="p-8">
            {/* ... header ... */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900">Documents</h1>
                    <p className="text-zinc-500 mt-1">Manage proposals, plans, NDAs, and agreements</p>
                </div>
                <button
                    onClick={() => router.push('/documents/create')}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Document</span>
                </button>
            </div>

            {/* ... filters ... */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    {['ALL', 'PROPOSAL', 'CUSTOM_PLAN', 'NDA', 'AGREEMENT'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={cn(
                                'px-4 py-2 rounded-xl font-bold text-sm transition-all',
                                selectedType === type
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            )}
                        >
                            {type === 'ALL' ? 'All' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documents, clients..."
                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-zinc-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium"
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
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
                    <FileText className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-zinc-900 mb-2">No documents found</h3>
                    <p className="text-zinc-500 mb-6">
                        {searchQuery ? 'Try adjusting your search or filters' : 'Create your first document to get started'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => router.push('/documents/create')}
                            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Document</span>
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
                                className="bg-white rounded-2xl border border-zinc-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => router.push(`/documents/${doc.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="text-4xl">{documentTypeIcons[doc.type]}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-black text-zinc-900 group-hover:text-purple-600 transition-colors">
                                                    {doc.name}
                                                </h3>
                                                <span className={cn(
                                                    'flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold',
                                                    statusConfig[doc.status].color
                                                )}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    <span>{statusConfig[doc.status].label}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-zinc-600">
                                                <span className="font-medium">{getClientName(doc)}</span>
                                                {getClientCompany(doc) && (
                                                    <><span className="text-zinc-300">•</span><span>{getClientCompany(doc)}</span></>
                                                )}
                                                <span className="text-zinc-300">•</span>
                                                <span className="text-xs text-zinc-400">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                                {doc.value && (
                                                    <><span className="text-zinc-300">•</span><span className="font-bold text-purple-600">${doc.value.toLocaleString()}</span></>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/documents/${doc.id}`);
                                            }}
                                            className="p-2 hover:bg-purple-50 rounded-lg transition-all"
                                        >
                                            <Eye className="h-5 w-5 text-purple-600" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadPDF(doc.id, doc.name);
                                            }}
                                            disabled={downloadingId === doc.id}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
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
