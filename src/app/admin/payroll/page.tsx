"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    ChevronRight,
    Search,
    CreditCard,
    Users as UsersIcon,
    ArrowRight,
    Edit3,
    Send,
    EyeOff,
    Trash2,
    Filter,
    TrendingUp
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { PayrollAdjustmentModal } from "@/components/payroll/adjustment-modal";

interface Employee {
    id: string;
    name: string;
    email: string;
    baseSalary: number;
    salaryType: string;
    position?: string;
}

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
    employee: Employee;
}

export default function AdminPayrollPage() {
    const [activeTab, setActiveTab] = useState("MANUAL");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    // Selection State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "SHARED" | "FINALIZED">("ALL");
    const [sortBy, setSortBy] = useState<"name" | "salary" | "status">("name");

    // Member Profile State
    const [employeeStats, setEmployeeStats] = useState<any>(null);
    const [fetchingStats, setFetchingStats] = useState(false);
    const [tempSalary, setTempSalary] = useState<{ base: number; type: string } | null>(null);

    // Loading State
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingSalary, setIsSavingSalary] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Deletion Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [payrollToDelete, setPayrollToDelete] = useState<{ id: string; employeeName: string } | null>(null);

    useEffect(() => {
        fetchData();
        fetchRoles();
    }, [selectedMonth, selectedYear]);

    // isConfirmed should reset when employee or month changes
    // This useEffect is removed as isConfirmed is no longer a state variable.

    // dailyRate and formulaDeductions are removed as employeeStats and localStats are no longer state variables.

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, payRes] = await Promise.all([
                fetch("/api/admin/employees"),
                fetch(`/api/admin/payroll/list?month=${selectedMonth}&year=${selectedYear}`)
            ]);

            if (empRes.ok && payRes.ok) {
                const empData = await empRes.json();
                const payData = await payRes.json();
                setEmployees(empData);
                setPayrolls(payData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/admin/roles");
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    const fetchEmployeeStats = async (empId: string) => {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
            setTempSalary({ base: emp.baseSalary || 0, type: emp.salaryType || "MONTHLY" });
        }

        setFetchingStats(true);
        setSelectedEmployeeId(empId);

        try {
            const res = await fetch(`/api/admin/employees/${empId}/attendance-stats?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setEmployeeStats(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingStats(false);
        }
    };

    const handleGeneratePayroll = async () => {
        if (!confirm("Are you sure you want to generate payroll for this period?")) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/admin/payroll/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month: selectedMonth, year: selectedYear })
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error generating payroll:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // redactPayroll is removed as isConfirmed is no longer a state variable.

    // finalizePayroll is removed as manualAdj, localStats are no longer state variables.


    const updateSalary = async (employeeId: string, baseSalary: number, salaryType: string) => {
        setIsSavingSalary(true);
        try {
            const res = await fetch("/api/admin/payroll/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, baseSalary, salaryType })
            });
            if (res.ok) {
                // Optimistic local update
                setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, baseSalary, salaryType } : e));
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingSalary(false);
        }
    };

    const handleSharePayroll = async (payrollId: string) => {
        try {
            const res = await fetch("/api/admin/payroll/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payrollId, isShared: true })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error sharing payroll:", error);
        }
    };

    const handleRedactPayroll = async (payrollId: string) => {
        try {
            const res = await fetch("/api/admin/payroll/redact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payrollId })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error redacting payroll:", error);
        }
    };

    const handleDeletePayroll = async (payrollId: string, employeeName: string) => {
        // Show custom confirmation dialog
        setPayrollToDelete({ id: payrollId, employeeName });
        setShowDeleteConfirm(true);
        setDeleteConfirmInput("");
    };

    const confirmDelete = async () => {
        if (!payrollToDelete || !payrollToDelete.employeeName) return;

        // Verify the input matches the employee name
        if (deleteConfirmInput.trim().toLowerCase() !== payrollToDelete.employeeName.toLowerCase()) {
            alert("Employee name does not match. Deletion cancelled.");
            return;
        }

        try {
            const res = await fetch(`/api/admin/payroll/${payrollToDelete.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchData();
                setShowDeleteConfirm(false);
                setPayrollToDelete(null);
                setDeleteConfirmInput("");
            }
        } catch (error) {
            console.error("Error deleting payroll:", error);
        } finally {
            setShowDeleteConfirm(false);
            setPayrollToDelete(null);
        }
    };


    const totalDisbursement = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const pendingPayouts = payrolls.filter(p => p.status !== "PAID").length;
    const draftCount = payrolls.filter(p => !p.isShared).length;
    const sharedCount = payrolls.filter(p => p.isShared).length;

    // Filter and sort payrolls
    const filteredPayrolls = payrolls
        .filter(p => {
            const matchesStatus = statusFilter === "ALL" ||
                (statusFilter === "DRAFT" && !p.isShared) ||
                (statusFilter === "SHARED" && p.isShared && p.status !== "FINALIZED") ||
                (statusFilter === "FINALIZED" && p.status === "FINALIZED");

            const employeeName = p.employee?.name || "";
            const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            const nameA = a.employee?.name || "";
            const nameB = b.employee?.name || "";

            if (sortBy === "name") return nameA.localeCompare(nameB);
            if (sortBy === "salary") return b.netSalary - a.netSalary;
            if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
            return 0;
        });

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Treasury Ops</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                        Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Nexus</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg">Manage organizational compensation and payout schedules.</p>
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
                    <button
                        onClick={handleGeneratePayroll}
                        disabled={isGenerating}
                        className="bg-zinc-900 text-white px-8 py-4 rounded-3xl font-black flex items-center space-x-2 shadow-xl hover:bg-black transition-all text-xs"
                    >
                        {isGenerating ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap className="h-5 w-5 fill-current" />
                                <span>Generate Run</span>
                            </>
                        )}
                    </button>

                    <Link
                        href="/admin/payroll/history"
                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-4 rounded-3xl font-black flex items-center space-x-2 hover:bg-emerald-100 transition-all text-xs"
                    >
                        <Clock className="h-5 w-5" />
                        <span>History</span>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Disbursement", value: `PKR ${totalDisbursement.toLocaleString()}`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Draft Payrolls", value: `${draftCount} Records`, icon: Edit3, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Shared Payrolls", value: `${sharedCount} Sent`, icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Payroll Stability", value: "Optimal", icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50" }
                ].map((stat) => (
                    <motion.div key={stat.label} variants={item} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center space-x-6">
                            <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                <stat.icon className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-zinc-900 tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Area */}
            <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-2xl overflow-hidden">
                <div className="flex border-b border-zinc-100">
                    <button
                        onClick={() => setActiveTab("MANUAL")}
                        className={cn("px-10 py-6 text-sm font-black uppercase tracking-widest transition-all border-b-2", activeTab === "MANUAL" ? "border-emerald-600 text-emerald-600 bg-emerald-50/30" : "border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50")}
                    >
                        Manual Payroll
                    </button>
                    <button
                        onClick={() => setActiveTab("HISTORY")}
                        className={cn("px-10 py-6 text-sm font-black uppercase tracking-widest transition-all border-b-2", activeTab === "HISTORY" ? "border-emerald-600 text-emerald-600 bg-emerald-50/30" : "border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50")}
                    >
                        Successive Ledger
                    </button>
                    <button
                        onClick={() => setActiveTab("CONFIG")}
                        className={cn("px-10 py-6 text-sm font-black uppercase tracking-widest transition-all border-b-2", activeTab === "CONFIG" ? "border-emerald-600 text-emerald-600 bg-emerald-50/30" : "border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50")}
                    >
                        Member Profiles
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === "CONFIG" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Compensation Hub</h3>
                                    <div className="relative w-64 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Seek Member..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => fetchEmployeeStats(emp.id)}
                                            className={cn(
                                                "w-full text-left p-6 rounded-[2rem] border transition-all flex items-center justify-between group",
                                                selectedEmployeeId === emp.id ? "bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-600/20 text-white" : "bg-zinc-50 border-zinc-100 hover:border-emerald-200 text-zinc-900"
                                            )}
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center font-black overflow-hidden shadow-lg", selectedEmployeeId === emp.id ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-500")}>
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black tracking-tight leading-none mb-1">{emp.name}</p>
                                                    <p className={cn("text-[9px] font-black uppercase tracking-widest", selectedEmployeeId === emp.id ? "text-emerald-100" : "text-zinc-400")}>{emp.position || "Node"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest", selectedEmployeeId === emp.id ? "bg-white/10" : "bg-white border border-zinc-100")}>
                                                    PKR {emp.baseSalary?.toLocaleString() || 0}
                                                </div>
                                                <ChevronRight className={cn("h-4 w-4 transition-transform", selectedEmployeeId === emp.id ? "translate-x-1" : "text-zinc-300")} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5">
                                <AnimatePresence mode="wait">
                                    {selectedEmployeeId ? (
                                        <motion.div
                                            key={selectedEmployeeId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden h-full min-h-[500px]"
                                        >
                                            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-[60px]" />

                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="flex items-center space-x-4 mb-10">
                                                    <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-3xl font-black">
                                                        {employees.find(e => e.id === selectedEmployeeId)?.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black tracking-tighter">{employees.find(e => e.id === selectedEmployeeId)?.name}</h4>
                                                        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Performance Analytics</p>
                                                    </div>
                                                </div>

                                                {fetchingStats ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                                        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Decrypting Attendance...</p>
                                                    </div>
                                                ) : employeeStats ? (
                                                    <div className="flex-1 space-y-8">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Presents</p>
                                                                <p className="text-3xl font-black text-emerald-500">{employeeStats.present}</p>
                                                            </div>
                                                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Lates</p>
                                                                <p className="text-3xl font-black text-amber-500">{employeeStats.late}</p>
                                                            </div>
                                                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Absences</p>
                                                                <p className="text-3xl font-black text-rose-500">{employeeStats.absent}</p>
                                                            </div>
                                                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Focus Hours</p>
                                                                <p className="text-3xl font-black text-blue-500">{employeeStats.totalHours.toFixed(1)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="flex justify-between items-end mb-2">
                                                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Attendance Reliability</p>
                                                                    <p className="text-xl font-black text-emerald-500">{employeeStats.present > 0 ? ((employeeStats.present / (employeeStats.present + employeeStats.late + employeeStats.absent)) * 100).toFixed(0) : 0}%</p>
                                                                </div>
                                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${employeeStats.present > 0 ? (employeeStats.present / (employeeStats.present + employeeStats.late + employeeStats.absent)) * 100 : 0}%` }}
                                                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t border-white/10 space-y-6">
                                                            <div className="space-y-4">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Core Compensation</p>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Base Salary</label>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                                            value={tempSalary?.base ?? 0}
                                                                            onChange={(e) => setTempSalary(prev => prev ? { ...prev, base: parseFloat(e.target.value) || 0 } : null)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Type</label>
                                                                        <select
                                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                                            value={tempSalary?.type ?? "MONTHLY"}
                                                                            onChange={(e) => setTempSalary(prev => prev ? { ...prev, type: e.target.value } : null)}
                                                                        >
                                                                            <option value="MONTHLY">Monthly</option>
                                                                            <option value="HOURLY">Hourly</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {tempSalary && (employees.find(e => e.id === selectedEmployeeId)?.baseSalary !== tempSalary.base || employees.find(e => e.id === selectedEmployeeId)?.salaryType !== tempSalary.type) && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            exit={{ opacity: 0, y: 10 }}
                                                                            className="pt-2"
                                                                        >
                                                                            <button
                                                                                onClick={() => updateSalary(selectedEmployeeId, tempSalary.base, tempSalary.type)}
                                                                                disabled={isSavingSalary}
                                                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                                                                            >
                                                                                {isSavingSalary ? (
                                                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                                ) : (
                                                                                    <>
                                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                                        <span>Confirm Changes</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                <AnimatePresence>
                                                                    {showSuccess && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                                            className="flex items-center justify-center space-x-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest pt-2"
                                                                        >
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                            <span>Success: Profile Updated</span>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>

                                                            <div className="pt-6 border-t border-white/10">
                                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Quick Insights</p>
                                                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-zinc-500 uppercase">Effective Date</p>
                                                                        <p className="text-xs font-black">Monthly Snapshot</p>
                                                                    </div>
                                                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-6 min-h-[500px]">
                                            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <UsersIcon className="h-10 w-10 text-zinc-200" />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-black text-zinc-900 tracking-tight">Select Member Profile</h4>
                                                <p className="text-zinc-500 font-medium text-sm max-w-xs mx-auto">Click on an employee to view their detailed attendance analytics and manage compensation.</p>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : activeTab === "MANUAL" ? (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Adjustment Ledger</h3>
                                    <div className="relative w-64 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Find Employee..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {employees.filter(e => (e.name || "").toLowerCase().includes(searchTerm.toLowerCase())).map(emp => {
                                        const hasPayroll = payrolls.some(p => p.employeeId === emp.id);
                                        const payroll = payrolls.find(p => p.employeeId === emp.id);
                                        return (
                                            <button
                                                key={emp.id}
                                                onClick={() => setSelectedEmployeeId(emp.id)}
                                                className="w-full text-left p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex items-center justify-between group h-full"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-zinc-200 text-zinc-500 flex items-center justify-center font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                        {emp.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-zinc-900 tracking-tight leading-none mb-1">{emp.name}</p>
                                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">PKR {emp.baseSalary?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {payroll?.isShared ? (
                                                        <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Sent</span>
                                                    ) : hasPayroll ? (
                                                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest">Draft</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-400 text-[9px] font-black uppercase tracking-widest">Pending</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </>
                    ) : (
                        <div className="space-y-8">
                            {/* Filters & Search Bar */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                <div className="flex items-center space-x-3">
                                    <Filter className="h-5 w-5 text-zinc-400" />
                                    <div className="flex items-center space-x-2">
                                        {["ALL", "DRAFT", "SHARED", "FINALIZED"].map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setStatusFilter(filter as any)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                    statusFilter === filter
                                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                                        : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                                                )}
                                            >
                                                {filter}
                                                {filter === "DRAFT" && draftCount > 0 && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">{draftCount}</span>
                                                )}
                                                {filter === "SHARED" && sharedCount > 0 && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">{sharedCount}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                                    <div className="relative w-64 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Find Record..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5"
                                    >
                                        <option value="name">Sort by Name</option>
                                        <option value="salary">Sort by Salary</option>
                                        <option value="status">Sort by Status</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payroll Cards Grid */}
                            {filteredPayrolls.length > 0 ? (
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {filteredPayrolls.map((pay) => {
                                        const isDraft = !pay.isShared;
                                        const isShared = pay.isShared && pay.status !== "FINALIZED";
                                        const isFinalized = pay.status === "FINALIZED";

                                        return (
                                            <motion.div
                                                key={pay.id}
                                                variants={item}
                                                className="group relative bg-white border border-zinc-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden"
                                            >
                                                {/* Background Gradient */}
                                                <div className={cn(
                                                    "absolute top-0 right-0 h-32 w-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isDraft && "bg-amber-500/20",
                                                    isShared && "bg-blue-500/20",
                                                    isFinalized && "bg-emerald-500/20"
                                                )} />

                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg",
                                                        isDraft && "bg-amber-100 text-amber-700 border border-amber-200",
                                                        isShared && "bg-blue-100 text-blue-700 border border-blue-200",
                                                        isFinalized && "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    )}>
                                                        {isDraft ? "Draft" : isShared ? "Shared" : "Finalized"}
                                                    </span>
                                                </div>

                                                {/* Employee Info */}
                                                <div className="relative z-10 mb-6">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className={cn(
                                                            "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg",
                                                            isDraft && "bg-amber-500 text-white",
                                                            isShared && "bg-blue-500 text-white",
                                                            isFinalized && "bg-emerald-500 text-white"
                                                        )}>
                                                            {pay.employee.name[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-lg font-black text-zinc-900 tracking-tight leading-none mb-1 truncate">
                                                                {pay.employee.name}
                                                            </p>
                                                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                                                {pay.employee.position || "Employee"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Attendance Summary */}
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 rounded-lg">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            <span className="text-[10px] font-black text-emerald-700">{pay.presents}P</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 px-2 py-1 bg-rose-50 rounded-lg">
                                                            <AlertCircle className="h-3 w-3 text-rose-600" />
                                                            <span className="text-[10px] font-black text-rose-700">{pay.absents}A</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-50 rounded-lg">
                                                            <Clock className="h-3 w-3 text-amber-600" />
                                                            <span className="text-[10px] font-black text-amber-700">{pay.lates}L</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Salary Breakdown */}
                                                <div className="relative z-10 space-y-3 mb-6">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-zinc-500 font-bold">Base Salary</span>
                                                        <span className="text-zinc-900 font-black">PKR {pay.baseSalary.toLocaleString()}</span>
                                                    </div>
                                                    {pay.bonus > 0 && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-emerald-500 font-bold">+ Bonus</span>
                                                            <span className="text-emerald-600 font-black">PKR {pay.bonus.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {pay.commission > 0 && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-blue-500 font-bold">+ Commission</span>
                                                            <span className="text-blue-600 font-black">PKR {pay.commission.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {pay.deductions > 0 && (
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-rose-500 font-bold">- Deductions</span>
                                                            <span className="text-rose-600 font-black">PKR {pay.deductions.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-3 border-t border-zinc-100">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Net Salary</span>
                                                            <span className="text-2xl font-black text-zinc-900 tracking-tighter">PKR {pay.netSalary.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="relative z-10 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedEmployeeId(pay.employeeId)}
                                                        className="flex-1 py-3 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-1"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                        <span>Edit</span>
                                                    </button>

                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleSharePayroll(pay.id)}
                                                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center space-x-1"
                                                            title="Share with Employee"
                                                        >
                                                            <Send className="h-3 w-3" />
                                                            <span>Share</span>
                                                        </button>
                                                    )}

                                                    {isShared && (
                                                        <button
                                                            onClick={() => handleRedactPayroll(pay.id)}
                                                            className="flex-1 py-3 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-1"
                                                            title="Redact (Unshare)"
                                                        >
                                                            <EyeOff className="h-3 w-3" />
                                                            <span>Redact</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeletePayroll(pay.id, pay.employee.name)}
                                                        className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <div className="py-20 text-center space-y-6">
                                    <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto border border-zinc-100 border-dashed">
                                        <Calendar className="h-10 w-10 text-zinc-200" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-zinc-900 tracking-tight">No Records Found</h4>
                                        <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                                            {statusFilter !== "ALL"
                                                ? `No ${statusFilter.toLowerCase()} payrolls found for this period.`
                                                : "Generate the payroll records for this period to populate the monthly ledger."
                                            }
                                        </p>
                                    </div>
                                    {statusFilter === "ALL" && (
                                        <button onClick={handleGeneratePayroll} className="text-sm font-black text-emerald-600 bg-emerald-50 px-8 py-3 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 uppercase tracking-widest">
                                            Generate Records
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                    }
                </div >
            </div >

            {selectedEmployeeId && (
                <PayrollAdjustmentModal
                    isOpen={!!selectedEmployeeId}
                    onClose={() => setSelectedEmployeeId(null)}
                    employee={employees.find(e => e.id === selectedEmployeeId)!}
                    currentPayroll={payrolls.find(p => p.employeeId === selectedEmployeeId && p.month === selectedMonth && p.year === selectedYear)}
                    month={selectedMonth}
                    year={selectedYear}
                    onUpdate={fetchData}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {showDeleteConfirm && payrollToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setPayrollToDelete(null);
                            setDeleteConfirmInput("");
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center mb-8">
                                <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-rose-600" />
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
                                    Confirm Deletion
                                </h3>
                                <p className="text-zinc-500 font-medium">
                                    This action cannot be undone. Please type the employee's name to confirm.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                        Employee Name
                                    </label>
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 mb-4">
                                        <p className="text-lg font-black text-zinc-900 tracking-tight">
                                            {payrollToDelete.employeeName}
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={deleteConfirmInput}
                                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                        placeholder="Type employee name to confirm"
                                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-zinc-900 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setPayrollToDelete(null);
                                            setDeleteConfirmInput("");
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-zinc-100 text-zinc-600 font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={!payrollToDelete?.employeeName || deleteConfirmInput.trim().toLowerCase() !== payrollToDelete.employeeName.toLowerCase()}
                                        className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Delete Payroll
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
}
