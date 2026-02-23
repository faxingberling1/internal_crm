"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  TrendingUp,
  PhoneCall,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Calendar,
  AlertCircle,
  Activity,
  ChevronRight,
  Target,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-context";
import { ShiftWidget } from "@/components/shift-widget";

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role !== "ADMIN") {
        router.push("/employee/dashboard");
        return;
      }
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => {
          setStats(data.stats || []);
          setRecentLeads(data.recentLeads || []);
          setUpcomingCalls(data.upcomingCalls || []);
          setLoading(false);
        });
    }
  }, [user, router]);

  if (authLoading || (user && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-orange-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
          <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const IconMap: any = { Users, FileText, PhoneCall, TrendingUp };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-16 pb-24 relative overflow-hidden isolate"
    >
      {/* Architectural Underglows */}
      <div className="absolute top-[10%] left-[-10%] w-[60%] h-[40%] bg-orange-600/5 blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-[10%] w-[40%] h-[30%] bg-orange-500/5 blur-[100px] -z-10" />

      {/* Premium Header: Mission Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-orange-500">
            <Crown className="h-5 w-5 fill-current animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Dashboard Control</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic leading-none lg:text-8xl">
            DASHBOARD <span className="text-orange-500">HOME</span>
          </h1>
          <p className="text-zinc-500 font-bold text-xl">A comprehensive overview of your business performance.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-8 py-6 bg-zinc-950/40 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-end min-w-[240px] relative overflow-hidden group backdrop-blur-3xl">
            <div className="absolute top-0 right-0 h-1 bg-orange-600 w-full opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2 group-hover:text-orange-500 transition-colors">Local Time</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-white tracking-widest leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <div className="h-2 w-2 rounded-full bg-orange-600 animate-ping shadow-[0_0_15px_rgba(255,122,0,1)]" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 bg-zinc-950/40 rounded-[3rem] border border-white/5 animate-pulse shadow-inner" />
          ))
        ) : (
          stats.map((stat, idx) => {
            const Icon = IconMap[stat.icon] || Zap;
            return (
              <motion.div
                key={stat.name}
                variants={item}
                whileHover={{ y: -8, scale: 1.02 }}
                className={cn(
                  "relative p-10 rounded-[3.5rem] overflow-hidden border border-white/5 group transition-all duration-700",
                  "glass-premium hover:glow-orange shadow-2xl"
                )}
              >
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-orange-600/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-5 rounded-[1.5rem] shadow-2xl transition-all group-hover:rotate-12 duration-700", stat.bg?.replace('bg-', 'bg-zinc-900/').replace('text-', 'text-orange-500'))}>
                      <Icon className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-orange-400 font-black text-xs space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>{stat.change}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                      <div className="h-1.5 w-16 bg-white/[0.03] rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-orange-600 rounded-full w-2/3 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2">{stat.name}</p>
                    <p className="text-5xl font-black text-white tracking-widest leading-none">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Dynamic Activity Feed */}
        <motion.div variants={item} className="lg:col-span-2 space-y-12">
          {user.email !== "admin@nbt.com" && (
            <div className="px-2">
              <ShiftWidget />
            </div>
          )}

          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-orange-600 rounded-[1.5rem] shadow-[0_0_30px_rgba(255,122,0,0.3)]">
                <Activity className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Activity Feed</h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Real-time business updates</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-orange-500 hover:bg-orange-500/10 px-6 py-3 rounded-2xl border border-orange-500/20 transition-all uppercase tracking-widest shadow-2xl">View Detailed Logs</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Leads Module */}
            <div className="glass-premium rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600/20 group-hover:bg-orange-600 transition-all duration-700" />
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Recent Clients</span>
                </div>
                <span className="text-[9px] font-black bg-orange-600 text-black px-3 py-1 rounded-full uppercase tracking-tighter animate-pulse shadow-[0_0_15px_rgba(255,122,0,0.3)]">Active Stream</span>
              </div>
              <div className="space-y-6">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-5 rounded-[1.75rem] border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group/item hover:translate-x-2 duration-500">
                    <div className="flex items-center space-x-5">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-orange-500 text-sm font-black shadow-inner shadow-black">
                        {lead.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-md font-black text-white tracking-tight group-hover/item:text-orange-500 transition-colors">{lead.name}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1 opacity-60">{lead.company || "Direct Interaction"}</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center text-zinc-700 group-hover/item:text-orange-500 group-hover/item:border-orange-500/20 transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Activity Module */}
            <div className="glass-premium rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-600 opacity-20 group-hover:bg-orange-600/40 transition-all duration-700" />
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="h-5 w-5 text-zinc-500 group-hover:text-orange-600 transition-colors" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Upcoming Schedule</span>
                </div>
              </div>
              <div className="space-y-6">
                {upcomingCalls.length > 0 ? upcomingCalls.map((call: any) => (
                  <div key={call.id} className="flex items-center justify-between p-5 rounded-[1.75rem] border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group/item hover:translate-x-2 duration-500">
                    <div className="flex items-center space-x-5">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center justify-center text-zinc-600 group-hover/item:text-orange-600 group-hover/item:border-orange-500/20 transition-all">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-md font-black text-white tracking-tight group-hover/item:text-orange-500 transition-colors">{call.lead?.name || "Target Node"}</p>
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-600 text-black shadow-lg shadow-orange-900/20 opacity-0 group-hover/item:opacity-100 transition-all transform scale-50 group-hover/item:scale-100">
                      <Zap className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] group-hover:border-orange-500/10 transition-colors">
                    <AlertCircle className="h-10 w-10 text-zinc-900 mx-auto mb-4 opacity-40 group-hover:text-orange-950 transition-colors" />
                    <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em]">No Recent Activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Insight Section */}
        <motion.div variants={item} className="space-y-12">
          <div className="glass-premium rounded-[4rem] p-1 shadow-2xl border border-white/5 relative overflow-hidden group isolate">
            <div className="absolute inset-0 bg-[#080808]/80 -z-10" />
            <div className="p-12 space-y-12 relative z-10">
              {/* Visual Glows */}
              <div className="absolute top-0 right-0 h-64 w-64 bg-orange-600/5 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 h-64 w-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />

              <div className="space-y-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-[2rem] bg-zinc-950 border border-white/5 flex items-center justify-center shadow-2xl">
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-widest uppercase italic">Pulse Index</h4>
                    <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-1">Key Performance Indices</p>
                  </div>
                </div>

                <div className="space-y-10 pt-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700">Operational Flow</span>
                      <span className="text-3xl font-black tracking-tighter text-orange-500">94.2%</span>
                    </div>
                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94.2%" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_20px_rgba(255,122,0,0.4)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700">Target Velocity</span>
                      <span className="text-3xl font-black tracking-tighter text-orange-400">8.4x</span>
                    </div>
                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-300 rounded-full shadow-[0_0_20px_rgba(255,122,0,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-white/5 rounded-[3rem] p-8 backdrop-blur-3xl shadow-inner mt-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">Growth Projection</p>
                  <span className="text-sm font-black text-orange-500">+12.5%</span>
                </div>
                <div className="grid grid-cols-7 gap-2 h-16">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className="bg-orange-500/20 rounded-md self-end border-t border-orange-500/30 group-hover:bg-orange-500/40 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[3.5rem] p-1 shadow-2xl transition-all duration-700 hover:scale-[1.02]">
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-orange-600 to-orange-500 -z-10" />
            <div className="p-10 text-black space-y-8 relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 h-48 w-48 bg-black/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center justify-between relative z-10">
                  <div className="h-16 w-16 rounded-[1.75rem] bg-black/10 flex items-center justify-center border border-black/20 backdrop-blur-sm">
                    <ShieldCheck className="h-8 w-8 text-black" />
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center text-black/40 group-hover:text-black transition-all group-hover:translate-x-2">
                    <ArrowUpRight className="h-7 w-7" />
                  </div>
                </div>
                <div className="space-y-2 relative z-10">
                  <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Security Audit</h4>
                  <p className="text-black/70 text-md font-bold leading-tight">Perform a complete security and integrity audit across the platform.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

