"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Search,
    Calendar,
    ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

    // Mock employees for demonstration if none exist
    const employees = [
        { id: "cm71l7f0e00003b6q", name: "Alex Murphy" },
        { id: "cm71l7f0e00013b6q", name: "Sarah Connor" },
    ];

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/attendance");
            const data = await res.json();
            setAttendance(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockToggle = async (type: "CLOCK_IN" | "CLOCK_OUT") => {
        if (!selectedEmployeeId) {
            alert("Please select an employee");
            return;
        }

        setIsClockingIn(true);
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employeeId: selectedEmployeeId,
                    type,
                    notes: "Automated clock-in from web interface"
                }),
            });
            const data = await res.json();
            if (data.error) {
                alert(data.error);
            } else {
                fetchAttendance();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsClockingIn(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Attendance Monitoring</h2>
                    <p className="text-zinc-500 mt-2">Track employee check-ins and check-outs in real-time.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="md:col-span-1 space-y-6">
                    <div className="premium-card card-purple">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center">
                            <ArrowRightLeft className="mr-2 h-5 w-5 text-purple-600" />
                            Clock In/Out
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">Select Employee</label>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 px-4 text-zinc-900 shadow-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                                >
                                    <option value="">Choose an employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => handleClockToggle("CLOCK_IN")}
                                disabled={isClockingIn}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center space-x-2"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>{isClockingIn ? "Processing..." : "Clock In"}</span>
                            </button>

                            <button
                                onClick={() => handleClockToggle("CLOCK_OUT")}
                                disabled={isClockingIn}
                                className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <XCircle className="h-5 w-5" />
                                <span>{isClockingIn ? "Processing..." : "Clock Out"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Panel */}
                <div className="md:col-span-2 space-y-6">
                    <div className="premium-card border-none bg-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-zinc-900 flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                Recent Activity
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    className="pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-48"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-16 bg-zinc-50 rounded-xl animate-pulse" />
                                ))
                            ) : attendance.length === 0 ? (
                                <div className="py-12 text-center text-zinc-500">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-200" />
                                    <p>No activity recorded yet for today.</p>
                                </div>
                            ) : (
                                attendance.map((record: any) => (
                                    <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:text-purple-600 transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">{record.employee?.name || "Employee"}</p>
                                                <p className="text-xs text-zinc-500">{record.status || "Present"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-zinc-900">
                                                {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {record.checkOut && ` - ${new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                {record.checkOut ? "Shift Completed" : "Still Working"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
