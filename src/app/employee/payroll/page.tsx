"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar,
    CreditCard,
    Download,
    ArrowRight,
    Clock,
    Zap,
    ShieldCheck,
    History,
    RefreshCcw,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EmployeePayrollPage() {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exportingId, setExportingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayroll();
    }, []);

    const fetchPayroll = async () => {
        try {
            const res = await fetch("/api/employee/payroll");
            if (res.ok) {
                const data = await res.json();
                setPayrolls(data.payrolls);
                setEmployee(data.employee);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async (pay: any) => {
        if (!employee) return;
        setExportingId(pay.id);
        try {
            const { generateDocumentPDF } = await import('@/lib/pdf-generator');

            const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(pay.periodYear, pay.periodMonth - 1));

            const docData = {
                id: pay.id,
                name: `Payslip - ${employee.name} - ${monthName} ${pay.periodYear}`,
                type: 'PAYROLL' as const,
                status: pay.status === 'PAID' ? 'SIGNED' : 'DRAFT',
                brandName: 'NBT CRM',
                createdAt: new Date().toISOString(),
                content: {
                    employeeName: employee.name,
                    designation: employee.position,
                    month: monthName,
                    year: pay.periodYear,
                    baseSalary: pay.baseSalary,
                    bonus: pay.bonus,
                    commission: pay.commission,
                    deductions: pay.deductions,
                    netSalary: pay.netSalary,
                    attendance: {
                        presents: pay.presents,
                        absents: pay.absents,
                        lates: pay.lates,
                        totalHours: pay.totalHours || 0
                    }
                }
            };

            const pdfBlob = await generateDocumentPDF(docData);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Payslip_${employee.name.replace(/\s+/g, "_")}_${monthName}_${pay.periodYear}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to generate payslip.');
        } finally {
            setExportingId(null);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { x: -20, opacity: 0 },
        show: { x: 0, opacity: 1 }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <div className="h-14 w-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Verifying Compensation Ledger...</p>
            </div>
        </div>
    );

    return (
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-12 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Compensation Vault</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Earnings</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg max-w-xl">Transparent access to your monthly payout history and digitized payslips.</p>
                </div>

                <div className="hidden lg:flex items-center p-3 bg-white rounded-3xl border border-zinc-100 shadow-xl">
                    <div className="flex items-center space-x-4 px-6 py-2 border-r border-zinc-100">
                        <CreditCard className="h-5 w-5 text-zinc-400" />
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Preferred Route</p>
                            <p className="text-sm font-black text-zinc-900 tracking-tighter">Bank Transfer</p>
                        </div>
                    </div>
                    <div className="px-6 py-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {payrolls.length === 0 ? (
                        <div className="bg-white rounded-[4rem] p-20 text-center space-y-6 border border-zinc-100 shadow-2xl">
                            <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100 border-dashed">
                                <History className="h-10 w-10 text-zinc-200" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">No Pay Slips Generated</h3>
                            <p className="text-zinc-500 font-medium max-w-sm mx-auto">Your earnings will appear here once the administrative team completes the monthly cycle.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {payrolls.map((pay, idx) => (
                                <div className="flex flex-col w-full group">
                                    <div className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/40 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-all">
                                        <div className="flex items-center space-x-8">
                                            <div className="h-20 w-20 rounded-[2rem] bg-zinc-900 flex flex-col items-center justify-center text-white shadow-xl shadow-zinc-900/20">
                                                <span className="text-[10px] font-black uppercase opacity-50">{new Date(0, pay.periodMonth - 1).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-2xl font-black leading-none">{pay.periodYear.toString().slice(-2)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">Monthly Disbursement</h4>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center text-zinc-400 space-x-2">
                                                        <Clock className="h-3 w-3" />
                                                        <span className="text-xs font-bold leading-none">{pay.totalHours.toFixed(1)} Focus Hours</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        <span className="text-emerald-500">{pay.presents} Presents</span>
                                                        <span className="text-rose-500">{pay.absents} Absents</span>
                                                        <span className="text-amber-500">{pay.lates} Lates</span>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                        pay.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
                                                    )}>
                                                        {pay.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-zinc-50">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Net Earnings</p>
                                                <p className="text-3xl font-black text-zinc-900 tracking-tighter leading-none"><span className="text-sm mr-1">PKR</span>{pay.netSalary.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleExportPDF(pay)}
                                                disabled={exportingId === pay.id}
                                                className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                                            >
                                                {exportingId === pay.id ? (
                                                    <RefreshCcw className="h-6 w-6 animate-spin text-emerald-500" />
                                                ) : (
                                                    <Download className="h-6 w-6" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Itemized Breakdown */}
                                    <div className="mx-12 -mt-4 p-8 pt-10 bg-zinc-50/50 rounded-b-[2.5rem] border border-zinc-100 border-t-0 grid grid-cols-2 lg:grid-cols-4 gap-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 relative -z-10">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Base Component</p>
                                            <p className="text-lg font-black text-zinc-900">PKR {pay.baseSalary.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Performance/Bonus</p>
                                            <p className="text-lg font-black text-emerald-600">+ PKR {(pay.bonus || 0 + (pay.commission || 0)).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Deductions</p>
                                            <p className="text-lg font-black text-rose-600">- PKR {(pay.deductions || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Payable Net</p>
                                            <p className="font-black text-zinc-900 underline decoration-emerald-500/30">PKR {pay.netSalary.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-zinc-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/20 rounded-full blur-[60px]" />
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <Zap className="h-8 w-8 text-emerald-400 fill-current mb-4" />
                                <h3 className="text-3xl font-black leading-none">Fiscal Intelligence</h3>
                                <p className="text-zinc-500 text-sm font-bold">Monitor your annual growth and earnings velocity directly from our premium financial hub.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Year to Date</p>
                                    <p className="text-3xl font-black tracking-tighter text-white"><span className="text-sm mr-1">PKR</span>{payrolls.reduce((sum, p) => sum + p.netSalary, 0).toFixed(2)}</p>
                                </div>
                                <button className="w-full flex items-center justify-between p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
                                    <span className="text-sm font-black uppercase tracking-widest">Support Nexus</span>
                                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
