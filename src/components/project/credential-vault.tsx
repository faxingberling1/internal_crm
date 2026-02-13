"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, Plus, Eye, EyeOff, Copy, Check, Shield, Trash2, Key, Link as LinkIcon } from "lucide-react";
import { useUser } from "@/components/user-context";

interface Credential {
    id: string;
    name: string;
    type: string;
    username?: string;
    value: string;
    url?: string;
    notes?: string;
    createdAt: string;
}

export function CredentialVault({ projectId }: { projectId: string }) {
    const { user } = useUser();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [newCred, setNewCred] = useState({
        name: "",
        type: "PASSWORD",
        username: "",
        value: "",
        url: "",
        notes: ""
    });

    useEffect(() => {
        fetchCredentials();
    }, [projectId]);

    const fetchCredentials = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/credentials`);
            if (res.ok) {
                const data = await res.json();
                setCredentials(data);
            }
        } catch (error) {
            console.error("Failed to fetch credentials:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleReveal = (id: string) => {
        const newRevealed = new Set(revealedIds);
        if (newRevealed.has(id)) {
            newRevealed.delete(id);
        } else {
            newRevealed.add(id);
        }
        setRevealedIds(newRevealed);
    };

    const handleCopy = (id: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDeleteCredential = async (credentialId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the credential "${name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(credentialId);
        try {
            const res = await fetch(`/api/projects/${projectId}/credentials?credentialId=${credentialId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setCredentials(credentials.filter(c => c.id !== credentialId));
            } else {
                alert("Failed to delete credential. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting credential:", error);
            alert("An error occurred while deleting data.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleAddCredential = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/projects/${projectId}/credentials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCred)
            });

            if (res.ok) {
                const data = await res.json();
                setCredentials([data, ...credentials]);
                setIsAdding(false);
                setNewCred({ name: "", type: "PASSWORD", username: "", value: "", url: "", notes: "" });
            }
        } catch (error) {
            console.error("Error adding credential:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Access Credentials</h3>
                    <p className="text-sm text-zinc-500 font-medium">Manage project-specific access keys and passwords securely.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-zinc-900/10"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isAdding ? "Cancel" : "Add New"}</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAddCredential} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Credential Name</label>
                            <input
                                required
                                value={newCred.name}
                                onChange={e => setNewCred({ ...newCred, name: e.target.value })}
                                placeholder="e.g., AWS Secret Key"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Type</label>
                            <select
                                value={newCred.type}
                                onChange={e => setNewCred({ ...newCred, type: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900"
                            >
                                <option value="PASSWORD">Password</option>
                                <option value="API_KEY">API Key</option>
                                <option value="SSH_KEY">SSH Key</option>
                                <option value="TOKEN">Token</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Username (Optional)</label>
                            <input
                                value={newCred.username}
                                onChange={e => setNewCred({ ...newCred, username: e.target.value })}
                                placeholder="e.g., admin_user"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Value / Secret</label>
                            <input
                                required
                                type="password"
                                value={newCred.value}
                                onChange={e => setNewCred({ ...newCred, value: e.target.value })}
                                placeholder="••••••••••••"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900 font-mono"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL / Link (Optional)</label>
                            <input
                                value={newCred.url}
                                onChange={e => setNewCred({ ...newCred, url: e.target.value })}
                                placeholder="https://console.aws.amazon.com/..."
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900"
                            />
                        </div>
                        <button
                            type="submit"
                            className="md:col-span-2 mt-2 bg-zinc-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-zinc-900/10"
                        >
                            Save Secure Credential
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.length === 0 ? (
                    <div className="md:col-span-2 border-2 border-dashed border-zinc-100 rounded-3xl p-12 text-center">
                        <Shield className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-400 font-black text-xs uppercase tracking-widest">No credentials stored yet</p>
                    </div>
                ) : (
                    credentials.map(cred => (
                        <div
                            key={cred.id}
                            className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                        <Key className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-zinc-900 tracking-tight">{cred.name}</h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{cred.type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isAdmin && (
                                        <button
                                            disabled={isDeleting === cred.id}
                                            onClick={() => handleDeleteCredential(cred.id, cred.name)}
                                            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center"
                                            title="Delete permanently"
                                        >
                                            {isDeleting === cred.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}
                                    {cred.url && (
                                        <a
                                            href={cred.url}
                                            target="_blank"
                                            className="p-1.5 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors"
                                            title="Visit URL"
                                        >
                                            <LinkIcon className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {cred.username && (
                                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                        <span className="uppercase tracking-widest text-[9px] font-black opacity-50">Username</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-zinc-900 font-bold">{cred.username}</span>
                                            <button
                                                onClick={() => handleCopy(`${cred.id}-user`, cred.username!)}
                                                className="hover:text-zinc-900 transition-colors"
                                            >
                                                {copiedId === `${cred.id}-user` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                                    <div className="overflow-hidden">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Secret Value</span>
                                        <span className="font-mono text-sm text-zinc-900 font-bold truncate block">
                                            {revealedIds.has(cred.id) ? cred.value : "••••••••••••••••"}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => toggleReveal(cred.id)}
                                            className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
                                        >
                                            {revealedIds.has(cred.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => handleCopy(cred.id, cred.value)}
                                            className="p-2 hover:bg-white rounded-lg text-zinc-500 hover:text-zinc-900 transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            {copiedId === cred.id ? "Copied" : "Copy"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
