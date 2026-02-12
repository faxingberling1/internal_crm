"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Shield, Users, FileText, Scale, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { TemplateSelector } from '@/components/proposal/template-selector';
import { DynamicList } from '@/components/proposal/dynamic-list';
import { cn } from '@/lib/utils';

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

export default function CreateNDAPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingBranding, setFetchingBranding] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        ndaType: 'MUTUAL',
        parties: [
            { name: '', role: 'DISCLOSING_AND_RECEIVING', address: '' },
            { name: '', role: 'DISCLOSING_AND_RECEIVING', address: '' }
        ],
        effectiveDate: new Date().toISOString().split('T')[0],
        purpose: '',
        confidentialInfo: '',
        exclusions: [] as string[],
        obligations: [] as string[],
        ownership: '',
        termLength: '2 years from the Effective Date',
        returnInfo: '',
        remedies: '',
        jurisdiction: '',
        entireAgreement: '',
        customFooter: '',
    });

    const [branding, setBranding] = useState({
        brandName: '',
        brandLogo: '',
        brandColors: {
            primary: '#9333ea',
            secondary: '#6366f1',
            accent: '#8b5cf6',
        }
    });

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch('/api/settings/branding');
                const data = await res.json();
                if (data) {
                    setBranding({
                        brandName: data.companyName || '',
                        brandLogo: data.logoUrl || '',
                        brandColors: {
                            primary: data.primaryColor || '#9333ea',
                            secondary: data.secondaryColor || '#6366f1',
                            accent: data.accentColor || '#8b5cf6',
                        }
                    });
                    setFormData(prev => ({
                        ...prev,
                        customFooter: data.companyName || ''
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch branding:", error);
            } finally {
                setFetchingBranding(false);
            }
        };

        fetchBranding();
    }, []);

    const handleTemplateSelect = (template: Template | null) => {
        setSelectedTemplate(template);
        if (template) {
            const templateContent = template.content || template;
            setFormData({
                ...formData,
                name: template.name,
                ndaType: templateContent.ndaType || 'MUTUAL',
                parties: templateContent.parties || formData.parties,
                effectiveDate: formData.effectiveDate,
                purpose: templateContent.purpose || '',
                confidentialInfo: templateContent.confidentialInfo || '',
                exclusions: templateContent.exclusions || [],
                obligations: templateContent.obligations || [],
                ownership: templateContent.ownership || '',
                termLength: templateContent.termLength || formData.termLength,
                returnInfo: templateContent.returnInfo || '',
                remedies: templateContent.remedies || '',
                jurisdiction: templateContent.jurisdiction || '',
                entireAgreement: templateContent.entireAgreement || '',
                customFooter: templateContent.customFooter || formData.customFooter,
            });

            if (templateContent.brandName || templateContent.brandLogo || templateContent.brandColors) {
                setBranding({
                    brandName: templateContent.brandName || branding.brandName,
                    brandLogo: templateContent.brandLogo || branding.brandLogo,
                    brandColors: templateContent.brandColors || branding.brandColors,
                });
            }
        }
    };

    const handleSave = async (status: 'DRAFT' | 'SENT') => {
        setLoading(true);
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'NDA',
                    name: formData.name,
                    status,
                    content: formData,
                    brandName: branding.brandName,
                    brandLogo: branding.brandLogo,
                    brandColors: branding.brandColors,
                    templateId: selectedTemplate?.id,
                    validUntil: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
                }),
            });

            if (res.ok) {
                const doc = await res.json();
                router.push(`/documents/${doc.id}`);
            }
        } catch (error) {
            console.error('Failed to create NDA:', error);
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
                                <span className="text-3xl">🔒</span>
                                <h1 className="text-3xl font-black text-zinc-900">Create NDA</h1>
                            </div>
                            <p className="text-zinc-500">Non-Disclosure Agreement for confidential information</p>
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
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
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
                        category="NDA"
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
                                    NDA Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Mutual NDA - Project Collaboration"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        NDA Type
                                    </label>
                                    <select
                                        value={formData.ndaType}
                                        onChange={(e) => setFormData({ ...formData, ndaType: e.target.value })}
                                        className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                    >
                                        <option value="MUTUAL">Mutual (Two-way)</option>
                                        <option value="UNILATERAL">Unilateral (One-way)</option>
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
                                        className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding & Footer */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Palette className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-black text-zinc-900">Branding & Footer</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Custom Logo URL
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={branding.brandLogo}
                                                onChange={(e) => setBranding({ ...branding, brandLogo: e.target.value })}
                                                placeholder="https://example.com/logo.png"
                                                className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                            />
                                        </div>
                                        {branding.brandLogo && (
                                            <div className="h-12 w-12 rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                                <img src={branding.brandLogo} alt="Logo" className="h-full w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Footer Text (Branding)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customFooter}
                                        onChange={(e) => setFormData({ ...formData, customFooter: e.target.value })}
                                        placeholder="e.g. Acme Corp - Confidential"
                                        className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Brand Color Overrides
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['primary', 'secondary', 'accent'] as const).map((colorKey) => (
                                        <div key={colorKey} className="space-y-2">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{colorKey}</span>
                                                <span className="text-[10px] font-mono font-bold text-zinc-400">{branding.brandColors[colorKey]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-10 w-10 rounded-lg border border-zinc-200 shadow-sm"
                                                    style={{ backgroundColor: branding.brandColors[colorKey] }}
                                                />
                                                <input
                                                    type="text"
                                                    value={branding.brandColors[colorKey]}
                                                    onChange={(e) => setBranding({
                                                        ...branding,
                                                        brandColors: { ...branding.brandColors, [colorKey]: e.target.value }
                                                    })}
                                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                            Party {index + 1} {index === 0 ? '(Your Company)' : '(Client)'}
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
                                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500/10 outline-none"
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
                                        className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500/10 outline-none resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 1. Purpose */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-black text-zinc-900">1. Purpose</h2>
                        </div>
                        <textarea
                            rows={4}
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            placeholder="Describe the purpose of the disclosure (e.g., evaluating a potential business relationship)..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* 2. Confidential Information (Definition & Exclusions) */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-black text-zinc-900">2. Confidential Information</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    a) Definition
                                </label>
                                <textarea
                                    rows={6}
                                    value={formData.confidentialInfo}
                                    onChange={(e) => setFormData({ ...formData, confidentialInfo: e.target.value })}
                                    placeholder="Define what constitutes confidential information..."
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    b) Exclusions (Information NOT included)
                                </label>
                                <DynamicList
                                    items={formData.exclusions}
                                    onChange={(exclusions) => setFormData({ ...formData, exclusions })}
                                    placeholder="Add an exclusion..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Obligations */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Scale className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-black text-zinc-900">3. Obligations of Receiving Party</h2>
                        </div>
                        <DynamicList
                            items={formData.obligations}
                            onChange={(obligations) => setFormData({ ...formData, obligations })}
                            placeholder="Add an obligation (e.g., maintain confidentiality, limit access)..."
                        />
                    </div>

                    {/* 4. Ownership of Materials */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Shield className="h-5 w-5 text-orange-600" />
                            <h2 className="text-xl font-black text-zinc-900">4. Ownership of Materials</h2>
                        </div>
                        <textarea
                            rows={4}
                            value={formData.ownership}
                            onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                            placeholder="Define ownership of disclosed materials and intellectual property..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* 5. Term */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">5. Term</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Effective Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.effectiveDate}
                                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Term Length
                                </label>
                                <input
                                    type="text"
                                    value={formData.termLength}
                                    onChange={(e) => setFormData({ ...formData, termLength: e.target.value })}
                                    placeholder="e.g., 2 years from the Effective Date"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 6. Return or Destruction of Information */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            <h2 className="text-xl font-black text-zinc-900">6. Return or Destruction</h2>
                        </div>
                        <textarea
                            rows={3}
                            value={formData.returnInfo}
                            onChange={(e) => setFormData({ ...formData, returnInfo: e.target.value })}
                            placeholder="Process for returning or destroying information upon termination..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-red-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* 7. Remedies */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Scale className="h-5 w-5 text-zinc-600" />
                            <h2 className="text-xl font-black text-zinc-900">7. Remedies</h2>
                        </div>
                        <textarea
                            rows={3}
                            value={formData.remedies}
                            onChange={(e) => setFormData({ ...formData, remedies: e.target.value })}
                            placeholder="Available remedies in case of breach (e.g., injunctive relief)..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-zinc-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* 8. Governing Law */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">8. Governing Law</h2>
                        <input
                            type="text"
                            value={formData.jurisdiction}
                            onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                            placeholder="e.g., State of California, United States"
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-zinc-500/10 transition-all outline-none"
                        />
                    </div>

                    {/* 9. Entire Agreement */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">9. Entire Agreement</h2>
                        <textarea
                            rows={3}
                            value={formData.entireAgreement}
                            onChange={(e) => setFormData({ ...formData, entireAgreement: e.target.value })}
                            placeholder="Statement that this represents the complete agreement..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-zinc-500/10 transition-all outline-none resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
