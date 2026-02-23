"use client";

import { useState, useEffect } from "react";
import { Save, Palette, Building2, Mail, Phone, Globe, Image as ImageIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";

export default function BrandingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        companyWebsite: "",
        logoUrl: "",
        primaryColor: "#9333ea",
        secondaryColor: "#6366f1",
        accentColor: "#8b5cf6",
        defaultHeader: "",
        defaultFooter: "",
        defaultTerms: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings/branding");
            const data = await res.json();
            if (data) {
                setFormData({
                    companyName: data.companyName || "",
                    companyAddress: data.companyAddress || "",
                    companyPhone: data.companyPhone || "",
                    companyEmail: data.companyEmail || "",
                    companyWebsite: data.companyWebsite || "",
                    logoUrl: data.logoUrl || "",
                    primaryColor: data.primaryColor || "#9333ea",
                    secondaryColor: data.secondaryColor || "#6366f1",
                    accentColor: data.accentColor || "#8b5cf6",
                    defaultHeader: data.defaultHeader || "",
                    defaultFooter: data.defaultFooter || "",
                    defaultTerms: data.defaultTerms || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch branding settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings/branding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Branding settings saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save branding settings:", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin h-10 w-10 border-4 border-orange-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Brand Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700 relative isolate">
            {/* Architectural Underglows */}
            <div className="absolute top-[10%] left-[-10%] w-[60%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-orange-500">
                        <Palette className="h-5 w-5 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Aesthetics</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Branding <span className="text-orange-500">Management</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-lg">Configure organizational identity across all generated documents.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-4 bg-orange-600 hover:bg-orange-500 text-black px-10 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_40px_-10px_rgba(255,122,0,0.4)] disabled:opacity-50 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Save className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">{saving ? "SAVING..." : "SAVE CHANGES"}</span>
                </button>
            </div>

            {/* Company Information */}
            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-64 w-64 bg-orange-600/5 rounded-full blur-[100px] -z-10 group-hover:bg-orange-600/10 transition-colors" />

                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                        <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Organizational Identity</h2>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Primary corporate metadata</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Corporate Label</label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="ENTITY NAME"
                                className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Digital Uplink (Email)</label>
                        <div className="relative group/input">
                            <input
                                type="email"
                                value={formData.companyEmail}
                                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                placeholder="SUPPORT@NEONBYTE.COM"
                                className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Signal Line (Phone)</label>
                        <div className="relative group/input">
                            <input
                                type="tel"
                                value={formData.companyPhone}
                                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                                placeholder="+XX XXX XXXXXXX"
                                className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Network Domain (Website)</label>
                        <div className="relative group/input">
                            <input
                                type="url"
                                value={formData.companyWebsite}
                                onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                placeholder="HTTPS://DOMAIN.INT"
                                className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Physical Hub (Address)</label>
                        <textarea
                            rows={2}
                            value={formData.companyAddress}
                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                            placeholder="GEOGRAPHIC COORDINATES"
                            className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Visual Branding */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40 space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-2xl">
                        <Palette className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900">Visual Branding</h2>
                        <p className="text-sm text-zinc-500">Logo and brand colors</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Company Logo URL
                        </label>
                        <input
                            type="text"
                            value={formData.logoUrl}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            placeholder="https://example.com/logo.png or base64 data"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                        {formData.logoUrl && (
                            <div className="mt-4 p-6 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                <img src={formData.logoUrl} alt="Logo preview" className="h-20 object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Brand Colors
                        </label>
                        <div className="grid grid-cols-3 gap-6">
                            {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((colorKey) => (
                                <div key={colorKey} className="space-y-3">
                                    <p className="text-sm font-bold text-zinc-700 capitalize">
                                        {colorKey.replace('Color', '')}
                                    </p>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowColorPicker(showColorPicker === colorKey ? null : colorKey)}
                                            className="w-full h-20 rounded-2xl border-2 border-zinc-200 transition-all hover:scale-105 shadow-lg"
                                            style={{ backgroundColor: formData[colorKey] }}
                                        />
                                        <p className="text-xs font-mono font-bold text-zinc-500 mt-2 text-center">
                                            {formData[colorKey]}
                                        </p>
                                        {showColorPicker === colorKey && (
                                            <div className="absolute z-10 mt-2">
                                                <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                                                <div className="relative bg-zinc-950 p-4 rounded-2xl shadow-2xl border border-white/10 glass-premium">
                                                    <HexColorPicker
                                                        color={formData[colorKey]}
                                                        onChange={(color) => setFormData({ ...formData, [colorKey]: color })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Default Templates */}
            <div className="glass-premium rounded-[3.5rem] border border-white/5 p-12 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl">
                        <ImageIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Document Templates</h2>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Global document defaults</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Header Text</label>
                        <textarea
                            rows={3}
                            value={formData.defaultHeader}
                            onChange={(e) => setFormData({ ...formData, defaultHeader: e.target.value })}
                            placeholder="Standardized header text..."
                            className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Footer Text</label>
                        <textarea
                            rows={3}
                            value={formData.defaultFooter}
                            onChange={(e) => setFormData({ ...formData, defaultFooter: e.target.value })}
                            placeholder="Finalizing footer text..."
                            className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] ml-2">Terms & Conditions Manifest</label>
                        <textarea
                            rows={8}
                            value={formData.defaultTerms}
                            onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                            placeholder="Legal systemic constraints..."
                            className="w-full bg-black border border-white/5 rounded-2xl py-6 px-8 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-white font-black uppercase tracking-widest text-xs resize-none min-h-[200px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
