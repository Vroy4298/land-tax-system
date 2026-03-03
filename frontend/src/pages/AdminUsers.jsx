import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Search } from "lucide-react";
import { apiFetch } from "../utils/api";
import Loader from "../components/Loader";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/admin/users")
            .then((r) => r.json())
            .then((data) => { setUsers(data); setFiltered(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter((u) =>
            u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        ));
    }, [search, users]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-28 pb-16 px-6 md:px-10">
            <div className="max-w-5xl mx-auto">

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Users size={14} /> Admin Panel
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{users.length} registered accounts.</p>
                </motion.div>

                {/* Search */}
                <div className="relative mb-5 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500">No users found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/30">
                                    <tr>
                                        {["Name", "Email", "Role", "Joined"].map((h) => (
                                            <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filtered.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-white">{u.name}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                                            <td className="px-5 py-4">
                                                {u.role === "admin" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                                                        <UserCheck size={11} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                                                        <UserX size={11} /> Citizen
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
