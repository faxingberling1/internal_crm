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
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useUser } from "@/components/user-context";
import { LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/notification-bell";

const commonNavigation = [
    { name: "Leaderboard", href: "/", icon: BarChart3, roles: ["ADMIN"] },
    { name: "My Dashboard", href: "/employee/dashboard", icon: LayoutDashboard, roles: ["USER"] },
];

const operationalNavigation = [
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Packages", href: "/packages", icon: Package },
    { name: "Projects", href: "/projects", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: UserPlus },
    { name: "Calls", href: "/calls", icon: PhoneCall },
];

const employeeTools = [
    { name: "My Attendance", href: "/attendance", icon: Clock },
];

const adminTools = [
    { name: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { name: "User Management", href: "/admin/employees", icon: Users },
    { name: "Attendance Monitor", href: "/admin/attendance", icon: BarChart3 },
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
            title: "Core Mission",
            items: commonNavigation.filter(item => !item.roles || item.roles.includes(user.role))
        },
        {
            title: "Operations",
            items: operationalNavigation
        },
        {
            title: isAdmin ? "Administrative" : "Personal Tools",
            items: isAdmin ? adminTools : employeeTools
        }
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-50 border-r border-zinc-200 relative isolate z-[100] pointer-events-auto">
            <div className="flex h-20 items-center justify-between px-6">
                <h1 className="text-2xl font-black tracking-tighter text-zinc-900">
                    INTERNAL <span className="text-purple-600">PORTAL</span>
                </h1>
                <NotificationBell />
            </div>

            <nav className="flex-1 space-y-8 px-3 py-6 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.title} className="mb-8 last:mb-0">
                        <h3 className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
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
                                            "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                                isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"
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

            <div className="border-t border-zinc-200 p-6 space-y-3 bg-white/50 backdrop-blur-sm">
                <div className="px-3 py-3 mb-2 rounded-2xl bg-zinc-100/50 border border-zinc-200/50">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Identity Verified</p>
                    <p className="text-xs font-black text-zinc-900 truncate">{user.name || user.email}</p>
                    <div className="mt-2">
                        <span className="text-[8px] font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">{user.role}</span>
                    </div>
                </div>

                {/* Security Status Badge (Admin Only) */}
                {user.role === 'ADMIN' && (
                    <div className={`px-3 py-2.5 rounded-xl border transition-all ${securityEnabled
                        ? 'bg-red-50 border-red-200'
                        : 'bg-zinc-50 border-zinc-200'
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
                    className="group flex items-center px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-xl transition-all"
                >
                    <Settings className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-zinc-600" />
                    Settings
                </Link>
                <button
                    onClick={logout}
                    className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
