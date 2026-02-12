"use client";

import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicListProps {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
}

export function DynamicList({ items, onChange, placeholder = "Add item...", label, icon }: DynamicListProps) {
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            {/* Existing Items */}
            {items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-start space-x-2 p-3 bg-white border border-zinc-200 rounded-xl group hover:border-purple-300 transition-all"
                        >
                            <GripVertical className="h-5 w-5 text-zinc-300 flex-shrink-0 mt-0.5" />
                            {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
                            <p className="flex-1 text-sm text-zinc-700">{item}</p>
                            <button
                                onClick={() => removeItem(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <X className="h-4 w-4 text-red-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Item */}
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                />
                <button
                    onClick={addItem}
                    disabled={!newItem.trim()}
                    className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
