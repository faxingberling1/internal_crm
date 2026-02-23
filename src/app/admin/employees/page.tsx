"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Mail,
    Calendar,
    ShieldCheck,
    Clock,
    Search,
    ChevronRight,
    BadgeCheck,
    AlertTriangle,
    Filter,
    Activity,
    Plus,
    MoreHorizontal,
    Briefcase,
    Globe,
    Zap,
    Sparkles,
    ShieldAlert,
    Hash,
    Power,
    Key,
    Lock,
    X,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
    id: string;
    employeeNumber?: string;
    name: string;
    email: string;
    position?: string;
    department?: string;
    shiftStart?: string;
    shiftEnd?: string;
    createdAt: string;
    userId?: string;
    user?: {
        isApproved: boolean;
        role: string;
        createdAt: string;
    };
    _count?: {
        attendance: number;
    };
}

export default function AdminEmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Member Edit State (Pass/Shift)
    const [resetUser, setResetUser] = useState<Employee | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [editShiftStart, setEditShiftStart] = useState("");
    const [editShiftEnd, setEditShiftEnd] = useState("");
    const [editRole, setEditRole] = useState("USER");
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/employees");
            const data = await res.json();
            if (res.ok) {
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAccess = async (userId: string, currentStatus: boolean) => {
        setUpdatingId(userId);
        try {
            const res = await fetch("/api/admin/employees/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    isApproved: !currentStatus
                })
            });

            if (res.ok) {
                setEmployees(prev => prev.map(emp =>
                    emp.userId === userId ? { ...emp, user: { ...emp.user!, isApproved: !currentStatus } } : emp
                ));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return "??";
        try {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    const handleResetPassword = async () => {
        if (!resetUser) return;

        setIsResetting(true);
        try {
            const res = await fetch("/api/admin/employees/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: resetUser.userId,
                    newPassword: newPassword || undefined,
                    shiftStart: editShiftStart || undefined,
                    shiftEnd: editShiftEnd || undefined,
                    role: editRole || undefined
                })
            });

            if (res.ok) {
                // Optimistic update for shifts and roles
                setEmployees(prev => prev.map(emp =>
                    emp.id === resetUser.id ? {
                        ...emp,
                        shiftStart: editShiftStart,
                        shiftEnd: editShiftEnd,
                        user: emp.user ? { ...emp.user, role: editRole } : emp.user
                    } : emp
                ));

                setResetSuccess(true);
                setTimeout(() => {
                    setResetUser(null);
                    setNewPassword("");
                    setEditShiftStart("");
                    setEditShiftEnd("");
                    setResetSuccess(false);
                }, 2000);
            } else {
                alert("Failed to update credentials");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsResetting(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
    (emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeNumber?.toLowerCase().includes(search.toLowerCase()))
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-10 pb-10"
        >
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3">
                    <motion.div variants={item} className="flex items-center space-x-2 text-orange-600">
                        <Globe className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Employee Directory</span>
                    </motion.div>
                    <motion.h2 variants={item} className="text-6xl font-black tracking-tighter text-white uppercase">
                        Member <span className="text-orange-600 font-black">Management</span>
                    </motion.h2>
                    <motion.p variants={item} className="text-zinc-600 font-bold text-sm uppercase tracking-[0.2em]">
                        Manage employee profiles and modify access permissions for the entire organization roster.
                    </motion.p>
                </div>

                <motion.div variants={item} className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600/40 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify member or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-16 pr-10 py-6 bg-black border border-white/5 rounded-[2.5rem] shadow-2xl focus:ring-4 focus:ring-orange-500/10 outline-none transition-all w-full md:w-[28rem] font-black text-white placeholder:text-zinc-800 uppercase text-xs tracking-widest"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Registry Quick-Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Capacity", value: employees.length, icon: Users, color: "!bg-black !bg-none text-white border-white/5" },
                    { label: "Verified Nodes", value: employees.filter(e => e.user?.isApproved).length, icon: BadgeCheck, color: "!bg-black !bg-none text-orange-400 border-orange-950/30" },
                    { label: "Revoked/Pending", value: employees.filter(e => !e.user?.isApproved).length, icon: ShieldAlert, color: "!bg-black !bg-none text-red-500 border-red-950/30" },
                    { label: "Operational Pulse", value: "98.2%", icon: Activity, color: "!bg-black !bg-none text-orange-600 border-orange-500/20 shadow-[0_0_20px_rgba(255,122,0,0.1)]" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        whileHover={{ y: -5 }}
                        className={cn(
                            "glass-premium p-10 shadow-2xl relative overflow-hidden group border hover:glow-orange transition-all duration-500",
                            stat.color,
                            "rounded-[3rem]"
                        )}
                    >
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
                                <stat.icon className="h-6 w-6 opacity-40 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                            <p className="text-5xl font-black tabular-nums tracking-widest">{stat.value}</p>
                        </div>
                        <div className="absolute right-0 bottom-0 -mb-12 -mr-12 h-40 w-40 bg-orange-600 opacity-0 group-hover:opacity-[0.05] rounded-full blur-3xl transition-all duration-700" />
                    </motion.div>
                ))}
            </div>

            {/* Global Roster Table */}
            <motion.div variants={item} className="glass-premium border border-white/5 shadow-2xl overflow-hidden p-0 rounded-[3.5rem]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#050505] border-b border-white/5">
                            <tr>
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Biological ID & Core</th>
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Designation</th>
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Access Control</th>
                                <th className="px-12 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 text-right">ID Signature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-white/5">
                                        <td colSpan={4} className="px-12 py-12">
                                            <div className="flex items-center space-x-6">
                                                <div className="h-16 w-16 bg-zinc-900/50 rounded-2xl" />
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-zinc-900/50 rounded w-40" />
                                                    <div className="h-3 bg-zinc-900/30 rounded w-64" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-12 py-40 text-center">
                                        <div className="flex flex-col items-center space-y-6">
                                            <div className="h-24 w-24 bg-zinc-950 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                                                <Users className="h-10 w-10 text-zinc-800" />
                                            </div>
                                            <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px]">Registry Empty / Identification Fault</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <motion.tr
                                        key={emp.id}
                                        whileHover={{ backgroundColor: "rgba(255, 122, 0, 0.02)" }}
                                        className="group transition-all border-b border-white/5 last:border-0"
                                    >
                                        <td className="px-12 py-10">
                                            <div className="flex items-center space-x-8">
                                                <div className="relative">
                                                    <div className="h-20 w-20 rounded-[2rem] bg-black flex items-center justify-center border border-white/5 shadow-2xl group-hover:border-orange-500/40 transition-all duration-500 overflow-hidden">
                                                        <span className="text-2xl font-black text-white">{emp.name?.charAt(0)}</span>
                                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600/20 group-hover:bg-orange-600 transition-colors" />
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-[6px] border-[#0c0c0c] transition-all duration-500 shadow-lg",
                                                        emp.user?.isApproved ? "bg-orange-500 shadow-orange-500/20" : "bg-red-600 shadow-red-500/20"
                                                    )} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3">
                                                        <p className="font-black text-white tracking-widest text-xl uppercase">{emp.name}</p>
                                                        {emp.user?.role === "ADMIN" && (
                                                            <div className="bg-orange-600/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center shadow-lg">
                                                                <Zap className="h-2.5 w-2.5 mr-1.5 fill-current" />
                                                                Director
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-zinc-700 font-black uppercase tracking-widest mt-2 gap-3">
                                                        <Mail className="h-3.5 w-3.5 opacity-40 text-orange-600" />
                                                        {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center space-x-5">
                                                <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-xl group-hover:border-orange-500/20 transition-all">
                                                    <Briefcase className="h-5 w-5 text-zinc-700 group-hover:text-orange-600 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white tracking-widest uppercase">{emp.position || "Staff Node"}</p>
                                                    <div className="flex items-center space-x-3 mt-1.5">
                                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">{emp.department || "General Division"}</p>
                                                        {(emp.shiftStart || emp.shiftEnd) && (
                                                            <>
                                                                <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center">
                                                                    <Clock className="h-3 w-3 mr-1.5" />
                                                                    {formatTime(emp.shiftStart || "")} - {formatTime(emp.shiftEnd || "")}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center space-x-6">
                                                <button
                                                    onClick={() => emp.userId && handleToggleAccess(emp.userId, emp.user?.isApproved || false)}
                                                    disabled={updatingId === emp.userId || emp.user?.role === "ADMIN"}
                                                    className={cn(
                                                        "flex items-center space-x-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-2xl",
                                                        emp.user?.isApproved
                                                            ? "bg-orange-600/10 text-orange-500 border-orange-500/20 hover:bg-red-600/10 hover:text-red-500 hover:border-red-500/20"
                                                            : "bg-red-600/10 text-red-500 border-red-500/20 hover:bg-orange-600/10 hover:text-orange-500 hover:border-orange-500/20",
                                                        (updatingId === emp.userId || emp.user?.role === "ADMIN") && "opacity-30 cursor-not-allowed"
                                                    )}
                                                >
                                                    {updatingId === emp.userId ? (
                                                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Power className="h-4 w-4" />
                                                            <span>{emp.user?.isApproved ? "Revoke Access" : "Approve Employee"}</span>
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setResetUser(emp);
                                                        setEditShiftStart(emp.shiftStart || "");
                                                        setEditShiftEnd(emp.shiftEnd || "");
                                                        setEditRole(emp.user?.role || "USER");
                                                    }}
                                                    disabled={emp.user?.role === "ADMIN" && emp.email !== "admin@nbt.com"}
                                                    className="h-11 w-11 flex items-center justify-center bg-black border border-white/5 rounded-2xl text-zinc-700 hover:text-orange-500 hover:border-orange-500/40 transition-all shadow-xl"
                                                    title="Modify Credentials"
                                                >
                                                    <Key className="h-5 w-5" />
                                                </button>

                                                <div className={cn(
                                                    "h-2.5 w-2.5 rounded-full",
                                                    emp.user?.isApproved ? "bg-orange-500 shadow-[0_0_12px_rgba(255,122,0,0.6)]" : "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]"
                                                )} />
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className="inline-flex items-center space-x-3 bg-black px-6 py-3 rounded-2xl text-[10px] font-black text-white shadow-2xl border border-white/5">
                                                    <Hash className="h-4 w-4 text-orange-600" />
                                                    <span className="tracking-[0.2em]">{emp.employeeNumber || "UNASSIGNED"}</span>
                                                </div>
                                                <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest leading-none">Global Index Signature</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Premium Action Footer */}
            <motion.div variants={item} className="flex justify-center">
                <button className="flex items-center space-x-5 glass-premium border border-white/5 px-14 py-7 rounded-[3rem] shadow-2xl hover:glow-orange transition-all hover:scale-[1.03] active:scale-95 group">
                    <div className="h-12 w-12 bg-orange-600 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <span className="font-black text-xs text-white tracking-[0.3em] uppercase">Deploy Registry Analytics</span>
                    <ChevronRight className="h-5 w-5 text-zinc-800 group-hover:translate-x-3 transition-transform" />
                </button>
            </motion.div>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {resetUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setResetUser(null)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative w-full max-w-lg bg-[#050505] rounded-[4rem] shadow-2xl overflow-hidden border border-white/5 p-1"
                        >
                            <div className="glass-premium rounded-[3.8rem] p-12 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="h-16 w-16 bg-orange-600/10 rounded-[1.8rem] flex items-center justify-center border border-orange-500/20 shadow-2xl">
                                        <Lock className="h-7 w-7 text-orange-600" />
                                    </div>
                                    <button
                                        onClick={() => setResetUser(null)}
                                        className="h-12 w-12 flex items-center justify-center rounded-full bg-zinc-950 border border-white/5 hover:bg-red-600/10 hover:border-red-500/20 transition-all group"
                                    >
                                        <X className="h-5 w-5 text-zinc-700 group-hover:text-red-500" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black tracking-widest text-white uppercase">Password Reset</h3>
                                    <p className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.3em]">
                                        Modifying authorization for <span className="text-orange-600 italic">"{resetUser.name}"</span>
                                    </p>
                                </div>

                                {resetSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-orange-600/10 border border-orange-500/20 rounded-[2.5rem] p-12 text-center space-y-5 shadow-2xl"
                                    >
                                        <div className="h-16 w-16 bg-orange-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,122,0,0.4)]">
                                            <BadgeCheck className="h-8 w-8 text-black" />
                                        </div>
                                        <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px]">Employee Data Updated</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 ml-2">New Command Signature</label>
                                                <div className="relative group">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600/30 group-focus-within:text-orange-600 transition-colors" />
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter encrypted string..."
                                                        className="w-full bg-black border border-white/5 rounded-[1.8rem] py-6 pl-16 pr-6 text-xs font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-white placeholder:text-zinc-900 uppercase tracking-widest"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 ml-2">Authorization Tier</label>
                                                <div className="relative group">
                                                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600/30 group-focus-within:text-orange-600 transition-colors" />
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value)}
                                                        className="w-full bg-black border border-white/5 rounded-[1.8rem] py-6 pl-16 pr-6 text-xs font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all appearance-none text-white uppercase tracking-widest"
                                                    >
                                                        <option value="USER">Standard Node (USER)</option>
                                                        <option value="ADMIN">Director Node (ADMIN)</option>
                                                        <option value="MANAGER">Manager Level</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 ml-2">Node Start</label>
                                                    <div className="relative group">
                                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/30 group-focus-within:text-orange-600 transition-colors" />
                                                        <input
                                                            type="time"
                                                            value={editShiftStart}
                                                            onChange={(e) => setEditShiftStart(e.target.value)}
                                                            className="w-full bg-black border border-white/5 rounded-[1.8rem] py-6 pl-14 pr-4 text-xs font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-white tracking-widest"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 ml-2">Node End</label>
                                                    <div className="relative group">
                                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/30 group-focus-within:text-orange-600 transition-colors" />
                                                        <input
                                                            type="time"
                                                            value={editShiftEnd}
                                                            onChange={(e) => setEditShiftEnd(e.target.value)}
                                                            className="w-full bg-black border border-white/5 rounded-[1.8rem] py-6 pl-14 pr-4 text-xs font-black outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all text-white tracking-widest"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleResetPassword}
                                            disabled={isResetting}
                                            className="w-full bg-orange-600 text-black font-black uppercase tracking-[0.4em] text-xs py-7 rounded-[2rem] hover:bg-orange-500 transition-all shadow-[0_0_50px_-10px_rgba(255,122,0,0.5)] disabled:opacity-50 flex items-center justify-center space-x-4 group overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-orange-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            {isResetting ? (
                                                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Shield className="h-5 w-5 relative z-10" />
                                                    <span className="relative z-10">Execute Authorization</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
