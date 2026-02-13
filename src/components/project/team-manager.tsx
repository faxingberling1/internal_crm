"use client";

import { useState, useEffect } from "react";
import { Users, Search, Check, Plus, Loader2, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    position: string;
    initials: string;
}

export function TeamManager({ projectId }: { projectId: string }) {
    const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        fetchTeamData();
    }, [projectId]);

    const fetchTeamData = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assignees`);
            if (res.ok) {
                const data = await res.json();
                setAllMembers(data.allMembers);
                setAssignedIds(data.currentAssignees);
            }
        } catch (error) {
            console.error("Failed to fetch team data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMember = async (userId: string) => {
        const newIds = assignedIds.includes(userId)
            ? assignedIds.filter(id => id !== userId)
            : [...assignedIds, userId];

        setUpdating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/assignees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: newIds })
            });

            if (res.ok) {
                setAssignedIds(newIds);
            }
        } catch (error) {
            console.error("Failed to update team:", error);
        } finally {
            setUpdating(false);
        }
    };

    const filteredMembers = allMembers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const assignedMembers = allMembers.filter(m => assignedIds.includes(m.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-lg">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight">Team Assignees</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5 opacity-60">Interactive Membership Management</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSelector(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm group"
                >
                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                    <span>Manage Team</span>
                </button>
            </div>

            {/* Current Team Display */}
            <div className="flex flex-wrap gap-4">
                <AnimatePresence mode="popLayout">
                    {assignedMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-3 p-2 pr-4 bg-zinc-50 border border-zinc-200 rounded-2xl group hover:border-zinc-900 transition-all"
                        >
                            <div className="h-10 w-10 flex-shrink-0 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                                {member.initials}
                            </div>
                            <div>
                                <p className="text-xs font-black text-zinc-900">{member.name}</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{member.position || 'Member'}</p>
                            </div>
                            <button
                                onClick={() => handleToggleMember(member.id)}
                                className="ml-2 p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {assignedMembers.length === 0 && (
                    <div className="w-full py-12 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
                        <User className="h-8 w-8 mb-2 opacity-20" />
                        <p className="font-bold italic text-sm">No members assigned. Click 'Manage Team' to add collaborators.</p>
                    </div>
                )}
            </div>

            {/* Member Selector Modal */}
            <AnimatePresence>
                {showSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSelector(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] border border-zinc-200"
                        >
                            <div className="p-8 border-b border-zinc-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Select Team Members</h3>
                                    <button
                                        onClick={() => setShowSelector(false)}
                                        className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:scale-110 transition-transform"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {filteredMembers.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => handleToggleMember(member.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-3xl transition-all border group",
                                            assignedIds.includes(member.id)
                                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl"
                                                : "bg-white border-zinc-100 hover:border-zinc-900 text-zinc-900"
                                        )}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-colors",
                                                assignedIds.includes(member.id) ? "bg-white/10" : "bg-zinc-100"
                                            )}>
                                                {member.initials}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-sm">{member.name}</p>
                                                <p className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest",
                                                    assignedIds.includes(member.id) ? "text-white/60" : "text-zinc-400"
                                                )}>{member.position || 'Team Member'}</p>
                                            </div>
                                        </div>
                                        {assignedIds.includes(member.id) ? (
                                            <div className="p-2 bg-white text-zinc-900 rounded-xl">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-zinc-50 text-zinc-300 rounded-xl group-hover:text-zinc-900 transition-colors">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <div className="py-12 text-center">
                                        <p className="text-zinc-400 font-bold italic">No matching team members found.</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    {assignedIds.length} Members Assigned
                                </p>
                                <button
                                    onClick={() => setShowSelector(false)}
                                    className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
