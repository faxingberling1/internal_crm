"use client";

import { useState } from "react";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    ShieldAlert,
    CheckCircle2,
    ArrowRight
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
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-zinc-100 animate-in zoom-in duration-300">
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Registration Received!</h2>
                    <p className="text-zinc-500 mb-8 leading-relaxed">
                        {message}. You will be notified once an administrator confirms your access.
                    </p>
                    <Link href="/" className="inline-flex items-center text-purple-600 font-bold hover:text-purple-700 transition-colors">
                        Back to Home <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full mb-8 text-center">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Antigravity CRM</h1>
                <p className="text-zinc-500 mt-2 font-medium">Create your agent account to get started.</p>
            </div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-700 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Alex Murphy"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-700 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                                <input
                                    required
                                    type="email"
                                    placeholder="alex@antigravity.com"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-zinc-700 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {status === "ERROR" && (
                            <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 animate-in shake duration-300">
                                <ShieldAlert className="h-5 w-5 mr-3 flex-shrink-0" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "LOADING"}
                            className="w-full bg-zinc-900 hover:bg-black text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-zinc-900/20 transition-all flex items-center justify-center space-x-2"
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>{status === "LOADING" ? "Creating Account..." : "Request Access"}</span>
                        </button>
                    </form>
                </div>

                <div className="bg-zinc-50 p-6 border-t border-zinc-100 text-center">
                    <p className="text-xs text-zinc-500">
                        By requesting access, you agree to the <span className="underline cursor-pointer">Security Protocols</span> and <span className="underline cursor-pointer">Service Agreement</span>.
                    </p>
                </div>
            </div>

            <Link href="/" className="mt-8 text-zinc-400 hover:text-zinc-600 font-bold transition-colors text-sm">
                Already have an account? Sign In
            </Link>
        </div>
    );
}
