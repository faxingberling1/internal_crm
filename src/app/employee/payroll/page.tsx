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
            <div className="flex flex-col items-center space-y-6">
                <div className="h-16 w-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]" />
                <p className="text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Verifying Compensation Ledger...</p>
            </div>
        </div>
    );

    return (
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-16 pb-32 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group">
                        <div className="h-px w-8 bg-orange-500/50 group-hover:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Compensation Vault 3.0</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
                        My <span className="text-orange-500 italic">Earnings</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg max-w-xl tracking-tight">Transparent access to your monthly payout history and digitized payslips.</p>
                </div>

                <div className="hidden lg:flex items-center p-3 glass-premium rounded-[2.5rem] border border-white/5 shadow-2xl hover:glow-orange transition-all duration-700">
                    <div className="flex items-center space-x-6 px-8 py-3 border-r border-white/5">
                        <CreditCard className="h-6 w-6 text-orange-600" />
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Preferred Route</p>
                            <p className="text-sm font-black text-white tracking-tighter uppercase italic">Bank Transfer</p>
                        </div>
                    </div>
                    <div className="px-8 py-3">
                        <ShieldCheck className="h-6 w-6 text-orange-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-10">
                    {payrolls.length === 0 ? (
                        <div className="glass-premium rounded-[4rem] p-24 text-center space-y-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-zinc-900/[0.01] -z-10 group-hover:bg-orange-500/[0.01] transition-colors duration-1000" />
                            <div className="h-28 w-28 bg-zinc-950 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                                <History className="h-12 w-12 text-zinc-800 group-hover:text-orange-600/20 transition-colors duration-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Vast <span className="text-orange-500">Silence</span></h3>
                                <p className="text-zinc-600 font-bold max-w-sm mx-auto leading-relaxed tracking-tight">Your earnings will appear here once the administrative team completes the monthly cycle.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {payrolls.map((pay, idx) => (
                                <div key={pay.id} className="flex flex-col w-full group isolate">
                                    <div className="glass-premium rounded-[3rem] p-10 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 hover:glow-orange transition-all duration-700 relative overflow-hidden">
                                        {/* Row Decorative line */}
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-600/20 group-hover:bg-orange-600 transition-all duration-700" />

                                        <div className="flex items-center space-x-10">
                                            <div className="h-24 w-24 rounded-[2rem] bg-zinc-950 border border-white/5 flex flex-col items-center justify-center text-white shadow-2xl group-hover:border-orange-500/20 transition-colors duration-700 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-[11px] font-black uppercase text-zinc-500 group-hover:text-orange-500 transition-colors z-10">{new Date(0, pay.periodMonth - 1).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-3xl font-black leading-none tracking-tighter z-10">{pay.periodYear.toString().slice(-2)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-3xl font-black text-white tracking-tighter leading-none mb-4 italic uppercase flex items-center gap-3">
                                                    Disbursement
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-6">
                                                    <div className="flex items-center text-zinc-600 space-x-3 bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                                                        <Clock className="h-4 w-4 text-orange-600" />
                                                        <span className="text-xs font-black tracking-widest uppercase">{pay.totalHours.toFixed(1)} Focus Hours</span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-[9px] font-black uppercase tracking-[0.2em]">
                                                        <span className="text-orange-500/80">{pay.presents} PRST</span>
                                                        <span className="text-zinc-700">{pay.absents} ABST</span>
                                                        <span className="text-orange-300/40">{pay.lates} LATE</span>
                                                    </div>
                                                    <span className={cn(
                                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                        pay.status === "PAID"
                                                            ? "bg-orange-600/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(255,100,0,0.1)]"
                                                            : "bg-zinc-950 text-zinc-700 border-white/5"
                                                    )}>
                                                        {pay.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-12 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-8 md:pt-0 border-white/5 mt-4 md:mt-0">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mb-3">Net Earnings</p>
                                                <p className="text-4xl font-black text-white tracking-tighter leading-none flex items-center justify-end">
                                                    <span className="text-xs text-orange-600 mr-2 font-black italic">$</span>
                                                    {pay.netSalary.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleExportPDF(pay)}
                                                disabled={exportingId === pay.id}
                                                className="h-16 w-16 rounded-[1.5rem] bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 hover:bg-orange-600 hover:text-black hover:border-orange-500 transition-all shadow-2xl relative group/btn"
                                            >
                                                <div className="absolute inset-0 bg-orange-600/10 blur-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                {exportingId === pay.id ? (
                                                    <RefreshCcw className="h-7 w-7 animate-spin text-orange-500 z-10" />
                                                ) : (
                                                    <Download className="h-7 w-7 z-10" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Itemized Breakdown */}
                                    <div className="mx-12 -mt-4 p-10 pt-14 glass-premium rounded-b-[2.5rem] border border-white/5 border-t-0 grid grid-cols-2 lg:grid-cols-4 gap-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-20px] group-hover:translate-y-0 relative -z-10 shadow-2xl bg-black/60">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Base Component</p>
                                            <p className="text-xl font-black text-zinc-300 tracking-tight italic">$ {pay.baseSalary.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-1">Incentive Layer</p>
                                            <p className="text-xl font-black text-orange-500 tracking-tight">
                                                <span className="mr-1">+</span> $ {(pay.bonus + (pay.commission || 0)).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1">Deductions</p>
                                            <p className="text-xl font-black text-zinc-800 tracking-tight opacity-50 italic">
                                                <span className="mr-1">-</span> $ {(pay.deductions || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-orange-700 uppercase tracking-[0.3em] mb-1">Total Payable</p>
                                            <p className="text-xl font-black text-white underline decoration-orange-600/50 decoration-2 underline-offset-8">$ {pay.netSalary.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#0A0A0A] rounded-[4rem] p-12 text-white border border-white/5 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] hover:border-orange-500/20 transition-all duration-1000 group">
                        <div className="absolute top-[-20%] right-[-20%] h-80 w-80 bg-orange-600/[0.03] rounded-full blur-[100px] group-hover:bg-orange-600/5 transition-colors duration-1000" />
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <Zap className="h-10 w-10 text-orange-600 fill-current mb-6 shadow-[0_0_20px_rgba(255,100,0,0.3)] group-hover:scale-110 transition-transform duration-500" />
                                <h3 className="text-4xl font-black leading-none tracking-tighter italic uppercase">Fiscal <br /><span className="text-orange-500">Intelligence</span></h3>
                                <p className="text-zinc-600 text-sm font-bold tracking-tight max-w-xs">Monitor your annual growth and earnings velocity directly from our premium financial hub.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-zinc-950/40 border border-white/5 backdrop-blur-3xl shadow-inner group-hover:border-orange-500/10 transition-colors">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600/60 mb-3">Total Year to Date</p>
                                    <p className="text-4xl font-black tracking-tighter text-white flex items-end">
                                        <span className="text-xs text-orange-700 mr-2 font-black italic mb-1">$</span>
                                        {payrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <button className="w-full flex items-center justify-between p-8 rounded-[2rem] border border-white/5 hover:bg-orange-600 hover:text-black hover:border-orange-500 transition-all group/support relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 translate-x-[-100%] group-hover/support:translate-x-[100%] transition-transform duration-700" />
                                    <span className="text-xs font-black uppercase tracking-[0.3em] z-10">Help Center</span>
                                    <ArrowRight className="h-6 w-6 transform group-hover/support:translate-x-1 transition-transform z-10" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
