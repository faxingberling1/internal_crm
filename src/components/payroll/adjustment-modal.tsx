"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    RefreshCcw,
    CheckCircle2,
    EyeOff,
    Edit3,
    Loader2,
    AlertCircle,
    Trash2,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payroll {
    id: string;
    employeeId: string;
    month: number;
    year: number;
    baseSalary: number;
    totalHours: number;
    presents: number;
    absents: number;
    lates: number;
    bonus: number;
    commission: number;
    deductions: number;
    netSalary: number;
    status: string;
    isShared: boolean;
}

interface Employee {
    id: string;
    name: string;
    baseSalary: number | null;
    position?: string;
}

interface EmployeeStats {
    totalHours: number;
    breakHours: number;
    attendance: any[];
    presents: number;
    absents: number;
    lates: number;
}

interface PayrollAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    currentPayroll?: Payroll;
    month: number;
    year: number;
    onUpdate: () => void; // Trigger refresh of parent data
}

export function PayrollAdjustmentModal({
    isOpen,
    onClose,
    employee,
    currentPayroll,
    month,
    year,
    onUpdate
}: PayrollAdjustmentModalProps) {
    const [stats, setStats] = useState<EmployeeStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Form Inputs
    const [manualAdj, setManualAdj] = useState({
        bonus: "0",
        commission: "0",
        deductions: "0"
    });
    const [localStats, setLocalStats] = useState<{ present: number, absent: number, late: number } | null>(null);

    // UX State
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (isOpen && employee) {
            fetchStats();
            // Initialize from existing payroll if available
            if (currentPayroll) {
                setManualAdj({
                    bonus: currentPayroll.bonus.toString(),
                    commission: currentPayroll.commission.toString(),
                    deductions: currentPayroll.deductions.toString()
                });
                setLocalStats({
                    present: currentPayroll.presents,
                    absent: currentPayroll.absents,
                    late: currentPayroll.lates
                });
                setIsConfirmed(currentPayroll.isShared); // Lock if shared? Or maybe just if confirmed locally.
                // Actually, logic in page.tsx was: setIsConfirmed(false) on mount/change.
                // But if it's shared, it should be view-only until redacted.
            } else {
                setManualAdj({ bonus: "0", commission: "0", deductions: "0" });
                setLocalStats(null);
                setIsConfirmed(false);
            }
        }
    }, [isOpen, employee, currentPayroll]);

    // When stats load (and no payroll exists yet), populate localStats
    useEffect(() => {
        if (stats && !currentPayroll) {
            setLocalStats({
                present: stats.presents,
                absent: stats.absents,
                late: stats.lates
            });
        }
    }, [stats, currentPayroll]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch(`/api/admin/employees/${employee.id}/attendance-stats?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const finalizePayroll = async (isShared: boolean = true) => {
        setIsSubmitting(true);
        const payrollId = currentPayroll?.id; // If editing existing
        const isGenerating = !currentPayroll; // True if creating new payroll

        try {
            const res = await fetch("/api/admin/payroll/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payrollId: payrollId, // Optional, but helps identification if needed (API should handle upsert by employee+month+year)
                    employeeId: employee.id, // Needed for new records
                    month,
                    year,
                    bonus: parseFloat(manualAdj.bonus) || 0,
                    commission: parseFloat(manualAdj.commission) || 0,
                    deductions: parseFloat(manualAdj.deductions) || 0,
                    presents: localStats?.present || 0,
                    absents: localStats?.absent || 0,
                    lates: localStats?.late || 0,
                    totalHours: stats?.totalHours || 0,
                    isShared
                })
            });

            if (res.ok) {
                onUpdate();
                // Close modal if sharing OR if generating new payroll
                if (isShared || isGenerating) {
                    onClose();
                }
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save payroll.");
            }
        } catch (error) {
            console.error("Error finalizing:", error);
            alert("Failed to save payroll.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const redactPayroll = async () => {
        if (!currentPayroll) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/payroll/redact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payrollId: currentPayroll.id })
            });

            if (res.ok) {
                setIsConfirmed(false);
                onUpdate();
            }
        } catch (error) {
            console.error("Error redacting:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentPayroll) return;
        if (!confirm("Are you sure you want to delete this payroll record?")) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/payroll/${currentPayroll.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                onUpdate();
                onClose();
            } else {
                alert("Failed to delete payroll record");
            }
        } catch (error) {
            console.error("Error deleting payroll:", error);
        } finally {
            setIsSubmitting(false);
        }
    };



    // Calculations
    const formulaDeductions = localStats ? (
        ((employee.baseSalary || 0) / 30) * localStats.absent +
        ((employee.baseSalary || 0) / 30 / 2) * localStats.late // Assuming half day for late? 
        // Logic from page.tsx:
        // const perDay = (emp.baseSalary || 0) / 30;
        // const absentDed = perDay * (localStats?.absent || 0);
        // const lateDed = (perDay / 2) * (localStats?.late || 0);
    ) : 0;

    // We need to replicate the exact formula from page.tsx
    const perDay = (employee.baseSalary || 0) / 30;
    const absentDed = perDay * (localStats?.absent || 0);
    const lateDed = (perDay / 2) * (localStats?.late || 0); // Assuming 0.5 deduction for late
    const totalFormulaDeductions = absentDed + lateDed;

    const finalSalary = (employee.baseSalary || 0) - totalFormulaDeductions +
        (parseFloat(manualAdj.bonus) || 0) +
        (parseFloat(manualAdj.commission) || 0) -
        (parseFloat(manualAdj.deductions) || 0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                    {/* Header */}
                    <div className="relative z-10 p-8 pb-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 rounded-[1.2rem] bg-emerald-500 flex items-center justify-center text-2xl font-black text-white">
                                {employee.name[0]}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white tracking-tight">{employee.name}</h4>
                                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Payroll Adjustment</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={fetchStats}
                                disabled={loadingStats}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                                title="Refresh Data"
                            >
                                <RefreshCcw className={cn("h-5 w-5 text-zinc-400 group-hover:text-emerald-500", loadingStats && "animate-spin text-emerald-500")} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/50 transition-all group"
                            >
                                <X className="h-5 w-5 text-zinc-400 group-hover:text-rose-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 overflow-y-auto custom-scrollbar">
                        {loadingStats && !localStats ? (
                            <div className="h-60 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading Fiscal Data...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Auto-Detected Stats */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Attendance & Activity (Auto-Detected)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Work Hours</p>
                                            <p className="text-xl font-black text-emerald-500">{stats?.totalHours?.toFixed(1) || "0.0"}h</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Break Hours</p>
                                            <p className="text-xl font-black text-amber-500">{stats?.breakHours?.toFixed(1) || "0.0"}h</p>
                                        </div>
                                    </div>

                                    {/* Editable Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Presence</p>
                                            <input
                                                type="number"
                                                value={localStats?.present ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, present: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-xl font-black text-blue-500 outline-none", isConfirmed && "opacity-50 cursor-not-allowed")}
                                            />
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl focus-within:ring-1 focus-within:ring-rose-500 transition-all">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Absences</p>
                                            <input
                                                type="number"
                                                value={localStats?.absent ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, absent: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-xl font-black text-rose-500 outline-none", isConfirmed && "opacity-50 cursor-not-allowed")}
                                            />
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Lates</p>
                                            <input
                                                type="number"
                                                value={localStats?.late ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, late: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-xl font-black text-amber-500 outline-none", isConfirmed && "opacity-50 cursor-not-allowed")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Adjustments */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Financial Adjustments</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Bonus</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm font-black outline-none focus:ring-1 focus:ring-emerald-500 transition-all", isConfirmed && "opacity-50 cursor-not-allowed")}
                                                value={manualAdj.bonus}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, bonus: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Commission</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm font-black outline-none focus:ring-1 focus:ring-emerald-500 transition-all", isConfirmed && "opacity-50 cursor-not-allowed")}
                                                value={manualAdj.commission}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, commission: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Deductions</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 text-sm font-black outline-none focus:ring-1 focus:ring-rose-500 transition-all", isConfirmed && "opacity-50 cursor-not-allowed")}
                                                value={manualAdj.deductions}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, deductions: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-8 space-y-4 bg-black/20 -mx-8 -mb-8 p-8 border-t border-white/10">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Salary</p>
                                            <p className="text-xs font-black text-white">PKR {employee.baseSalary?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Deductions (Formula)</p>
                                            <p className="text-xs font-black text-rose-500">- PKR {totalFormulaDeductions.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-emerald-500">
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Additions</p>
                                            <p className="text-xs font-black">+ PKR {((parseFloat(manualAdj.bonus) || 0) + (parseFloat(manualAdj.commission) || 0)).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Net Payable</p>
                                        <p className="text-3xl font-black text-emerald-400 tracking-tighter">
                                            PKR {finalSalary.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 grid grid-cols-1 gap-4">
                                        {!currentPayroll ? (
                                            <button
                                                onClick={() => finalizePayroll(false)}
                                                disabled={isSubmitting}
                                                className="w-full py-4 rounded-xl bg-emerald-500 text-zinc-900 text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                <span>Generate Payroll</span>
                                            </button>
                                        ) : currentPayroll.isShared ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <button
                                                    onClick={redactPayroll}
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
                                                    <span>Redact Invoice (Unshare)</span>
                                                </button>
                                            </div>
                                        ) : !isConfirmed ? (
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isSubmitting}
                                                    className="p-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                                                    title="Delete Draft"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsConfirmed(true);
                                                        finalizePayroll(false);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className="flex-1 py-4 rounded-xl bg-emerald-500 text-zinc-900 text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    <span>Confirm & Save Draft</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setIsConfirmed(false)}
                                                    disabled={isSubmitting}
                                                    className="py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center space-x-2 text-white"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => finalizePayroll(true)}
                                                    disabled={isSubmitting}
                                                    className="py-4 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                    <span>Share with Employee</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
