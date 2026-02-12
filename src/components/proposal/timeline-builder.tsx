"use client";

import { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';

interface TimelinePhase {
    phase: string;
    description: string;
    duration: string;
}

interface TimelineBuilderProps {
    timeline: TimelinePhase[];
    onChange: (timeline: TimelinePhase[]) => void;
}

export function TimelineBuilder({ timeline, onChange }: TimelineBuilderProps) {
    const [newPhase, setNewPhase] = useState<TimelinePhase>({
        phase: '',
        description: '',
        duration: '',
    });

    const addPhase = () => {
        if (newPhase.phase.trim() && newPhase.duration.trim()) {
            onChange([...timeline, newPhase]);
            setNewPhase({ phase: '', description: '', duration: '' });
        }
    };

    const removePhase = (index: number) => {
        onChange(timeline.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                Project Timeline
            </label>

            {/* Existing Phases */}
            {timeline.length > 0 && (
                <div className="space-y-3">
                    {timeline.map((phase, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white border border-zinc-200 rounded-2xl group hover:border-purple-300 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-zinc-900">{phase.phase}</h4>
                                        <p className="text-xs text-purple-600 font-bold">{phase.duration}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removePhase(index)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X className="h-4 w-4 text-red-600" />
                                </button>
                            </div>
                            {phase.description && (
                                <p className="text-sm text-zinc-600 ml-10">{phase.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Phase */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={newPhase.phase}
                        onChange={(e) => setNewPhase({ ...newPhase, phase: e.target.value })}
                        placeholder="Phase name (e.g., Discovery)"
                        className="bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                    />
                    <input
                        type="text"
                        value={newPhase.duration}
                        onChange={(e) => setNewPhase({ ...newPhase, duration: e.target.value })}
                        placeholder="Duration (e.g., 2 weeks)"
                        className="bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                    />
                </div>
                <textarea
                    rows={2}
                    value={newPhase.description}
                    onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                    placeholder="Phase description (optional)"
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm resize-none"
                />
                <button
                    onClick={addPhase}
                    disabled={!newPhase.phase.trim() || !newPhase.duration.trim()}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl transition-all font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Phase</span>
                </button>
            </div>
        </div>
    );
}
