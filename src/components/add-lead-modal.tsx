"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function AddLeadModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        source: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                onAdd();
                onClose();
                setFormData({ name: "", email: "", phone: "", source: "", notes: "" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl animate-in fade-in zoom-in duration-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-zinc-900">Add New Lead</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 rounded-full transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-zinc-900 shadow-sm"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-zinc-900 shadow-sm"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-zinc-900 shadow-sm"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Source</label>
                        <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-zinc-900 shadow-sm"
                        >
                            <option value="">Select Source</option>
                            <option value="WEBSITE">Website</option>
                            <option value="FACEBOOK">Facebook</option>
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="REFERRAL">Referral</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none text-zinc-900 shadow-sm"
                            placeholder="Any additional information..."
                        ></textarea>
                    </div>
                    <div className="pt-2">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? "Adding..." : "Create Lead"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
