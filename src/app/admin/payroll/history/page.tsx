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
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Link href="/admin/payroll" className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Payroll</span>
                    </Link>
                    <div className="flex items-center space-x-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Archives</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                        Sent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">History</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-3xl border border-zinc-100 shadow-xl flex items-center space-x-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-transparent text-sm font-black outline-none px-4"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-transparent text-sm font-black outline-none px-4"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-2xl overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-zinc-900">Disbursement Log</h3>
                        <p className="text-sm font-medium text-zinc-500">Record of all finalized and sent payroll invoices.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Disbursed</p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">PKR {totalDisbursed.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                        </div>
                    ) : payrolls.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {payrolls.map(pay => (
                                <div key={pay.id} className="p-6 bg-white border border-zinc-100 rounded-3xl flex items-center justify-between group hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                                    <div className="flex items-center space-x-6">
                                        <div className="h-16 w-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                                            {pay.employee.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-zinc-900 leading-none mb-1">{pay.employee.name}</p>
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Sent</span>
                                                <span className="text-xs font-bold text-zinc-400">•</span>
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{pay.totalHours.toFixed(1)} Hours Logged</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Net Salary</p>
                                            <p className="text-2xl font-black text-zinc-900 tracking-tighter">PKR {pay.netSalary.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDelete(pay.id)}
                                                className="p-4 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 border-dashed">
                                <Calendar className="h-8 w-8 text-zinc-300" />
                            </div>
                            <p className="text-zinc-400 font-bold">No sent payrolls found for this period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
