import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
    BarChart, Bar,
} from "recharts";
import {
    Building2, CheckCircle2, Clock, IndianRupee,
    Users, LayoutDashboard, TrendingUp,
} from "lucide-react";
import { apiFetch } from "../utils/api";
import Loader from "../components/Loader";

const COLORS = ["#22c55e", "#f59e0b"];

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 flex items-center gap-5"
        >
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/admin/stats")
            .then((r) => r.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b1220]">
            <Loader />
        </div>
    );

    const pieData = [
        { name: "Paid", value: stats?.paid || 0 },
        { name: "Pending", value: stats?.pending || 0 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-28 pb-16 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-xs mb-2">
                        <LayoutDashboard size={14} /> Admin Panel
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">System-wide overview of all properties and tax collections.</p>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard icon={Building2} label="Total Properties" value={stats?.total ?? 0} color="bg-blue-500" />
                    <StatCard icon={CheckCircle2} label="Paid" value={stats?.paid ?? 0} color="bg-emerald-500" />
                    <StatCard icon={Clock} label="Pending" value={stats?.pending ?? 0} color="bg-amber-500" />
                    <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} color="bg-violet-500" />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Payment Status
                        </h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [v, ""]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Line Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500" /> Monthly Payments (Last 6 months)
                        </h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={stats?.monthlyTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="payments" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Payments" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Zone Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Building2 size={16} className="text-violet-500" /> Zone Breakdown
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={stats?.zoneBreakdown || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Properties" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Property Type Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Users size={16} className="text-rose-500" /> Property Types
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={stats?.typeBreakdown || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
