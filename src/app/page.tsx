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
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Mission Control...</p>
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
      className="space-y-10 pb-10"
    >
      {/* Premium Header: Mission Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-purple-600">
            <Crown className="h-5 w-5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Administrator Command</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl">
            HQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Headquarters</span>
          </h2>
          <p className="text-zinc-500 font-bold text-lg">Central hub for organizational intelligence and growth.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-6 py-4 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 flex flex-col items-end min-w-[200px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 w-full" />
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-purple-600 transition-colors">HQ Chronos</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Pulse Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-white rounded-[2rem] border border-zinc-100 animate-pulse shadow-sm" />
          ))
        ) : (
          stats.map((stat, idx) => {
            const Icon = IconMap[stat.icon] || Zap;
            return (
              <motion.div
                key={stat.name}
                variants={item}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                  "relative p-8 rounded-[2.5rem] overflow-hidden border border-zinc-100 group transition-all duration-500",
                  "bg-white shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-purple-500/10"
                )}
              >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 bg-zinc-50 rounded-full group-hover:bg-purple-50 transition-colors duration-500" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-green-600 font-black text-xs space-x-0.5">
                        <span>{stat.change}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                      <div className="h-1 w-12 bg-zinc-50 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full w-2/3 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Dynamic Activity Feed */}
        <motion.div variants={item} className="lg:col-span-2 space-y-10">
          {user.email !== "admin@nbt.com" && (
            <div className="px-2">
              <ShiftWidget />
            </div>
          )}

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-zinc-900 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Dynamic Activity Feed</h3>
            </div>
            <button className="text-xs font-black text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 transition-all uppercase tracking-widest">Expansion View</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Leads Module */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-100/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Incoming Opportunities</span>
                </div>
                <span className="text-[8px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded uppercase tracking-tighter">Live Stream</span>
              </div>
              <div className="space-y-4">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-purple-200">
                        {lead.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 truncate max-w-[120px]">{lead.name}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{lead.company || "Direct"}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-purple-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Activity Module */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-100/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scheduled Actions</span>
                </div>
              </div>
              <div className="space-y-4">
                {upcomingCalls.length > 0 ? upcomingCalls.map((call: any) => (
                  <div key={call.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <PhoneCall className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 truncate max-w-[120px]">{call.lead?.name || "Action Case"}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500 text-white shadow-lg shadow-green-200 invisible group-hover:visible transition-all">
                      <Zap className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center border-2 border-dashed border-zinc-100 rounded-[2rem]">
                    <AlertCircle className="h-8 w-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Passive State</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Insight Section */}
        <motion.div variants={item} className="space-y-8">
          <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-zinc-900/40">
            {/* Visual Glow */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-purple-600/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-indigo-600/20 rounded-full blur-[60px]" />

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-[1.25rem] bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Organization Pulse</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Efficiency Analysis</p>
                  </div>
                </div>

                <div className="space-y-8 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Efficiency</span>
                      <span className="text-2xl font-black tracking-tighter">94.2%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94.2%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target Velocity</span>
                      <span className="text-2xl font-black tracking-tighter">8.4x</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Growth Pulse</p>
                  <span className="text-xs font-black text-green-400">+12.5%</span>
                </div>
                <div className="grid grid-cols-7 gap-1 h-12">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="bg-white/20 rounded-sm self-end"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="group premium-card bg-gradient-to-br from-purple-600 to-indigo-700 border-none p-8 text-white shadow-2xl shadow-purple-500/20 cursor-pointer overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-2xl font-black tracking-tighter mb-1">Organization Audit</h4>
              <p className="text-white/70 text-sm font-medium">Perform a full architectural safety and productivity audit across all departments.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

