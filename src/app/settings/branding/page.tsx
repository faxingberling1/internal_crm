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
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Branding Settings</h1>
                    <p className="text-zinc-500 mt-1">Configure your company branding for proposals and documents</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                </button>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40 space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                        <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900">Company Information</h2>
                        <p className="text-sm text-zinc-500">Basic company details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="NBT"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.companyEmail}
                            onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                            placeholder="contact@nbt.com"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.companyPhone}
                            onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Website
                        </label>
                        <input
                            type="url"
                            value={formData.companyWebsite}
                            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                            placeholder="https://nbt.com"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Address
                        </label>
                        <textarea
                            rows={2}
                            value={formData.companyAddress}
                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                            placeholder="123 Business St, City, State 12345"
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
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
                                                <div className="relative bg-white p-4 rounded-2xl shadow-2xl border border-zinc-200">
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
            <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl shadow-zinc-200/40 space-y-6">
                <div>
                    <h2 className="text-xl font-black text-zinc-900">Default Templates</h2>
                    <p className="text-sm text-zinc-500 mt-1">Pre-fill proposal content with these defaults</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Default Header
                        </label>
                        <textarea
                            rows={3}
                            value={formData.defaultHeader}
                            onChange={(e) => setFormData({ ...formData, defaultHeader: e.target.value })}
                            placeholder="Default header text for proposals..."
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Default Footer
                        </label>
                        <textarea
                            rows={3}
                            value={formData.defaultFooter}
                            onChange={(e) => setFormData({ ...formData, defaultFooter: e.target.value })}
                            placeholder="Default footer text for proposals..."
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Default Terms & Conditions
                        </label>
                        <textarea
                            rows={8}
                            value={formData.defaultTerms}
                            onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                            placeholder="Default terms and conditions..."
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-zinc-900 font-medium resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
