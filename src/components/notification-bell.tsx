"use client";

import { useState, useEffect } from "react";
import { Bell, X, ExternalLink, Mail, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl group"
            >
                <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-[bell-shake_0.5s_ease-in-out_infinite]")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black border-2 border-white text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] shadow-2xl z-50 border border-zinc-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Inbox</h3>
                                <span className="px-3 py-1 bg-zinc-900 text-white rounded-full text-[9px] font-black uppercase tracking-tighter">
                                    {unreadCount} New
                                </span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-zinc-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "p-5 transition-all relative group",
                                                    !notification.isRead ? "bg-blue-50/30" : "hover:bg-zinc-50"
                                                )}
                                            >
                                                {!notification.isRead && (
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                                                )}
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={cn(
                                                            "p-1.5 rounded-lg",
                                                            notification.type === 'PROJECT_ASSIGNMENT' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                                        )}>
                                                            <Mail className="h-3.5 w-3.5" />
                                                        </div>
                                                        <h4 className="font-black text-zinc-900 text-xs tracking-tight">{notification.title}</h4>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase flex items-center">
                                                        <Clock className="h-2.5 w-2.5 mr-1" />
                                                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed mb-3">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => {
                                                                markAsRead(notification.id);
                                                                setIsOpen(false);
                                                            }}
                                                            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                        >
                                                            <span>View Project</span>
                                                            <ExternalLink className="h-2.5 w-2.5" />
                                                        </Link>
                                                    )}
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all p-1.5"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="p-4 bg-zinc-50 rounded-full inline-block">
                                            <Bell className="h-8 w-8 text-zinc-200" />
                                        </div>
                                        <p className="text-zinc-400 font-bold italic text-sm">Nicely done! You're all caught up.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 text-center">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all"
                                >
                                    Dismiss Inbox
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes bell-shake {
                    0% { transform: rotate(0); }
                    15% { transform: rotate(15deg); }
                    30% { transform: rotate(-15deg); }
                    45% { transform: rotate(10deg); }
                    60% { transform: rotate(-10deg); }
                    75% { transform: rotate(5deg); }
                    100% { transform: rotate(0); }
                }
            `}</style>
        </div>
    );
}
