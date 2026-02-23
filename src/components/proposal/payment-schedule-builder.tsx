"use client";

import { useState } from 'react';
import { Plus, X, DollarSign } from 'lucide-react';

export interface PaymentMilestone {
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
            const cappedPercentage = Math.min(newMilestone.percentage, remainingPercentage);
            const amount = totalValue * (cappedPercentage / 100);
            onChange({
                schedule: [...schedule, { ...newMilestone, percentage: cappedPercentage, amount }],
            });
            setNewMilestone({ milestone: '', percentage: 0 });
        }
    };

    const autoDistributeRemaining = () => {
        if (remainingPercentage > 0) {
            const amount = totalValue * (remainingPercentage / 100);
            onChange({
                schedule: [...schedule, {
                    milestone: schedule.length === 0 ? 'Project Completion' : 'Balance Payment',
                    percentage: remainingPercentage,
                    amount
                }],
            });
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-1">
                    Payment Schedule
                </label>
                <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {remainingPercentage > 0 ? (
                        <button
                            onClick={autoDistributeRemaining}
                            className="text-orange-500 hover:text-orange-400 underline underline-offset-8 decoration-orange-500/30 transition-all mr-3"
                        >
                            Allocate remaining {remainingPercentage}%
                        </button>
                    ) : (
                        <span className="text-emerald-500 flex items-center space-x-2">
                            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                            <span>Payment Schedule Allocated</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Existing Milestones */}
            {schedule.length > 0 && (
                <div className="space-y-4">
                    {schedule.map((milestone, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-6 bg-zinc-950/40 border border-white/5 rounded-2xl group hover:border-orange-500/20 transition-all relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-orange-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center space-x-6 relative">
                                <div className="p-4 bg-orange-600/10 rounded-xl border border-orange-500/20">
                                    <DollarSign className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-xs text-white uppercase tracking-widest">{milestone.milestone}</h4>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">
                                        <span className="text-orange-500">{milestone.percentage}%</span> • $ {milestone.amount?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeMilestone(index)}
                                className="opacity-0 group-hover:opacity-100 p-3 hover:bg-orange-600/10 rounded-xl transition-all relative"
                            >
                                <X className="h-4 w-4 text-orange-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Milestone Matrix */}
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] space-y-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl -z-10" />

                <div className="space-y-4">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Milestone Description</label>
                    <input
                        type="text"
                        value={newMilestone.milestone}
                        onChange={(e) => setNewMilestone({ ...newMilestone, milestone: e.target.value })}
                        placeholder="e.g., INITIAL DEBT SECURITY"
                        className="w-full bg-[#080808] border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-[0.2em] text-white placeholder:text-zinc-800 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Percentage (%)</label>
                        <input
                            type="number"
                            min="0"
                            max={remainingPercentage}
                            step="0.01"
                            value={newMilestone.percentage || ''}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setNewMilestone({ ...newMilestone, percentage: Math.min(val, remainingPercentage) });
                            }}
                            placeholder="Percentage"
                            className="w-full bg-[#080808] border border-white/5 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-[0.2em] text-white placeholder:text-zinc-800 shadow-inner"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] ml-2">Amount</label>
                        <input
                            type="text"
                            value={totalValue && newMilestone.percentage ? `$ ${(totalValue * (newMilestone.percentage / 100)).toLocaleString()}` : '$ 0'}
                            disabled
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 shadow-none cursor-not-allowed"
                        />
                    </div>
                </div>

                <button
                    onClick={addMilestone}
                    disabled={!newMilestone.milestone.trim() || newMilestone.percentage <= 0 || newMilestone.percentage > remainingPercentage}
                    className="w-full flex items-center justify-center space-x-4 bg-orange-600 text-black py-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.4em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-orange-500 shadow-[0_0_40px_-10px_rgba(255,122,0,0.4)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Milestone</span>
                </button>
            </div>

            {totalPercentage === 100 && (
                <div className="p-6 bg-orange-600/5 border border-orange-500/10 rounded-2xl backdrop-blur-3xl">
                    <p className="text-[10px] font-black text-orange-600 text-center uppercase tracking-[0.4em]">
                        ✓ Payment Schedule Verified (100% Allocated)
                    </p>
                </div>
            )}
        </div>
    );
}
