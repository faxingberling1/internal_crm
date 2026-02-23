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
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 blur-[100px] -z-10" />

            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_50px_-10px_rgba(255,122,0,0.5)] mb-8 group hover:scale-110 transition-transform duration-500">
                        <Lock className="h-10 w-10 text-black" />
                    </div>
                    <div className="flex items-center justify-center space-x-3 text-orange-500 mb-2">
                        <div className="h-px w-8 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Secure Terminal 3.0</span>
                        <div className="h-px w-8 bg-orange-500/50" />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-white">Welcome <span className="text-orange-500">Back</span></h2>
                    <p className="text-zinc-500 mt-4 font-bold tracking-tight">Authorize your session to access the internal grid.</p>
                </div>

                <div className="glass-premium p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:glow-orange transition-all duration-700">
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {error && (
                            <div className="flex items-center space-x-3 text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Identity Access</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within/input:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="agent@internal.net"
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-zinc-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Security Key</label>
                                <button type="button" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-500 transition-colors">Recover</button>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within/input:text-orange-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-zinc-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full bg-orange-600 hover:bg-orange-500 text-black font-black py-5 rounded-[1.5rem] shadow-[0_0_30px_-5px_rgba(255,122,0,0.4)] transition-all flex items-center justify-center space-x-3 uppercase text-xs tracking-[0.2em] relative overflow-hidden group",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span>{loading ? "Authenticating..." : "Establish Connection"}</span>
                            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs font-bold text-zinc-600">
                            Unrecognized Identity?{" "}
                            <Link href="/register" className="text-orange-600 font-black hover:text-orange-500 transition-colors tracking-tight uppercase text-[10px] ml-1">
                                Register Node
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-8 text-zinc-700">
                    <div className="flex items-center space-x-2 group cursor-default">
                        <ShieldCheck className="h-4 w-4 group-hover:text-orange-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Session</span>
                    </div>
                    <div className="flex items-center space-x-2 group cursor-default">
                        <ChevronRight className="h-4 w-4 group-hover:text-orange-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Internal Transit</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
