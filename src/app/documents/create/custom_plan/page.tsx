"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Sparkles, Target, ListChecks, Calendar, Package as PackageIcon } from 'lucide-react';
import { TemplateSelector } from '@/components/proposal/template-selector';
import { DynamicList } from '@/components/proposal/dynamic-list';
import { TimelineBuilder } from '@/components/proposal/timeline-builder';

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

export default function CreateCustomPlanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        planType: 'SERVICE_PLAN',
        overview: '',
        goals: [] as string[],
        phases: [] as any[],
        resources: [] as string[],
        timeline: '',
        successMetrics: [] as string[],
    });

    const handleTemplateSelect = (template: Template | null) => {
        setSelectedTemplate(template);
        if (template) {
            // Use template.content if available, otherwise fallback to root fields (from seed templates)
            const templateContent = template.content || template;
            setFormData({
                name: template.name,
                planType: templateContent.planType || 'SERVICE_PLAN',
                overview: templateContent.projectOverview || templateContent.overview || '',
                goals: templateContent.objectives || templateContent.goals || [],
                phases: templateContent.timeline || templateContent.phases || [],
                resources: templateContent.resources || [],
                timeline: templateContent.timelineSummary || templateContent.timeline || '',
                successMetrics: templateContent.successMetrics || [],
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
                    type: 'CUSTOM_PLAN',
                    name: formData.name,
                    status,
                    content: formData,
                    templateId: selectedTemplate?.id,
                }),
            });

            if (res.ok) {
                const doc = await res.json();
                router.push(`/documents/${doc.id}`);
            }
        } catch (error) {
            console.error('Failed to create plan:', error);
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
                                <span className="text-3xl">📋</span>
                                <h1 className="text-3xl font-black text-zinc-900">Create Custom Plan</h1>
                            </div>
                            <p className="text-zinc-500">Build a service plan, project plan, or product roadmap</p>
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
                            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
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
                        category="CUSTOM_PLAN"
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
                                    Plan Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Q1 2026 Service Plan"
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Plan Type
                                </label>
                                <select
                                    value={formData.planType}
                                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                                    className="w-full mt-2 bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                >
                                    <option value="SERVICE_PLAN">Service Plan</option>
                                    <option value="PROJECT_PLAN">Project Plan</option>
                                    <option value="ROADMAP">Product Roadmap</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Overview */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-black text-zinc-900">Overview</h2>
                        </div>
                        <textarea
                            rows={4}
                            value={formData.overview}
                            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                            placeholder="Provide a brief overview of this plan..."
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Goals */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Target className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-black text-zinc-900">Goals & Objectives</h2>
                        </div>
                        <DynamicList
                            items={formData.goals}
                            onChange={(goals) => setFormData({ ...formData, goals })}
                            placeholder="Add a goal or objective..."
                        />
                    </div>

                    {/* Phases */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Calendar className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-black text-zinc-900">Phases & Milestones</h2>
                        </div>
                        <TimelineBuilder
                            timeline={formData.phases}
                            onChange={(phases) => setFormData({ ...formData, phases })}
                        />
                    </div>

                    {/* Resources */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <PackageIcon className="h-5 w-5 text-orange-600" />
                            <h2 className="text-xl font-black text-zinc-900">Resources</h2>
                        </div>
                        <DynamicList
                            items={formData.resources}
                            onChange={(resources) => setFormData({ ...formData, resources })}
                            placeholder="Add a resource..."
                        />
                    </div>

                    {/* Success Metrics */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <ListChecks className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-black text-zinc-900">Success Metrics</h2>
                        </div>
                        <DynamicList
                            items={formData.successMetrics}
                            onChange={(successMetrics) => setFormData({ ...formData, successMetrics })}
                            placeholder="Add a success metric..."
                        />
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h2 className="text-xl font-black text-zinc-900 mb-4">Timeline Summary</h2>
                        <input
                            type="text"
                            value={formData.timeline}
                            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                            placeholder="e.g., 12-month engagement with quarterly reviews"
                            className="w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
