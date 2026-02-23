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
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase tracking-[0.1em]">Client <span className="text-orange-600">Database</span></h2>
                    <p className="text-zinc-600 font-bold mt-2 uppercase text-xs tracking-widest">Manage your existing organizational customer base.</p>
                </div>
                <button className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-black px-6 py-3 rounded-2xl transition-all font-black uppercase text-xs tracking-widest shadow-[0_0_30px_-5px_rgba(255,122,0,0.5)]">
                    <UserPlus className="h-4 w-4" />
                    <span>Authorize Client</span>
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search intelligence database..."
                    className="w-full bg-[#080808] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all outline-none text-[10px] font-black uppercase tracking-widest text-orange-500 placeholder:text-zinc-800 shadow-2xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-zinc-950/40 rounded-[2rem] border border-white/5 animate-pulse" />
                    ))
                ) : clients.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        No clients found.
                    </div>
                ) : (
                    clients.map((client: any) => (
                        <div key={client.id} className="glass-premium hover:glow-orange p-8 rounded-[2.5rem] border border-white/5 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="h-14 w-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center shadow-lg group-hover:border-orange-500/20 transition-all">
                                        <Building2 className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-widest text-xs">{client.name}</h4>
                                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">{client.company || "Direct Asset"}</p>
                                    </div>
                                </div>
                                <button className="p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 hover:bg-orange-600/10 text-zinc-800 hover:text-orange-500 transition-all">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-2">
                                {client.email && (
                                    <div className="flex items-center text-[10px] text-zinc-600 font-black uppercase tracking-tight">
                                        <Mail className="h-3.5 w-3.5 mr-3 text-zinc-800" />
                                        {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center text-[10px] text-zinc-600 font-black uppercase tracking-tight">
                                        <Phone className="h-3.5 w-3.5 mr-3 text-zinc-800" />
                                        {client.phone}
                                    </div>
                                )}
                                {client.website && (
                                    <div className="flex items-center text-[10px] text-zinc-600 font-black uppercase tracking-tight">
                                        <Globe className="h-3.5 w-3.5 mr-3 text-zinc-800" />
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
