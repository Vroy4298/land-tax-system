import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, XCircle, Plus, ShieldCheck } from "lucide-react";
import { apiFetch } from "../utils/api";
import { isAdmin } from "../utils/auth";
import Loader from "../components/Loader";

const STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};
const STATUS_ICON = {
    pending: <Clock size={11} />,
    resolved: <CheckCircle2 size={11} />,
    rejected: <XCircle size={11} />,
};

function DisputeCard({ dispute, onResolve, admin }) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handle = async (status) => {
        setLoading(true);
        await onResolve(dispute._id, status, note);
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{dispute.reason}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{dispute.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[dispute.status]}`}>
                    {STATUS_ICON[dispute.status]} {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                </span>
            </div>
            {dispute.adminNote && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-blue-400 pl-2 mb-3">
                    Admin note: {dispute.adminNote}
                </p>
            )}
            <p className="text-xs text-slate-400 mb-3">
                Filed: {new Date(dispute.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </p>

            {admin && dispute.status === "pending" && (
                <div className="flex flex-col gap-2 mt-2">
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (optional)..."
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                        <button disabled={loading} onClick={() => handle("resolved")}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                            ✓ Resolve
                        </button>
                        <button disabled={loading} onClick={() => handle("rejected")}
                            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                            ✗ Reject
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function Disputes() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ propertyId: "", reason: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const admin = isAdmin();

    const fetchDisputes = async () => {
        const endpoint = admin ? "/api/disputes/all" : "/api/disputes";
        const res = await apiFetch(endpoint);
        const data = await res.json();
        setDisputes(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchDisputes();
        if (!admin) {
            apiFetch("/api/properties").then(r => r.json()).then(setProperties).catch(() => { });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await apiFetch("/api/disputes", {
            method: "POST",
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setShowForm(false);
            setForm({ propertyId: "", reason: "", description: "" });
            fetchDisputes();
        } else {
            const d = await res.json();
            setError(d.error || "Failed to raise dispute");
        }
        setSubmitting(false);
    };

    const handleResolve = async (id, status, adminNote) => {
        await apiFetch(`/api/disputes/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status, adminNote }),
        });
        fetchDisputes();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] pt-28 pb-16 px-6 md:px-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        {admin ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                        {admin ? "Admin" : "My Disputes"}
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {admin ? "All Disputes" : "My Disputes"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {admin ? "Review and resolve citizen disputes." : "Raise or track disputes for your properties."}
                            </p>
                        </div>
                        {!admin && (
                            <button onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow">
                                <Plus size={15} /> Raise Dispute
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Raise dispute form */}
                {!admin && showForm && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow mb-6 space-y-4"
                    >
                        <h2 className="font-bold text-slate-800 dark:text-white">New Dispute</h2>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <select required value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="">Select Property</option>
                            {properties.map(p => (
                                <option key={p._id} value={p._id}>{p.ownerName} — {p.address}</option>
                            ))}
                        </select>
                        <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Reason (e.g. Wrong tax calculation)"
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white" />
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Detailed description (optional)"
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white resize-none" />
                        <div className="flex gap-3">
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? "Submitting..." : "Submit Dispute"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 transition">
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-16"><Loader /></div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                        No disputes found.{!admin && " Click 'Raise Dispute' to file one."}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((d) => (
                            <DisputeCard key={d._id} dispute={d} onResolve={handleResolve} admin={admin} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
