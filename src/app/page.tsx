"use client";

import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/user-context";

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const [stats, setStats] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => {
          setStats(data.stats || []);
          setRecentLeads(data.recentLeads || []);
          setUpcomingCalls(data.upcomingCalls || []);
          setLoading(false);
        });
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  // ICON MAPPING
  const IconMap: any = { Users, FileText, PhoneCall, TrendingUp };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-zinc-900">
            {isAdmin ? "Admin Headquarters" : "Employee Workspace"}
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            {isAdmin
              ? "Comprehensive overview of organizational performance and lead health."
              : `Hello ${user.name}, focus on your daily objectives and performance.`}
          </p>
        </div>
        <div className="px-4 py-2 bg-zinc-100 rounded-xl border border-zinc-200">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Pulse</p>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-zinc-900">Live Data</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = IconMap[stat.icon] || Zap;
          return (
            <div key={stat.name} className={cn("premium-card group cursor-pointer", stat.glow)}>
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex items-center border border-green-200 shadow-sm">
                  {stat.change}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{stat.name}</p>
                <p className="text-3xl font-black mt-1 text-zinc-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="premium-card border-purple-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Organization Flow</h3>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 transition-all">Audit Trails</button>
            </div>
            <div className="space-y-4">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-purple-200 transition-all cursor-pointer group hover:bg-white hover:shadow-xl hover:shadow-purple-500/5">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border border-purple-200 shadow-lg shadow-purple-500/10">
                      <span className="text-sm font-black text-white">{lead.name.split(' ').map((n: string) => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 group-hover:text-purple-600 transition-colors">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{lead.company || "New Lead"} • {lead.source || "Organic"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md border",
                      lead.status === "NEW" ? "text-blue-700 bg-blue-50 border-blue-100" : "text-zinc-500 bg-zinc-100 border-zinc-200"
                    )}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card border-blue-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Activity Stream</h3>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-all">Export Logs</button>
            </div>
            <div className="space-y-4">
              {upcomingCalls.length > 0 ? upcomingCalls.map((call: any) => (
                <div key={call.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-all cursor-pointer group hover:bg-white hover:shadow-xl hover:shadow-blue-500/5">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <PhoneCall className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{call.lead?.name || "Unknown Caller"}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{call.status} • {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="p-2.5 rounded-2xl hover:bg-green-100 hover:text-green-600 transition-all text-zinc-400 bg-white border border-zinc-100">
                      <PhoneCall className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <AlertCircle className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
                  <p className="text-zinc-500 font-medium">No activity recorded today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 premium-card">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-6">Recent Personal Activity</h3>
            <div className="p-12 text-center bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
              <Clock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Waiting for your first action...</p>
              <p className="text-zinc-400 text-[10px] mt-2 tracking-tighter">Your recent leads and proposals will appear here.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="premium-card bg-zinc-900 text-white border-none">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Employee Status</h4>
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="font-black text-lg tracking-tight">{user.name}</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
            </div>
            <div className="premium-card card-purple">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-4">Attendance Streak</h4>
              <p className="text-4xl font-black text-zinc-900 tracking-tighter">5 Days</p>
              <p className="text-xs font-medium text-zinc-500 mt-1">Excellent consistency this week!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
