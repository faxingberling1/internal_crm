"use client";

import { useState, useEffect } from 'react';
import { FileText, Sparkles } from 'lucide-react';
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
}

interface TemplateSelectorProps {
    selectedTemplateId?: string;
    onSelect: (template: Template | null) => void;
    category?: string;
}

export function TemplateSelector({ selectedTemplateId, onSelect, category }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, [category]);

    const fetchTemplates = async () => {
        try {
            const url = category ? `/api/templates?category=${category}` : '/api/templates';
            const res = await fetch(url);
            const data = await res.json();
            setTemplates(data || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Start from Template (Optional)
                </label>
                {selectedTemplateId && (
                    <button
                        onClick={() => onSelect(null)}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">No templates available</p>
                    <p className="text-xs text-zinc-400 mt-1">Create templates in admin settings</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={cn(
                                'p-4 rounded-2xl border-2 transition-all text-left',
                                selectedTemplateId === template.id
                                    ? 'bg-purple-50 border-purple-500 shadow-lg'
                                    : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-md'
                            )}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={cn(
                                    'p-2 rounded-xl',
                                    selectedTemplateId === template.id
                                        ? 'bg-purple-600'
                                        : 'bg-purple-100'
                                )}>
                                    <Sparkles className={cn(
                                        'h-5 w-5',
                                        selectedTemplateId === template.id
                                            ? 'text-white'
                                            : 'text-purple-600'
                                    )} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm text-zinc-900">{template.name}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">{template.category}</p>
                                    {template.description && (
                                        <p className="text-xs text-zinc-600 mt-2 line-clamp-2">{template.description}</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
