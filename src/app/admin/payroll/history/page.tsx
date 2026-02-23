"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    ArrowLeft,
    Trash2,
    CheckCircle2,
    Download,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Payroll {
    id: string;
    employeeId: string;
    month: number;
    year: number;
    baseSalary: number;
    totalHours: number;
    netSalary: number;
    status: string;
    isShared: boolean;
    employee: {
        name: string;
        email: string;
    };
}

export default function PayrollHistoryPage() {
    const router = useRouter();
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/payroll/list?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                // Filter for sent payrolls
                setPayrolls(data.filter((p: Payroll) => p.isShared));
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payroll record? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/payroll/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setPayrolls(prev => prev.filter(p => p.id !== id));
            } else {
                alert("Failed to delete payroll record");
            }
        } catch (error) {
            console.error("Error deleting payroll:", error);
        }
    };

    const totalDisbursed = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-700 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] right-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <Link href="/admin/payroll" className="group flex items-center space-x-2 text-zinc-600 hover:text-orange-500 transition-all mb-4">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Nexus</span>
                    </Link>
                    <div className="flex items-center space-x-3 text-orange-500">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Terminal Archives</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Sent <span className="text-orange-500">History</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg">Historical record of finalized organizational disbursements.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-[2rem] shadow-2xl flex items-center space-x-4 backdrop-blur-3xl group">
                        <div className="relative">
                            <Calendar className="h-4 w-4 text-orange-600 animate-pulse" />
                            <div className="absolute inset-0 bg-orange-500/20 blur-lg" />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-black outline-none px-2 text-white appearance-none cursor-pointer hover:text-orange-500 transition-colors"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1} className="bg-zinc-950 text-white">
                                        {new Date(0, i).toLocaleString('default', { month: 'long' }).toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <div className="h-4 w-px bg-white/10" />
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-black outline-none px-2 text-white appearance-none cursor-pointer hover:text-orange-500 transition-colors"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Matrix */}
            <div className="glass-premium rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden min-h-[600px] relative group/matrix transition-all duration-1000">
                <div className="absolute inset-0 bg-black/40 -z-10" />

                <div className="p-10 border-b border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-3xl">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-orange-600 rounded-2xl shadow-[0_0_30px_rgba(255,122,0,0.3)]">
                            <CheckCircle2 className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Disbursement Ledger</h3>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Validated systemic resource allocation</p>
                        </div>
                    </div>
                    <div className="px-8 py-5 bg-zinc-900/50 border border-white/5 rounded-3xl text-right group-hover:glow-orange transition-all">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Total Disbursed</p>
                        <p className="text-3xl font-black text-orange-500 tracking-widest">$ {totalDisbursed.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 space-y-6">
                            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] animate-pulse">Decrypting Records...</p>
                        </div>
                    ) : payrolls.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {payrolls.map(pay => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={pay.id}
                                    className="p-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between group hover:border-orange-500/30 hover:bg-orange-600/[0.02] hover:glow-orange-sm transition-all duration-500 shadow-inner"
                                >
                                    <div className="flex items-center space-x-8">
                                        <div className="h-20 w-20 rounded-[1.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent" />
                                            <span className="relative z-10">{pay.employee.name[0]}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black text-white uppercase italic tracking-tight">{pay.employee.name}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-orange-600/10 border border-orange-500/20">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Sent</span>
                                                </div>
                                                <div className="h-4 w-px bg-white/5" />
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{pay.totalHours.toFixed(1)} Unit Cycles</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-10 mt-6 md:mt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Net Amount</p>
                                            <p className="text-3xl font-black text-white tracking-widest leading-none">$ {pay.netSalary.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleDelete(pay.id)}
                                                className="p-5 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all group/delete shadow-lg"
                                                title="Purge Record"
                                            >
                                                <Trash2 className="h-5 w-5 group-hover/delete:scale-110 transition-transform" />
                                            </button>
                                            <button
                                                className="p-5 rounded-2xl bg-orange-600 text-black hover:bg-orange-500 transition-all shadow-[0_0_20px_rgba(255,122,0,0.3)]"
                                                title="Export Data"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 space-y-8 group/stasis">
                            <div className="h-32 w-32 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-dashed border-white/5 shadow-inner group-hover/stasis:border-orange-500/20 transition-all duration-1000">
                                <Calendar className="h-10 w-10 text-zinc-800 group-hover/stasis:text-orange-950 transition-colors" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">Temporal Stasis</p>
                                <p className="text-zinc-500 font-bold">No organizational records detected for this cycle.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
