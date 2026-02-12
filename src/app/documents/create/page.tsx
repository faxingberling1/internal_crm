"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const documentTypes = [
    {
        type: 'PROPOSAL',
        icon: '📄',
        name: 'Proposal',
        description: 'Create a professional proposal with packages, timeline, and pricing',
        color: 'from-purple-500 to-indigo-500',
        features: ['Package selection', 'Timeline builder', 'Payment schedule', 'Dual branding']
    },
    {
        type: 'CUSTOM_PLAN',
        icon: '📋',
        name: 'Custom Plan',
        description: 'Build service plans, project plans, or product roadmaps',
        color: 'from-blue-500 to-cyan-500',
        features: ['Phase planning', 'Milestone tracking', 'Resource allocation', 'Success metrics']
    },
    {
        type: 'NDA',
        icon: '🔒',
        name: 'Non-Disclosure Agreement',
        description: 'Protect confidential information with mutual or unilateral NDAs',
        color: 'from-green-500 to-emerald-500',
        features: ['Mutual or unilateral', 'Legal clauses', 'E-signature ready', 'Jurisdiction options']
    },
    {
        type: 'AGREEMENT',
        icon: '📝',
        name: 'Service Agreement',
        description: 'Create service agreements, MSAs, or statements of work',
        color: 'from-orange-500 to-red-500',
        features: ['Legal terms', 'Payment clauses', 'Termination terms', 'Liability protection']
    }
];

export default function CreateDocumentPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const handleContinue = () => {
        if (selectedType) {
            router.push(`/documents/create/${selectedType.toLowerCase()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
                        <Sparkles className="h-4 w-4" />
                        <span>Document Creation Wizard</span>
                    </div>
                    <h1 className="text-5xl font-black text-zinc-900 mb-4">
                        What would you like to create?
                    </h1>
                    <p className="text-xl text-zinc-600">
                        Choose a document type to get started with a professional template
                    </p>
                </div>

                {/* Document Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {documentTypes.map((docType) => (
                        <button
                            key={docType.type}
                            onClick={() => setSelectedType(docType.type)}
                            className={cn(
                                'relative p-8 rounded-3xl border-2 transition-all text-left group',
                                selectedType === docType.type
                                    ? 'border-purple-500 bg-white shadow-2xl scale-105'
                                    : 'border-zinc-200 bg-white hover:border-purple-300 hover:shadow-xl'
                            )}
                        >
                            {/* Gradient Background */}
                            <div className={cn(
                                'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br',
                                docType.color
                            )} />

                            {/* Content */}
                            <div className="relative">
                                {/* Icon and Title */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-5xl">{docType.icon}</div>
                                        <div>
                                            <h3 className="text-2xl font-black text-zinc-900">
                                                {docType.name}
                                            </h3>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {docType.description}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedType === docType.type && (
                                        <div className="p-2 bg-purple-600 rounded-full">
                                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    {docType.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 text-sm text-zinc-600">
                                            <div className={cn(
                                                'w-1.5 h-1.5 rounded-full bg-gradient-to-r',
                                                docType.color
                                            )} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/documents')}
                        className="px-6 py-3 text-zinc-600 hover:text-zinc-900 font-bold transition-all"
                    >
                        ← Back to Documents
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={!selectedType}
                        className={cn(
                            'flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-lg transition-all',
                            selectedType
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        )}
                    >
                        <span>Continue</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
