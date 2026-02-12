"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, FileText, Users, DollarSign, Scale, AlertTriangle } from 'lucide-react';
import { TemplateSelector } from '@/components/proposal/template-selector';
import { DynamicList } from '@/components/proposal/dynamic-list';

interface Template {
    id: string;
    name: string;
    category: string;
    description?: string;
    projectOverview?: string;
    objectives?: any;
    scopeOfWork?: string;
    timeline?: any;
    deliverables?: any;
    paymentTerms?: any;
    nextSteps?: string;
    terms?: string;
    content?: any;
}

export default function CreateAgreementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        agreementType: 'SERVICE',
        parties: [
            { name: '', role: 'SERVICE_PROVIDER', address: '' },
            { name: '', role: 'CLIENT', address: '' }
        ],
        effectiveDate: new Date().toISOString().split('T')[0],
        termLength: '12 months',
        scope: '',
        deliverables: [] as string[],
        compensation: '',
        paymentTerms: '',
        termination: '',
        liability: '',
        warranties: [] as string[],
        additionalClauses: [] as string[],
    });

    const handleTemplateSelect = (template: Template | null) => {
        setSelectedTemplate(template);
        if (template) {
            // Use template.content if available, otherwise fallback to root fields
            const templateContent = template.content || template;
            setFormData({
                name: template.name,
                agreementType: templateContent.agreementType || 'SERVICE',
                parties: templateContent.parties || formData.parties,
                effectiveDate: formData.effectiveDate,
                termLength: templateContent.termLength || formData.termLength,
                scope: templateContent.scope || '',
                deliverables: templateContent.deliverables || [],
                compensation: typeof templateContent.compensation === 'string'
                    ? templateContent.compensation
                    : JSON.stringify(templateContent.compensation, null, 2),
                paymentTerms: typeof templateContent.paymentTerms === 'string'
                    ? templateContent.paymentTerms
                    : JSON.stringify(templateContent.paymentTerms, null, 2),
                termination: templateContent.termination || '',
                liability: templateContent.liability || '',
                warranties: templateContent.warranties || [],
                additionalClauses: templateContent.additionalClauses || [],
            });
        }
    };

    const handleSave = async (status: 'DRAFT' | 'SENT') => {
        setLoading(true);
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'AGREEMENT',
                    name: formData.name,
                    status,
                    content: formData,
                    templateId: selectedTemplate?.id,
                    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                }),
            });

            if (res.ok) {
                const doc = await res.json();
                router.push(`/documents/${doc.id}`);
            }
        } catch (error) {
            console.error('Failed to create agreement:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/documents/create')}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                        >
                            <ArrowLeft className="h-6 w-6 text-zinc-600" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-3xl">📝</span>
                                <h1 className="text-3xl font-black text-zinc-900">Create Agreement</h1>
                            </div>
                            <p className="text-zinc-500">Service agreements, MSAs, or statements of work</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => handleSave('DRAFT')}
                            disabled={loading || !formData.name}
                            className="flex items-center space-x-2 px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            <span>Save Draft</span>
                        </button>
                        <button
                            onClick={() => handleSave('SENT')}
                            disabled={loading || !formData.name}
                            className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <Send className="h-5 w-5" />
                            <span>Create & Send</span>
                        </button>
                    </div>
                </div>

                {/* Template Selector */}
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
                    <TemplateSelector
                        selectedTemplateId={selectedTemplate?.id}
                        onSelect={handleTemplateSelect}
                        category="AGREEMENT"
                    />
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Agreement Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Service Agreement - Web Development"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Agreement Type
                                    </label>
                                    <select
                                        value={formData.agreementType}
                                        onChange={(e) => setFormData({ ...formData, agreementType: e.target.value })}
                                        className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                    >
                                        <option value="SERVICE">Service Agreement</option>
                                        <option value="MSA">Master Service Agreement</option>
                                        <option value="SOW">Statement of Work</option>
                                        <option value="CONTRACT">General Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Effective Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                        className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Term Length
                                </label>
                                <input
                                    type="text"
                                    value={formData.termLength}
                                    onChange={(e) => setFormData({ ...formData, termLength: e.target.value })}
                                    placeholder="e.g., 12 months with automatic renewal"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-black text-zinc-900">Parties</h2>
                        </div>
                        <div className="space-y-4">
                            {formData.parties.map((party, index) => (
                                <div key={index} className="p-4 bg-zinc-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-zinc-700">
                                            {party.role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Client'}
                                        </h3>
                                    </div>
                                    <input
                                        type="text"
                                        value={party.name}
                                        onChange={(e) => {
                                            const newParties = [...formData.parties];
                                            newParties[index].name = e.target.value;
                                            setFormData({ ...formData, parties: newParties });
                                        }}
                                        placeholder="Party name"
                                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none"
                                    />
                                    <textarea
                                        rows={2}
                                        value={party.address}
                                        onChange={(e) => {
                                            const newParties = [...formData.parties];
                                            newParties[index].address = e.target.value;
                                            setFormData({ ...formData, parties: newParties });
                                        }}
                                        placeholder="Address"
                                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-black text-zinc-900">Scope of Work</h2>
                        </div>
                        <textarea
                            rows={6}
                            value={formData.scope}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                            placeholder="Define the scope of services to be provided..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Deliverables */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">Deliverables</h2>
                        <DynamicList
                            items={formData.deliverables}
                            onChange={(deliverables) => setFormData({ ...formData, deliverables })}
                            placeholder="Add a deliverable..."
                        />
                    </div>

                    {/* Compensation & Payment */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-black text-zinc-900">Compensation & Payment Terms</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Compensation Structure
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.compensation}
                                    onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                                    placeholder="e.g., $5,000 per month retainer"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Payment Terms
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    placeholder="e.g., Net 30 days from invoice date"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Legal Terms */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Scale className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-black text-zinc-900">Legal Terms</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Termination Clause
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.termination}
                                    onChange={(e) => setFormData({ ...formData, termination: e.target.value })}
                                    placeholder="Define termination terms..."
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Liability Limitations
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.liability}
                                    onChange={(e) => setFormData({ ...formData, liability: e.target.value })}
                                    placeholder="Define liability limitations..."
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Warranties */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h2 className="text-xl font-black text-zinc-900">Warranties</h2>
                        </div>
                        <DynamicList
                            items={formData.warranties}
                            onChange={(warranties) => setFormData({ ...formData, warranties })}
                            placeholder="Add a warranty..."
                        />
                    </div>

                    {/* Additional Clauses */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">Additional Clauses</h2>
                        <DynamicList
                            items={formData.additionalClauses}
                            onChange={(additionalClauses) => setFormData({ ...formData, additionalClauses })}
                            placeholder="Add an additional clause..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
