"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Lock,
    Mail,
    ArrowRight,
    ChevronRight,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                // Flash success state before redirect
                router.push("/");
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-8">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900">Welcome Back</h2>
                    <p className="text-zinc-500 mt-2 font-medium">Access your state-of-the-art CRM dashboard.</p>
                </div>

                <div className="premium-card bg-white border border-zinc-100 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@antigravity.com"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-6 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">Forgot?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-6 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full bg-zinc-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span>{loading ? "Verifying..." : "Sign In to Dashboard"}</span>
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-zinc-50 text-center">
                        <p className="text-sm font-medium text-zinc-500">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-purple-600 font-black hover:underline tracking-tight">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-6 text-zinc-400">
                    <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Session</span>
                    </div>
                    <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Oversight</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
