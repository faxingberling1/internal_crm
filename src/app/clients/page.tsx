"use client";

import { useState, useEffect } from "react";
import {
    UserPlus,
    Search,
    MoreVertical,
    Building2,
    Mail,
    Phone,
    Globe
} from "lucide-react";

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/clients")
            .then((res) => res.json())
            .then((data) => {
                setClients(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Clients</h2>
                    <p className="text-zinc-500 mt-2">Manage your existing customer base.</p>
                </div>
                <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500/50 transition-all outline-none text-sm text-zinc-900 shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="premium-card animate-pulse h-40 bg-zinc-50 border-zinc-100" />
                    ))
                ) : clients.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        No clients found.
                    </div>
                ) : (
                    clients.map((client: any) => (
                        <div key={client.id} className="premium-card hover:border-purple-200 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-zinc-200 shadow-sm">
                                        <Building2 className="h-6 w-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{client.name}</h4>
                                        <p className="text-xs text-zinc-500 font-medium">{client.company || "No Company"}</p>
                                    </div>
                                </div>
                                <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-2">
                                {client.email && (
                                    <div className="flex items-center text-xs text-zinc-600">
                                        <Mail className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                                        {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center text-xs text-zinc-600">
                                        <Phone className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                                        {client.phone}
                                    </div>
                                )}
                                {client.website && (
                                    <div className="flex items-center text-xs text-zinc-600">
                                        <Globe className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                                        {client.website}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
