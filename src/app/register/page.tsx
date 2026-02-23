"use client";

import { useState } from "react";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    ShieldAlert,
    CheckCircle2,
    ArrowRight,
    Activity
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });
    const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("LOADING");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("SUCCESS");
                setMessage(data.message);
            } else {
                setStatus("ERROR");
                setMessage(data.error);
            }
        } catch (error) {
            setStatus("ERROR");
            setMessage("Something went wrong. Please try again.");
        }
    };

    if (status === "SUCCESS") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden isolate">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 blur-[120px] -z-10 animate-pulse" />
                <div className="max-w-md w-full glass-premium rounded-[3rem] p-12 text-center border border-white/5 animate-in zoom-in duration-500 relative z-10 shadow-[0_0_50px_-10px_rgba(255,122,0,0.1)]">
                    <div className="h-24 w-24 bg-orange-600/10 text-orange-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-orange-500/20">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-orange-500 mb-6">
                        <div className="h-px w-6 bg-orange-500/50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Registration Success</span>
                        <div className="h-px w-6 bg-orange-500/50" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Node Registered!</h2>
                    <p className="text-zinc-500 mb-10 leading-relaxed font-medium">
                        {message}. You will be notified once an administrator confirms your access to the internal grid.
                    </p>
                    <Link href="/login" className="group inline-flex items-center text-orange-600 font-black hover:text-orange-500 transition-all uppercase text-xs tracking-widest bg-orange-600/10 px-8 py-4 rounded-2xl border border-orange-500/20">
                        Back to Terminal <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden isolate">
            {/* Architectural Glows */}
            <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

            <div className="max-w-md w-full mb-12 text-center relative z-10">
                <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="p-3 bg-orange-600 rounded-[1.25rem] shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]">
                        <Activity className="h-8 w-8 text-black" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-white uppercase italic">INTERNAL <span className="text-orange-500">PORTAL</span></span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-orange-500/60 mb-2">
                    <div className="h-px w-4 bg-orange-500/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.6em]">Nexus Deployment</span>
                    <div className="h-px w-4 bg-orange-500/20" />
                </div>
                <p className="text-zinc-500 mt-4 font-bold tracking-tight">Establish a new agent node to access the internal grit.</p>
            </div>

            <div className="max-w-md w-full glass-premium rounded-[3.5rem] border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 relative z-10 hover:glow-orange transition-all duration-700">
                <div className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Identity Label</label>
                            <div className="relative group/input">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within/input:text-orange-500 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Alex Murphy"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Communication Grid</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within/input:text-orange-500 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="alex@internal.net"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Security Credentials</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within/input:text-orange-500 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:bg-black/60 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all outline-none text-white font-bold text-sm placeholder:text-zinc-800"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {status === "ERROR" && (
                            <div className="flex items-center p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-in shake duration-300">
                                <ShieldAlert className="h-5 w-5 mr-3 flex-shrink-0" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "LOADING"}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-black font-black py-5 px-6 rounded-[1.5rem] shadow-[0_0_30px_-5px_rgba(255,122,0,0.4)] transition-all flex items-center justify-center space-x-3 uppercase text-xs tracking-[0.2em] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <UserPlus className="h-5 w-5" />
                            <span>{status === "LOADING" ? "Syncing..." : "Authorize Deployment"}</span>
                        </button>
                    </form>
                </div>

                <div className="bg-black/40 p-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em] leading-relaxed">
                        By registering, you acknowledge adherence to <span className="text-orange-500/80 cursor-pointer hover:text-orange-500 transition-colors">Security Policies</span> and the <span className="text-orange-500/80 cursor-pointer hover:text-orange-500 transition-colors">Terms of Service</span>.
                    </p>
                </div>
            </div>

            <Link href="/login" className="mt-12 text-zinc-500 hover:text-orange-500 font-extrabold transition-all text-xs uppercase tracking-widest flex items-center group">
                Already registered? <span className="text-orange-600 ml-2 group-hover:underline">Login to Access</span>
            </Link>
        </div>
    );
}
