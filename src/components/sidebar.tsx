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
import { LogOut } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Proposals", href: "/proposals", icon: FileText },
    { name: "Packages", href: "/packages", icon: Package },
    { name: "Clients", href: "/clients", icon: UserPlus },
    { name: "Calls", href: "/calls", icon: PhoneCall },
    { name: "Attendance", href: "/attendance", icon: Clock },
];

const adminNavigation = [
    { name: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { name: "Admin Attendance", href: "/admin/attendance", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useUser();

    if (!user) return null;

    const isAdmin = user.role === "ADMIN";
    const allNavigation = [...navigation, ...(isAdmin ? adminNavigation : [])];

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-50 border-r border-zinc-200">
            <div className="flex h-20 items-center px-6">
                <h1 className="text-2xl font-bold gradient-text">Antigravity CRM</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {allNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-purple-600/10 text-purple-600"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-purple-600" : "text-zinc-400 group-hover:text-zinc-600"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-zinc-200 p-4 space-y-2">
                <div className="px-3 py-2 mb-2">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Logged in as</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">{user.name || user.email}</p>
                    <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase">{user.role}</span>
                </div>
                <Link
                    href="/settings"
                    className="group flex items-center px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-lg transition-all"
                >
                    <Settings className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-zinc-600" />
                    Settings
                </Link>
                <button
                    onClick={logout}
                    className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
