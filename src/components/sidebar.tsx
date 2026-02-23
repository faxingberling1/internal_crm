"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    PhoneCall,
    Settings,
    UserPlus,
    BarChart3,
    Clock,
    ShieldCheck,
    Package,
    CreditCard,
    DollarSign,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useUser } from "@/components/user-context";
import { LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const commonNavigation = [
    { name: "Leaderboard", href: "/", icon: BarChart3, roles: ["ADMIN"] },
    { name: "My Dashboard", href: "/employee/dashboard", icon: LayoutDashboard, roles: ["USER", "ADMIN"] },
];

const operationalNavigation = [
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Packages", href: "/packages", icon: Package },
    { name: "Projects", href: "/projects", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: UserPlus },
    { name: "Calls", href: "/calls", icon: PhoneCall },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
];

const employeeTools = [
    { name: "My Attendance", href: "/attendance", icon: Clock },
    { name: "My Payroll", href: "/employee/payroll", icon: CreditCard },
];

const adminTools = [
    { name: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { name: "User Management", href: "/admin/employees", icon: Users },
    { name: "Payroll Dashboard", href: "/admin/payroll", icon: DollarSign },
    { name: "Attendance Logs", href: "/admin/attendance", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useUser();
    const [securityEnabled, setSecurityEnabled] = useState(false);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetch('/api/settings/branding')
                .then(res => res.json())
                .then(data => setSecurityEnabled(data.isSecurityEnabled || false))
                .catch(() => setSecurityEnabled(false));
        }
    }, [user]);

    if (!user) return null;

    const isAdmin = user.role === "ADMIN";

    const sections = [
        {
            title: "Main Dashboard",
            items: commonNavigation.filter(item => !item.roles || item.roles.includes(user.role))
        },
        {
            title: "Business Processes",
            items: operationalNavigation
        },
        {
            title: isAdmin ? "Administrative" : "Personal Tools",
            items: isAdmin ? adminTools : employeeTools
        }
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-[#050505] border-r border-white/5 relative isolate z-[100] pointer-events-auto overflow-hidden">
            {/* Mesh Glow Refinement */}
            <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-gradient-to-b from-orange-500/10 to-transparent blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[40%] bg-gradient-to-t from-orange-600/5 to-transparent blur-[100px] -z-10 pointer-events-none" />
            <div className="flex h-20 items-center px-6 gap-3 border-b border-white/5 bg-black/[0.2]">
                <div className="flex-shrink-0">
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z" fill="#FF7A00" />
                        <path d="M12 14L18 10V30L12 26V14Z" fill="#050505" />
                        <path d="M18 10L28 16V24L18 30V10Z" fill="#050505" fillOpacity="0.8" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-lg font-black text-white leading-none tracking-tight">
                        Neon <span className="text-orange-500">Byte</span>
                    </h1>
                    <p className="text-[10px] font-black text-zinc-600 tracking-widest uppercase mt-1">
                        Technologies
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-8 px-3 py-6 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.title} className="mb-8 last:mb-0">
                        <h3 className="px-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">
                            {section.title}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center px-3 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 border border-transparent",
                                            isActive
                                                ? "bg-orange-600 text-black shadow-[0_0_30px_-5px_rgba(255,122,0,0.6)] border-orange-500/50"
                                                : "text-zinc-600 hover:text-orange-500 hover:bg-orange-500/[0.03] hover:border-orange-500/10"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                                isActive ? "text-black" : "text-zinc-500 group-hover:text-orange-500"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto border-t border-white/5 p-6 space-y-4 bg-black/40 backdrop-blur-2xl">
                <div className="px-4 py-4 rounded-2xl bg-black/[0.3] border border-white/5 group transition-all hover:bg-orange-500/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Profile Overview</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    </div>
                    <p className="text-xs font-black text-white truncate tracking-tight">{user.name || user.email}</p>
                    <div className="mt-2 text-left">
                        <span className="text-[9px] font-black text-white bg-orange-600 px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-orange-900/20">{user.role}</span>
                    </div>
                </div>

                {/* Security Status Badge (Admin Only) */}
                {user.role === 'ADMIN' && (
                    <div className={`px-3 py-2.5 rounded-xl border transition-all ${securityEnabled
                        ? 'bg-red-950/20 border-red-900/30'
                        : 'bg-zinc-950/40 border-zinc-800/20'
                        }`}>
                        <div className="flex items-center space-x-2">
                            <Shield className={`h-4 w-4 ${securityEnabled ? 'text-red-600' : 'text-zinc-400'
                                }`} />
                            <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Security</p>
                                <p className={`text-[10px] font-black uppercase tracking-tight ${securityEnabled ? 'text-red-600' : 'text-zinc-500'
                                    }`}>
                                    {securityEnabled ? '🔒 Lockdown Active' : 'Disabled'}
                                </p>
                            </div>
                            {securityEnabled && (
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            )}
                        </div>
                    </div>
                )}
                <Link
                    href="/settings"
                    className="group flex items-center px-3 py-2 text-sm font-bold text-zinc-600 hover:text-orange-500 hover:bg-orange-500/[0.03] rounded-xl transition-all"
                >
                    <Settings className="mr-3 h-5 w-5 text-zinc-600 group-hover:text-white" />
                    Settings
                </Link>
                <button
                    onClick={logout}
                    className="w-full group flex items-center px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
