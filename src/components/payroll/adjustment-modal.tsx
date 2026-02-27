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
    Send,
    TrendingUp,
    Zap
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
    const [localBaseSalary, setLocalBaseSalary] = useState<string>("0");

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
                setLocalBaseSalary(employee.baseSalary?.toString() || "0");
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
                    baseSalary: parseFloat(localBaseSalary) || 0,
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
    const currentBaseSalary = parseFloat(localBaseSalary) || 0;
    const perDay = currentBaseSalary / 30;
    const absentDed = perDay * (localStats?.absent || 0);
    const lateDed = (perDay / 2) * (localStats?.late || 0); // Assuming 0.5 deduction for late
    const totalFormulaDeductions = absentDed + lateDed;

    const finalSalary = currentBaseSalary - totalFormulaDeductions +
        (parseFloat(manualAdj.bonus) || 0) +
        (parseFloat(manualAdj.commission) || 0) -
        (parseFloat(manualAdj.deductions) || 0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl glass-premium rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[95vh] isolate"
                >
                    {/* Architectural Glows */}
                    <div className="absolute top-0 right-0 h-96 w-96 bg-orange-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />

                    {/* Header */}
                    <div className="relative z-10 p-12 pb-6 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center space-x-6">
                            <div className="h-16 w-16 rounded-[1.8rem] bg-orange-600 flex items-center justify-center text-2xl font-black text-black shadow-2xl shadow-orange-600/20 transition-all duration-700 hover:scale-110">
                                {employee.name[0]}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white tracking-widest uppercase italic mb-1 group-hover/modal:text-orange-500 transition-colors">{employee.name}</h4>
                                <div className="flex items-center space-x-3 text-orange-500">
                                    <div className="h-px w-6 bg-orange-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Payroll Adjustment</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchStats}
                                disabled={loadingStats}
                                className="p-4 bg-zinc-950 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all group/ref"
                                title="Refresh Data"
                            >
                                <RefreshCcw className={cn("h-5 w-5 text-zinc-600 group-hover/ref:text-orange-500 transition-all", loadingStats && "animate-spin text-orange-500")} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-4 bg-zinc-950 border border-white/5 rounded-2xl hover:bg-rose-950 hover:text-rose-500 transition-all group/close"
                            >
                                <X className="h-5 w-5 text-zinc-600 group-hover/close:text-rose-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-12 overflow-y-auto custom-scrollbar">
                        {loadingStats && !localStats ? (
                            <div className="h-80 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-600/20 blur-2xl animate-pulse rounded-full" />
                                    <Loader2 className="h-16 w-16 text-orange-500 animate-spin relative z-10" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Syncing Payroll Data</p>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Accessing Attendance Records...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                                {/* Auto-Detected Stats */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-3 text-zinc-500 border-b border-white/5 pb-4 mb-4">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Attendance Metrics</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-zinc-950 border border-white/5 rounded-[2rem] shadow-inner group/stat hover:border-orange-500/20 transition-all">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 group-hover/stat:text-orange-500/60 transition-colors">Total Hours</p>
                                            <p className="text-2xl font-black text-white italic tabular-nums group-hover/stat:scale-110 transition-transform origin-left">
                                                <span className="text-orange-500">{stats?.totalHours?.toFixed(1) || "0.0"}</span> H
                                            </p>
                                        </div>
                                        <div className="p-6 bg-zinc-950 border border-white/5 rounded-[2rem] shadow-inner group/stat hover:border-orange-500/20 transition-all">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 group-hover/stat:text-orange-500/60 transition-colors">Break Hours</p>
                                            <p className="text-2xl font-black text-white italic tabular-nums group-hover/stat:scale-110 transition-transform origin-left">
                                                <span className="text-zinc-500">{stats?.breakHours?.toFixed(1) || "0.0"}</span> H
                                            </p>
                                        </div>
                                    </div>

                                    {/* Editable Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-6 bg-zinc-950 border border-white/5 rounded-[2rem] focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all group/bit">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 group-hover/bit:text-orange-500/60 transition-colors text-center">Presents</p>
                                            <input
                                                type="number"
                                                value={localStats?.present ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, present: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-3xl font-black text-white outline-none text-center tabular-nums italic", isConfirmed && "opacity-30 cursor-not-allowed")}
                                            />
                                        </div>
                                        <div className="p-6 bg-zinc-950 border border-white/5 rounded-[2rem] focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all group/bit">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 group-hover/bit:text-orange-500/60 transition-colors text-center">Absences</p>
                                            <input
                                                type="number"
                                                value={localStats?.absent ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, absent: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-3xl font-black text-white outline-none text-center tabular-nums italic", isConfirmed && "opacity-30 cursor-not-allowed")}
                                            />
                                        </div>
                                        <div className="p-6 bg-zinc-950 border border-white/5 rounded-[2rem] focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-500/20 transition-all group/bit">
                                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 group-hover/bit:text-orange-500/60 transition-colors text-center">Lates</p>
                                            <input
                                                type="number"
                                                value={localStats?.late ?? 0}
                                                readOnly={isConfirmed}
                                                onChange={(e) => setLocalStats(prev => prev ? { ...prev, late: parseInt(e.target.value) || 0 } : null)}
                                                className={cn("w-full bg-transparent text-3xl font-black text-white outline-none text-center tabular-nums italic", isConfirmed && "opacity-30 cursor-not-allowed")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Adjustments */}
                                <div className="space-y-6 pt-10 border-t border-white/10 relative isolate">
                                    <div className="absolute top-0 right-10 h-32 w-32 bg-orange-600/5 blur-3xl -z-10" />
                                    <div className="flex items-center space-x-3 text-zinc-500 border-b border-white/5 pb-4 mb-4">
                                        <RefreshCcw className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Adjustment Overrides</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-2">Bonus</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-zinc-950 border border-white/5 text-white rounded-[1.5rem] p-5 text-sm font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all tabular-nums", isConfirmed && "opacity-30 cursor-not-allowed")}
                                                value={manualAdj.bonus}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, bonus: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-2">Commission</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-zinc-950 border border-white/5 text-white rounded-[1.5rem] p-5 text-sm font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all tabular-nums", isConfirmed && "opacity-30 cursor-not-allowed")}
                                                value={manualAdj.commission}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, commission: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-2">Other Deductions</label>
                                            <input
                                                type="number"
                                                readOnly={isConfirmed}
                                                className={cn("w-full bg-zinc-950 border border-white/5 text-white rounded-[1.5rem] p-5 text-sm font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all tabular-nums", isConfirmed && "opacity-30 cursor-not-allowed")}
                                                value={manualAdj.deductions}
                                                onChange={(e) => setManualAdj(prev => ({ ...prev, deductions: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-12 space-y-8 bg-[#0c0c0c]/80 -mx-12 -mb-12 p-12 border-t border-white/10 relative overflow-hidden group/summary shadow-inner_premium">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent scale-x-0 group-hover/summary:scale-x-100 transition-transform duration-1000" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between group/line">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] group-hover/line:text-zinc-500 transition-colors">Base Salary</p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-zinc-500 font-bold italic">RS.</span>
                                                <input
                                                    type="number"
                                                    value={localBaseSalary}
                                                    readOnly={isConfirmed}
                                                    onChange={(e) => setLocalBaseSalary(e.target.value)}
                                                    className={cn(
                                                        "bg-transparent text-sm font-black text-white outline-none border-b border-white/5 hover:border-orange-500/50 focus:border-orange-500 transition-all text-right w-24 tabular-nums italic",
                                                        isConfirmed && "opacity-30 cursor-not-allowed border-none"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between group/line">
                                            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] group-hover/line:text-rose-500/50 transition-colors">Calculated Deductions</p>
                                            <p className="text-sm font-black text-orange-600 italic tracking-widest">- RS. {totalFormulaDeductions.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between group/line">
                                            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] group-hover/line:text-orange-500 transition-colors">Additional Adjustments</p>
                                            <p className="text-sm font-black text-orange-400 italic tracking-widest transition-colors">+ RS. {((parseFloat(manualAdj.bonus) || 0) + (parseFloat(manualAdj.commission) || 0)).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col items-center justify-center space-y-4 border-t border-white/5 relative isolate">
                                        <div className="absolute inset-0 bg-orange-600/5 -z-10 blur-3xl opacity-0 group-hover/summary:opacity-100 transition-opacity duration-1000" />
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Net Payable Amount</p>
                                        <p className="text-6xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-2xl">
                                            <span className="text-orange-600 mr-2">RS.</span>{finalSalary.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-10 grid grid-cols-1 gap-6">
                                        {!currentPayroll ? (
                                            <button
                                                onClick={() => finalizePayroll(false)}
                                                disabled={isSubmitting}
                                                className="w-full py-6 rounded-[2rem] bg-orange-600 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-500 shadow-2xl shadow-orange-600/20 transition-all flex items-center justify-center space-x-3 group/btn"
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Zap className="h-4 w-4 group-hover/btn:animate-pulse" />}
                                                <span>SAVE PAYROLL RECORD</span>
                                            </button>
                                        ) : currentPayroll.isShared ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <button
                                                    onClick={redactPayroll}
                                                    disabled={isSubmitting}
                                                    className="w-full py-6 rounded-[2rem] bg-zinc-950 text-orange-600 border border-orange-600/30 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-black transition-all flex items-center justify-center space-x-3 shadow-2xl"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
                                                    <span>UNSHARE FROM EMPLOYEE</span>
                                                </button>
                                            </div>
                                        ) : !isConfirmed ? (
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={isSubmitting}
                                                    className="p-6 rounded-[1.8rem] bg-zinc-950 text-zinc-600 border border-white/5 hover:bg-rose-950 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-xl"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsConfirmed(true);
                                                        finalizePayroll(false);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className="flex-1 py-6 rounded-[2rem] bg-orange-600 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-500 shadow-2xl shadow-orange-600/20 transition-all flex items-center justify-center space-x-3 group/btn"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    <span>APPROVE PAYROLL</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    onClick={() => setIsConfirmed(false)}
                                                    disabled={isSubmitting}
                                                    className="py-6 rounded-[2rem] bg-zinc-950 border border-white/5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-900 transition-all flex items-center justify-center space-x-3 text-white"
                                                >
                                                    <Edit3 className="h-4 w-4 text-orange-500" />
                                                    <span>BACK TO EDIT</span>
                                                </button>
                                                <button
                                                    onClick={() => finalizePayroll(true)}
                                                    disabled={isSubmitting}
                                                    className="py-6 rounded-[2rem] bg-orange-600 text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-500 shadow-2xl shadow-orange-600/20 transition-all flex items-center justify-center space-x-3 shadow-2xl"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Send className="h-4 w-4" />}
                                                    <span>SHARE WITH EMPLOYEE</span>
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
