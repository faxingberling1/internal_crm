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
    TrendingUp,
    Wallet
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
        <div className="space-y-16 pb-32 relative overflow-hidden isolate animate-in fade-in duration-1000">
            {/* Architectural Glows */}
            <div className="absolute top-[5%] right-[-10%] w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

            {/* Header Identity */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-10 relative group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600/5 blur-[80px] -z-10 group-hover:bg-orange-600/10 transition-colors duration-1000" />

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500 group/title">
                        <div className="h-px w-8 bg-orange-500/50 group-hover/title:w-12 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Payroll Management</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white leading-none uppercase italic">
                        Payroll <span className="text-orange-500">Dashboard</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg max-w-xl tracking-tight leading-relaxed">
                        <span className="h-2 w-2 rounded-full bg-orange-600 inline-block animate-pulse mr-3 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                        Efficient management of employee compensation and payroll records.
                    </p>
                </div>

                <div className="flex items-center space-x-6 relative z-10">
                    <div className="glass-premium p-2 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center space-x-1">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-orange-500 outline-none px-6 py-3 rounded-2xl appearance-none cursor-pointer hover:bg-zinc-900 transition-colors border border-white/5"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' }).toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none px-6 py-3 rounded-2xl appearance-none cursor-pointer hover:bg-zinc-900 transition-colors border border-white/5"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>CY-{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleGeneratePayroll}
                        disabled={isGenerating}
                        className="bg-orange-600 text-black px-10 py-5 rounded-[2rem] font-black flex items-center space-x-3 shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest relative overflow-hidden group/gen"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/gen:translate-x-[100%] transition-transform duration-700" />
                        {isGenerating ? (
                            <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap className="h-5 w-5 fill-current" />
                                <span>Process Payroll</span>
                            </>
                        )}
                    </button>

                    <Link
                        href="/admin/payroll/history"
                        className="glass-premium text-orange-500 border border-orange-500/20 px-8 py-5 rounded-[2rem] font-black flex items-center space-x-3 hover:bg-orange-500/10 transition-all text-[10px] uppercase tracking-widest"
                    >
                        <Clock className="h-5 w-5" />
                        <span>Payroll History</span>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Paid", value: `$ ${totalDisbursement.toLocaleString()}`, icon: CreditCard, color: "text-orange-500", glow: "glow-orange" },
                    { label: "Drafts", value: `${draftCount}`, icon: Edit3, color: "text-orange-500/80", glow: "glow-orange" },
                    { label: "Shared Payrolls", value: `${sharedCount}`, icon: Send, color: "text-orange-500/60", glow: "glow-orange" },
                    { label: "Performance Status", value: "Optimal", icon: CheckCircle2, color: "text-orange-400", glow: "glow-orange" }
                ].map((stat) => (
                    <motion.div key={stat.label} variants={item} className="glass-premium p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:glow-orange transition-all duration-700">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-600/5 rounded-full blur-3xl group-hover:bg-orange-600/10 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col space-y-6">
                            <div className={cn("h-14 w-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 duration-500", stat.color)}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] group-hover:text-orange-500/80 transition-colors">{stat.label}</p>
                                <p className="text-3xl font-black text-white tracking-tighter tabular-nums italic group-hover:scale-105 transition-all origin-left duration-500">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Operational Matrix */}
            <div className="glass-premium rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative group/matrix hover:glow-orange transition-all duration-1000">
                <div className="absolute inset-0 bg-black/40 -z-10" />
                <div className="flex bg-[#0c0c0c]/80 border-b border-white/5 p-2 overflow-x-auto">
                    {[
                        { id: "MANUAL", label: "Salary Adjustments" },
                        { id: "HISTORY", label: "Payroll History" },
                        { id: "CONFIG", label: "Employee Salaries" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-[2.5rem] relative overflow-hidden group/tab",
                                activeTab === tab.id
                                    ? "text-orange-500 bg-orange-500/5"
                                    : "text-zinc-600 hover:text-orange-500 hover:bg-orange-500/5"
                            )}
                        >
                            <span className="relative z-10">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-600 rounded-full shadow-[0_0_10px_rgba(255,100,0,0.8)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === "CONFIG" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <div className="lg:col-span-7 space-y-6">
                                <div className="flex items-center justify-between mb-10 px-4">
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Employee <span className="text-orange-500">Salaries</span></h3>
                                    <div className="relative w-72 group/search">
                                        <Search className="absolute left-5 top-1/2 -track-y-1/2 h-4 w-4 text-zinc-600 group-hover/search:text-orange-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="SEARCH EMPLOYEE..."
                                            className="w-full bg-zinc-950 border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-[10px] font-black tracking-widest focus:ring-4 focus:ring-orange-500/5 focus:bg-zinc-900 transition-all outline-none text-white placeholder:text-zinc-800"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                    {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => fetchEmployeeStats(emp.id)}
                                            className={cn(
                                                "w-full text-left p-8 rounded-[2.5rem] border transition-all flex items-center justify-between group/card relative overflow-hidden isolate",
                                                selectedEmployeeId === emp.id
                                                    ? "bg-orange-600/10 border-orange-600/30 shadow-[0_0_40px_rgba(255,100,0,0.05)]"
                                                    : "bg-zinc-950 border-white/5 hover:border-orange-500/20 hover:bg-zinc-900"
                                            )}
                                        >
                                            {selectedEmployeeId === emp.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/[0.05] via-transparent to-transparent -z-10" />
                                            )}
                                            <div className="flex items-center space-x-6">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center font-black overflow-hidden shadow-2xl transition-all duration-500 group-hover/card:scale-110",
                                                    selectedEmployeeId === emp.id ? "bg-orange-600 text-black" : "bg-zinc-950 text-zinc-500"
                                                )}>
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <p className={cn("text-lg font-black tracking-widest leading-none mb-2 uppercase italic transition-colors", selectedEmployeeId === emp.id ? "text-white" : "text-zinc-400 group-hover/card:text-white")}>{emp.name}</p>
                                                    <p className={cn("text-[8px] font-black uppercase tracking-[0.4em]", selectedEmployeeId === emp.id ? "text-orange-500/80" : "text-zinc-600")}>{emp.position || "Employee"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className={cn("px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-inner transition-all", selectedEmployeeId === emp.id ? "bg-orange-600/10 text-orange-500 border border-orange-500/20" : "bg-black/40 text-zinc-600 border border-white/5 group-hover/card:border-orange-500/20")}>
                                                    $ {emp.baseSalary?.toLocaleString() || 0}
                                                </div>
                                                <ChevronRight className={cn("h-5 w-5 transition-all duration-500", selectedEmployeeId === emp.id ? "translate-x-2 text-orange-500" : "text-zinc-800 group-hover/card:text-zinc-500")} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-5 relative">
                                <AnimatePresence mode="wait">
                                    {selectedEmployeeId ? (
                                        <motion.div
                                            key={selectedEmployeeId}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-zinc-950 rounded-[3.5rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden h-full min-h-[600px] group/profile hover:glow-orange transition-all duration-1000"
                                        >
                                            <div className="absolute top-0 right-0 h-40 w-40 bg-orange-600/5 rounded-full blur-[60px]" />

                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="flex items-center space-x-6 mb-12">
                                                    <div className="h-20 w-20 rounded-[2rem] bg-orange-600 flex items-center justify-center text-4xl font-black text-black shadow-[0_0_30px_rgba(255,100,0,0.2)] group-hover/profile:scale-105 transition-transform duration-700">
                                                        {employees.find(e => e.id === selectedEmployeeId)?.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-3xl font-black tracking-tighter text-white uppercase italic">{employees.find(e => e.id === selectedEmployeeId)?.name}</h4>
                                                        <p className="text-[9px] font-black uppercase text-orange-500 tracking-[0.4em]">Employee Statistics</p>
                                                    </div>
                                                </div>

                                                {fetchingStats ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                                        <div className="h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,100,0,0.1)]" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">Loading Data...</p>
                                                    </div>
                                                ) : employeeStats ? (
                                                    <div className="flex-1 space-y-10">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            {[
                                                                { label: "Presence", val: employeeStats.present, color: "text-orange-500" },
                                                                { label: "Late", val: employeeStats.late, color: "text-orange-400" },
                                                                { label: "Absence", val: employeeStats.absent, color: "text-zinc-600" },
                                                                { label: "Total Hours", val: employeeStats.totalHours.toFixed(1), color: "text-white" }
                                                            ].map((stat) => (
                                                                <div key={stat.label} className="p-8 bg-black/40 border border-white/5 rounded-[2rem] group/stat hover:border-orange-500/20 transition-all">
                                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 group-hover/stat:text-orange-500/60">{stat.label}</p>
                                                                    <p className={cn("text-4xl font-black italic tabular-nums", stat.color)}>{stat.val}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Attendance Rate</span>
                                                                <p className="text-2xl font-black text-orange-500 italic">
                                                                    {employeeStats.present > 0 ? ((employeeStats.present / (employeeStats.present + employeeStats.late + employeeStats.absent)) * 100).toFixed(0) : 0}%
                                                                </p>
                                                            </div>
                                                            <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${employeeStats.present > 0 ? (employeeStats.present / (employeeStats.present + employeeStats.late + employeeStats.absent)) * 100 : 0}%` }}
                                                                    className="h-full bg-orange-600 rounded-full shadow-[0_0_15px_rgba(255,100,0,0.5)] relative overflow-hidden"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                                </motion.div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-10 border-t border-white/5 space-y-8">
                                                            <div className="space-y-6">
                                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Salary Configuration</p>
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Base Salary</label>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-[11px] font-black outline-none focus:ring-2 focus:ring-orange-600/50 focus:bg-black transition-all text-white placeholder:text-zinc-800"
                                                                            value={tempSalary?.base ?? 0}
                                                                            onChange={(e) => setTempSalary(prev => prev ? { ...prev, base: parseFloat(e.target.value) || 0 } : null)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Salary Type</label>
                                                                        <select
                                                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-[11px] font-black outline-none focus:ring-2 focus:ring-orange-600/50 focus:bg-black transition-all text-white appearance-none cursor-pointer"
                                                                            value={tempSalary?.type ?? "MONTHLY"}
                                                                            onChange={(e) => setTempSalary(prev => prev ? { ...prev, type: e.target.value } : null)}
                                                                        >
                                                                            <option value="MONTHLY">MONTHLY</option>
                                                                            <option value="HOURLY">HOURLY</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {tempSalary && (employees.find(e => e.id === selectedEmployeeId)?.baseSalary !== tempSalary.base || employees.find(e => e.id === selectedEmployeeId)?.salaryType !== tempSalary.type) && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                                            className="pt-4"
                                                                        >
                                                                            <button
                                                                                onClick={() => updateSalary(selectedEmployeeId, tempSalary.base, tempSalary.type)}
                                                                                disabled={isSavingSalary}
                                                                                className="w-full bg-orange-600 hover:bg-orange-500 text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-orange-500/10 transition-all flex items-center justify-center space-x-3 relative overflow-hidden group/confirm"
                                                                            >
                                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/confirm:translate-x-[100%] transition-transform duration-700" />
                                                                                {isSavingSalary ? (
                                                                                    <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                                                ) : (
                                                                                    <>
                                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                                        <span>Save Salary Changes</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                {showSuccess && (
                                                                    <div className="flex items-center justify-center space-x-3 text-orange-500 font-black text-[9px] uppercase tracking-[0.4em] pt-4 animate-in fade-in slide-in-from-top-2">
                                                                        <div className="h-1 w-8 bg-orange-500/20 rounded-full" />
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                        <span>Salary Updated</span>
                                                                        <div className="h-1 w-8 bg-orange-500/20 rounded-full" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-zinc-950 border border-white/5 rounded-[4rem] p-16 flex flex-col items-center justify-center space-y-10 min-h-[600px] group/empty shadow-2xl relative overflow-hidden h-full">
                                            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                                            <div className="h-32 w-32 bg-zinc-900 rounded-full flex items-center justify-center shadow-inner border border-white/5 group-hover/empty:scale-110 group-hover/empty:border-orange-500/20 transition-all duration-1000">
                                                <UsersIcon className="h-12 w-12 text-zinc-800 group-hover/empty:text-orange-600/40 transition-colors" />
                                            </div>
                                            <div className="text-center space-y-4 relative z-10">
                                                <h4 className="text-2xl font-black text-white tracking-widest uppercase italic italic">Select <span className="text-orange-500">Employee</span></h4>
                                                <p className="text-zinc-600 font-bold text-sm max-w-xs mx-auto tracking-tight leading-relaxed">
                                                    Select an employee profile to manage salary and view attendance.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : activeTab === "MANUAL" ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Salary <span className="text-orange-500">Adjustments</span></h3>
                                <div className="relative w-80 group/search">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover/search:text-orange-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH EMPLOYEES..."
                                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-widest focus:ring-4 focus:ring-orange-500/5 focus:bg-zinc-900 transition-all outline-none text-white placeholder:text-zinc-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-2 max-h-[700px] overflow-y-auto custom-scrollbar">
                                {employees.filter(e => (e.name || "").toLowerCase().includes(searchTerm.toLowerCase())).map(emp => {
                                    const hasPayroll = payrolls.some(p => p.employeeId === emp.id);
                                    const payroll = payrolls.find(p => p.employeeId === emp.id);
                                    return (
                                        <button
                                            key={emp.id}
                                            onClick={() => setSelectedEmployeeId(emp.id)}
                                            className="w-full text-left p-8 rounded-[3rem] bg-zinc-950 border border-white/5 hover:border-orange-500/30 hover:bg-zinc-900/50 hover:glow-orange-sm transition-all duration-500 flex items-center justify-between group h-full relative overflow-hidden isolate shadow-2xl"
                                        >
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                                            <div className="flex items-center space-x-5">
                                                <div className="h-14 w-14 rounded-2xl bg-zinc-900 text-zinc-600 flex items-center justify-center font-black group-hover:bg-orange-600 group-hover:text-black transition-all duration-500 group-hover:scale-110 shadow-xl">
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-white tracking-widest leading-none mb-2 uppercase italic group-hover:text-orange-500 transition-colors">{emp.name}</p>
                                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">$ {emp.baseSalary?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {payroll?.isShared ? (
                                                    <span className="px-4 py-1.5 rounded-xl bg-orange-600 text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">SENT</span>
                                                ) : hasPayroll ? (
                                                    <span className="px-4 py-1.5 rounded-xl bg-zinc-900 text-orange-500 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest">DRAFT</span>
                                                ) : (
                                                    <span className="px-4 py-1.5 rounded-xl bg-zinc-950 text-zinc-800 border border-white/5 text-[9px] font-black uppercase tracking-widest">PENDING</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                            {/* Filters & Search Bar */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center space-x-3 mr-4">
                                        <Filter className="h-5 w-5 text-zinc-600" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Filter View</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {["ALL", "DRAFT", "SHARED", "FINALIZED"].map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setStatusFilter(filter as any)}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/f",
                                                    statusFilter === filter
                                                        ? "bg-orange-600 text-black shadow-xl shadow-orange-500/20"
                                                        : "bg-zinc-950 text-zinc-500 hover:bg-zinc-900 hover:text-orange-500 border border-white/5"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/f:translate-x-[100%] transition-transform duration-700" />
                                                <span className="relative z-10">
                                                    {filter}
                                                    {filter === "DRAFT" && draftCount > 0 && (
                                                        <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-[9px] font-black">{draftCount}</span>
                                                    )}
                                                    {filter === "SHARED" && sharedCount > 0 && (
                                                        <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-[9px] font-black">{sharedCount}</span>
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="relative w-72 group/search">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover/search:text-orange-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="SEARCH RECORDS..."
                                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-widest focus:ring-4 focus:ring-orange-500/5 focus:bg-zinc-900 transition-all outline-none text-white placeholder:text-zinc-800 shadow-2xl"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-orange-500/5 text-orange-500 appearance-none cursor-pointer hover:bg-zinc-900 transition-colors shadow-2xl"
                                    >
                                        <option value="name">SORT BY NAME</option>
                                        <option value="salary">SORT BY SALARY</option>
                                        <option value="status">SORT BY STATUS</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payroll Cards Grid */}
                            {filteredPayrolls.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPayrolls.map((pay) => {
                                        const isDraft = !pay.isShared;
                                        const isShared = pay.isShared && pay.status !== "FINALIZED";
                                        const isFinalized = pay.status === "FINALIZED";

                                        return (
                                            <div
                                                key={pay.id}
                                                className="group relative bg-zinc-950 border border-white/5 rounded-[3.5rem] p-10 hover:glow-orange transition-all duration-700 overflow-hidden shadow-2xl isolate"
                                            >
                                                <div className="absolute inset-0 bg-black/40 -z-10" />
                                                <div className={cn(
                                                    "absolute -top-10 -right-10 h-40 w-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                                                    isDraft && "bg-orange-500/10",
                                                    isShared && "bg-orange-600/20",
                                                    isFinalized && "bg-orange-400/15"
                                                )} />

                                                <div className="absolute top-8 right-8 z-20">
                                                    <span className={cn(
                                                        "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl border transition-all duration-500",
                                                        isDraft && "bg-transparent text-orange-500 border-orange-500/20",
                                                        isShared && "bg-orange-600 text-black border-orange-600 shadow-orange-600/10 animate-pulse",
                                                        isFinalized && "bg-zinc-900 text-zinc-500 border-white/5 hover:text-orange-400"
                                                    )}>
                                                        {isDraft ? "Draft" : isShared ? "Shared" : "Finalized"}
                                                    </span>
                                                </div>

                                                <div className="relative z-10 mb-10">
                                                    <div className="flex items-center space-x-6 mb-8">
                                                        <div className={cn(
                                                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-2xl transition-all duration-700 group-hover:scale-110",
                                                            isDraft ? "bg-orange-600 text-black shadow-orange-600/20" :
                                                                isShared ? "bg-orange-500 text-black shadow-orange-500/20" :
                                                                    "bg-zinc-900 text-zinc-400 border border-white/5"
                                                        )}>
                                                            {pay.employee.name[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xl font-black text-white tracking-widest leading-none mb-2 uppercase italic transition-colors group-hover:text-orange-500">
                                                                {pay.employee.name}
                                                            </p>
                                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                                                                {pay.employee.position || "Employee"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                                        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 group/bit hover:border-orange-500/20 transition-all">
                                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 group-hover/bit:text-orange-500/60">PR</span>
                                                            <span className="text-lg font-black text-orange-500 italic tabular-nums">{pay.presents}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 group/bit hover:border-orange-500/20 transition-all">
                                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 group-hover/bit:text-orange-500/60">AB</span>
                                                            <span className="text-lg font-black text-zinc-400 italic tabular-nums">{pay.absents}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 group/bit hover:border-orange-500/20 transition-all">
                                                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1 group-hover/bit:text-orange-500/60">LT</span>
                                                            <span className="text-lg font-black text-orange-600/80 italic tabular-nums">{pay.lates}</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 bg-black/20 rounded-[2rem] border border-white/5 backdrop-blur-sm group-hover:border-orange-500/10 transition-all">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Net Salary</p>
                                                            <TrendingUp className="h-3 w-3 text-orange-500/40" />
                                                        </div>
                                                        <p className="text-3xl font-black text-white italic tracking-tighter tabular-nums group-hover:scale-105 transition-transform origin-left duration-500">
                                                            <span className="text-orange-500">RS.</span> {pay.netSalary.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 relative z-20">
                                                    <button
                                                        onClick={() => setSelectedEmployeeId(pay.employeeId)}
                                                        className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all shadow-xl"
                                                    >
                                                        Review
                                                    </button>
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleSharePayroll(pay.id)}
                                                            className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/sh"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/sh:translate-x-[100%] transition-transform duration-700" />
                                                            Share
                                                        </button>
                                                    )}
                                                    {isShared && (
                                                        <div className="flex-1 flex gap-2">
                                                            <button
                                                                onClick={() => handleRedactPayroll(pay.id)}
                                                                className="flex items-center justify-center p-4 bg-black hover:bg-zinc-950 text-zinc-600 hover:text-orange-500 rounded-2xl border border-white/5 transition-all shadow-xl"
                                                                title="Unshare"
                                                            >
                                                                <EyeOff className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePayroll(pay.id, pay.employee.name)}
                                                                className="flex items-center justify-center p-4 bg-black hover:bg-rose-950 text-zinc-600 hover:text-rose-500 rounded-2xl border border-white/5 transition-all shadow-xl"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-40 flex flex-col items-center justify-center space-y-10 glass-premium rounded-[4rem] border border-white/5 group/empty isolate relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/40 -z-10" />
                                    <div className="h-32 w-32 bg-zinc-950 rounded-full flex items-center justify-center border border-white/10 shadow-inner group-hover/empty:scale-110 group-hover/empty:border-orange-500/20 transition-all duration-1000">
                                        <Wallet className="h-14 w-14 text-zinc-800 group-hover/empty:text-orange-600/40 transition-colors" />
                                    </div>
                                    <div className="text-center space-y-4 relative z-10">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">No <span className="text-orange-500">Records</span></h3>
                                        <p className="text-zinc-600 font-bold text-sm max-w-sm mx-auto tracking-tight leading-relaxed">
                                            No payroll records found for this period.
                                        </p>
                                    </div>
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
                            className="glass-premium rounded-[3.5rem] p-12 max-w-md w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-3xl -z-10" />

                            <div className="text-center mb-10">
                                <div className="h-20 w-20 rounded-3xl bg-orange-600/10 flex items-center justify-center mx-auto mb-6 border border-orange-600/20 shadow-[0_0_20px_rgba(255,100,0,0.1)]">
                                    <AlertCircle className="h-10 w-10 text-orange-500 shadow-orange-500/50" />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter mb-3 uppercase italic">
                                    Confirm <span className="text-orange-500">Deletion</span>
                                </h3>
                                <p className="text-zinc-500 font-bold text-sm tracking-tight">
                                    This payroll record will be permanently deleted.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2">
                                        Employee Name
                                    </label>
                                    <div className="p-6 bg-zinc-950 rounded-2xl border border-white/5 mb-4 shadow-inner">
                                        <p className="text-xl font-black text-orange-500 tracking-widest italic uppercase">
                                            {payrollToDelete.employeeName}
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={deleteConfirmInput}
                                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                        placeholder="TYPE EMPLOYEE NAME TO CONFIRM"
                                        className="w-full px-6 py-4 rounded-2xl bg-zinc-950 border border-white/5 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 outline-none font-black text-[10px] tracking-[0.2em] text-white transition-all placeholder:text-zinc-800"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setPayrollToDelete(null);
                                            setDeleteConfirmInput("");
                                        }}
                                        className="flex-1 py-5 rounded-[1.5rem] bg-zinc-950 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 border border-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={!payrollToDelete?.employeeName || deleteConfirmInput.trim().toLowerCase() !== payrollToDelete.employeeName.toLowerCase()}
                                        className="flex-1 py-5 rounded-[1.5rem] bg-orange-600 text-black font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 shadow-xl shadow-orange-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative overflow-hidden group/del"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/del:translate-x-[100%] transition-transform duration-700" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
