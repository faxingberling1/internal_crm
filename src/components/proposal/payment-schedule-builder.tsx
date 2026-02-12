"use client";

import { useState } from 'react';
import { Plus, X, DollarSign } from 'lucide-react';

interface PaymentMilestone {
    milestone: string;
    percentage: number;
    amount?: number;
}

interface PaymentScheduleBuilderProps {
    paymentTerms: { schedule: PaymentMilestone[] };
    onChange: (paymentTerms: { schedule: PaymentMilestone[] }) => void;
    totalValue: number;
}

export function PaymentScheduleBuilder({ paymentTerms, onChange, totalValue }: PaymentScheduleBuilderProps) {
    const [newMilestone, setNewMilestone] = useState<PaymentMilestone>({
        milestone: '',
        percentage: 0,
    });

    const schedule = paymentTerms?.schedule || [];

    const addMilestone = () => {
        if (newMilestone.milestone.trim() && newMilestone.percentage > 0) {
            const amount = totalValue * (newMilestone.percentage / 100);
            onChange({
                schedule: [...schedule, { ...newMilestone, amount }],
            });
            setNewMilestone({ milestone: '', percentage: 0 });
        }
    };

    const removeMilestone = (index: number) => {
        onChange({
            schedule: schedule.filter((_, i) => i !== index),
        });
    };

    const totalPercentage = schedule.reduce((sum, m) => sum + m.percentage, 0);
    const remainingPercentage = 100 - totalPercentage;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Payment Schedule
                </label>
                <div className="text-xs font-bold">
                    <span className={remainingPercentage === 0 ? 'text-green-600' : 'text-purple-600'}>
                        {remainingPercentage}% remaining
                    </span>
                </div>
            </div>

            {/* Existing Milestones */}
            {schedule.length > 0 && (
                <div className="space-y-2">
                    {schedule.map((milestone, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl group hover:border-purple-300 transition-all"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900">{milestone.milestone}</h4>
                                    <p className="text-xs text-zinc-500">
                                        {milestone.percentage}% • ${milestone.amount?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeMilestone(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <X className="h-4 w-4 text-red-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Milestone */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <input
                    type="text"
                    value={newMilestone.milestone}
                    onChange={(e) => setNewMilestone({ ...newMilestone, milestone: e.target.value })}
                    placeholder="Milestone (e.g., Project Kickoff)"
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                />
                <div className="flex items-center space-x-3">
                    <div className="flex-1">
                        <input
                            type="number"
                            min="0"
                            max={remainingPercentage}
                            value={newMilestone.percentage || ''}
                            onChange={(e) => setNewMilestone({ ...newMilestone, percentage: parseFloat(e.target.value) || 0 })}
                            placeholder="Percentage"
                            className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={totalValue && newMilestone.percentage ? `$${(totalValue * (newMilestone.percentage / 100)).toLocaleString()}` : '$0'}
                            disabled
                            className="w-full bg-zinc-100 border border-zinc-200 rounded-xl py-2.5 px-4 text-sm text-zinc-600 font-bold"
                        />
                    </div>
                </div>
                <button
                    onClick={addMilestone}
                    disabled={!newMilestone.milestone.trim() || newMilestone.percentage <= 0 || newMilestone.percentage > remainingPercentage}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl transition-all font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Milestone</span>
                </button>
            </div>

            {totalPercentage === 100 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-bold text-green-700 text-center">
                        ✓ Payment schedule is complete (100%)
                    </p>
                </div>
            )}
        </div>
    );
}
