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
                <div className="space-y-2">
                    <motion.div variants={item} className="flex items-center space-x-2 text-purple-600">
                        <Globe className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Registry Core</span>
                    </motion.div>
                    <motion.h2 variants={item} className="text-5xl font-black tracking-tighter text-zinc-900">
                        Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-black">Management</span>
                    </motion.h2>
                    <motion.p variants={item} className="text-zinc-500 font-bold text-lg max-w-xl">
                        Identify nodes and modify authorization protocols for the entire organization roster.
                    </motion.p>
                </div>

                <motion.div variants={item} className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify member or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-8 py-5 bg-white border border-zinc-100 rounded-[2rem] shadow-xl shadow-zinc-200/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all w-full md:w-96 font-black text-zinc-900 placeholder:text-zinc-300"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Registry Quick-Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Capacity", value: employees.length, icon: Users, color: "!bg-zinc-950 !bg-none text-white border-zinc-800" },
                    { label: "Verified Nodes", value: employees.filter(e => e.user?.isApproved).length, icon: BadgeCheck, color: "!bg-zinc-950 !bg-none text-emerald-400 border-emerald-900/30" },
                    { label: "Revoked/Pending", value: employees.filter(e => !e.user?.isApproved).length, icon: ShieldAlert, color: "!bg-zinc-950 !bg-none text-orange-400 border-orange-900/30" },
                    { label: "Operational Pulse", value: "98.2%", icon: Activity, color: "!bg-zinc-950 !bg-none text-blue-400 border-blue-900/30" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        whileHover={{ y: -5 }}
                        className={cn(
                            "premium-card p-8 shadow-2xl relative overflow-hidden group border",
                            stat.color
                        )}
                    >
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
                                <stat.icon className="h-5 w-5 opacity-40 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-4xl font-black tabular-nums tracking-tighter">{stat.value}</p>
                        </div>
                        <div className="absolute right-0 bottom-0 -mb-8 -mr-8 h-32 w-32 bg-current opacity-[0.03] rounded-full blur-3xl transition-all group-hover:opacity-[0.06]" />
                    </motion.div>
                ))}
            </div>

            {/* Global Roster Table */}
            <motion.div variants={item} className="premium-card bg-white border border-zinc-100 shadow-2xl overflow-hidden p-0 rounded-[3.5rem]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Biological ID & Core</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Designation</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Access Control</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-right">ID Signature</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-10 py-10">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-14 w-14 bg-zinc-100 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-zinc-100 rounded w-32" />
                                                    <div className="h-3 bg-zinc-100 rounded w-48" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-100">
                                                <Users className="h-8 w-8 text-zinc-200" />
                                            </div>
                                            <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">Registry Empty / No Matches</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <motion.tr
                                        key={emp.id}
                                        whileHover={{ backgroundColor: "rgba(250, 250, 250, 1)" }}
                                        className="group transition-all"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center space-x-6">
                                                <div className="relative">
                                                    <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center border shadow-xl group-hover:shadow-purple-500/20 transition-all">
                                                        <span className="text-lg font-black text-white">{emp.name?.charAt(0)}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white transition-colors duration-500",
                                                        emp.user?.isApproved ? "bg-emerald-500" : "bg-red-500"
                                                    )} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-black text-zinc-900 tracking-tighter text-xl">{emp.name}</p>
                                                        {emp.user?.role === "ADMIN" && (
                                                            <div className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase flex items-center">
                                                                <Zap className="h-2 w-2 mr-1 fill-current" />
                                                                Director
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-xs text-zinc-500 font-bold gap-2 mt-1">
                                                        <Mail className="h-3 w-3 opacity-40" />
                                                        {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                                                    <Briefcase className="h-4 w-4 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-zinc-900 tracking-tight">{emp.position || "Staff Node"}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{emp.department || "General Division"}</p>
                                                        {(emp.shiftStart || emp.shiftEnd) && (
                                                            <>
                                                                <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                                                <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest flex items-center">
                                                                    <Clock className="h-2 w-2 mr-1" />
                                                                    {formatTime(emp.shiftStart || "")} - {formatTime(emp.shiftEnd || "")}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => emp.userId && handleToggleAccess(emp.userId, emp.user?.isApproved || false)}
                                                    disabled={updatingId === emp.userId || emp.user?.role === "ADMIN"}
                                                    className={cn(
                                                        "flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                                        emp.user?.isApproved
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-red-50 hover:text-red-700 hover:border-red-100"
                                                            : "bg-red-50 text-red-700 border-red-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100",
                                                        (updatingId === emp.userId || emp.user?.role === "ADMIN") && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {updatingId === emp.userId ? (
                                                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Power className="h-3 w-3" />
                                                            <span>{emp.user?.isApproved ? "Revoke Access" : "Grant Access"}</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Password Reset Trigger */}
                                                <button
                                                    onClick={() => {
                                                        setResetUser(emp);
                                                        setEditShiftStart(emp.shiftStart || "");
                                                        setEditShiftEnd(emp.shiftEnd || "");
                                                        setEditRole(emp.user?.role || "USER");
                                                    }}
                                                    disabled={emp.user?.role === "ADMIN" && emp.email !== "admin@nbt.com"} // Prevent editing other admins for safety, allow own
                                                    className="h-9 w-9 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-400 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-100 transition-all shadow-sm"
                                                    title="Modify Credentials"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </button>

                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    emp.user?.isApproved ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                )} />
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex flex-col items-end space-y-1">
                                                <div className="inline-flex items-center space-x-2 bg-zinc-900 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-lg shadow-zinc-900/10">
                                                    <Hash className="h-3 w-3 text-purple-400" />
                                                    <span className="tracking-widest">{emp.employeeNumber || "UNASSIGNED"}</span>
                                                </div>
                                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Global Index Signature</p>
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
                <button className="flex items-center space-x-3 bg-white border border-zinc-100 px-10 py-5 rounded-[2.5rem] shadow-2xl hover:shadow-zinc-300 transition-all hover:scale-105 active:scale-95 group">
                    <div className="h-8 w-8 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-black text-sm text-zinc-900 tracking-tight">Deploy Registry Analytics Report</span>
                    <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                                        <Lock className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <button
                                        onClick={() => setResetUser(null)}
                                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-50 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-zinc-400" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tighter text-zinc-900">Credential Reset</h3>
                                    <p className="text-zinc-500 font-bold text-sm">
                                        Modifying authorization for <span className="text-purple-600 font-black">{resetUser.name}</span>
                                    </p>
                                </div>

                                {resetSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center space-y-3"
                                    >
                                        <div className="h-12 w-12 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-200">
                                            <BadgeCheck className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-emerald-700 font-black uppercase tracking-widest text-[10px]">Registry Updated Successfully</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">New Command Protocol (Password)</label>
                                                <div className="relative group">
                                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new signature..."
                                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-200 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Authorization Tier (Role)</label>
                                                <div className="relative group">
                                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value)}
                                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-200 transition-all appearance-none"
                                                    >
                                                        <option value="USER">Standard Node (USER)</option>
                                                        <option value="ADMIN">Director Node (ADMIN)</option>
                                                        <option value="MANAGER">Manager (Coming Soon)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Shift Start (PKT)</label>
                                                    <div className="relative group">
                                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                                                        <input
                                                            type="time"
                                                            value={editShiftStart}
                                                            onChange={(e) => setEditShiftStart(e.target.value)}
                                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-200 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Shift End (PKT)</label>
                                                    <div className="relative group">
                                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                                                        <input
                                                            type="time"
                                                            value={editShiftEnd}
                                                            onChange={(e) => setEditShiftEnd(e.target.value)}
                                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-200 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleResetPassword}
                                            disabled={isResetting}
                                            className="w-full bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl hover:bg-purple-600 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center space-x-3 group"
                                        >
                                            {isResetting ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                    <span>Authorize Updates</span>
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
