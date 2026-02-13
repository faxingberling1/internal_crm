"use client";

import { useEffect, useState, useRef } from "react";
import {
    Bell,
    Check,
    X,
    Info,
    ClipboardCheck,
    MessageSquare,
    AlertTriangle,
    UserPlus,
    Briefcase,
    FileText,
    Clock,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'PROJECT_ASSIGNMENT': return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'COMMENT': return <MessageSquare className="h-4 w-4 text-emerald-500" />;
            case 'ALERT': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'LEAD_CREATED': return <Briefcase className="h-4 w-4 text-purple-500" />;
            case 'PROJECT_CREATED': return <Zap className="h-4 w-4 text-yellow-500" />;
            case 'PROPOSAL_CREATED': return <FileText className="h-4 w-4 text-pink-500" />;
            case 'ATTENDANCE': return <Clock className="h-4 w-4 text-orange-500" />;
            default: return <Info className="h-4 w-4 text-zinc-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-11 w-11 flex items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-purple-200 transition-all group relative overflow-hidden",
                    isOpen && "bg-white border-purple-200 ring-4 ring-purple-500/5"
                )}
            >
                <Bell className={cn(
                    "h-5 w-5 transition-colors",
                    isOpen ? "text-purple-600" : "text-zinc-400 group-hover:text-purple-600"
                )} />
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 h-2 w-2 bg-purple-600 rounded-full border-2 border-white shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-zinc-100 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Relay Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {unreadCount} UNREAD
                                </span>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {loading ? (
                                <div className="py-8 text-center bg-zinc-50 rounded-2xl">
                                    <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Syncing Matrix...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                    <Bell className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
                                    <p className="text-xs font-bold text-zinc-400">Neutral zone. No alerts.</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group p-3 rounded-2xl border transition-all relative overflow-hidden",
                                            notification.isRead
                                                ? "bg-white border-zinc-50 opacity-60"
                                                : "bg-zinc-50 border-zinc-100 hover:border-purple-100 hover:bg-white"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                                                notification.isRead ? "bg-zinc-100" : "bg-white shadow-sm"
                                            )}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-[11px] font-black text-zinc-900 truncate pr-4">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="h-5 w-5 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-zinc-300 hover:text-emerald-600 transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                if (!notification.isRead) markAsRead(notification.id);
                                                            }}
                                                            className="text-[9px] font-black text-purple-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            Intercept →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Mock Zap icon for consistency if it's missing in some contexts
const Zap = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 14.7l10-10.7v8.1h6l-10 10.7v-8.1H4z" />
    </svg>
);
