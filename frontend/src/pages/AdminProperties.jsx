import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Building2, CheckCircle2, Clock, Filter } from "lucide-react";
import { apiFetch } from "../utils/api";
import Loader from "../components/Loader";

const STATUS_COLORS = {
    paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

export default function AdminProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [zone, setZone] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ search, zone, status, page, limit: 15 });
            const res = await apiFetch(`/api/admin/properties?${params}`);
            const data = await res.json();
            setProperties(data.properties || []);
            setTotalPages(data.pages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, zone, status, page]);

    useEffect(() => { fetchProperties(); }, [fetchProperties]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-28 pb-16 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Building2 size={14} /> Admin Panel
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Properties</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{total} total records across all users.</p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search owner, address..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select value={zone} onChange={(e) => { setZone(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                        <option value="all">All Zones</option>
                        {["A", "B", "C"].map(z => <option key={z} value={z}>Zone {z}</option>)}
                    </select>
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader /></div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-slate-500">No properties found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/30">
                                    <tr>
                                        {["Owner", "Address", "Type", "Zone", "Area (sq ft)", "Tax (₹)", "Status"].map(h => (
                                            <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {properties.map((p) => (
                                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">{p.ownerName}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{p.address}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">{p.propertyType}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{p.zone}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{Number(p.builtUpArea).toLocaleString()}</td>
                                            <td className="px-5 py-4 text-sm font-mono font-semibold text-slate-800 dark:text-white">₹{Number(p.finalTaxAmount).toLocaleString("en-IN")}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.paymentStatus] || ""}`}>
                                                    {p.paymentStatus === "paid"
                                                        ? <><CheckCircle2 size={11} /> Paid</>
                                                        : <><Clock size={11} /> Pending</>}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40">← Prev</button>
                            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40">Next →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
