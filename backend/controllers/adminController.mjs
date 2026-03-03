import { getPropertyCollection } from "../models/Property.mjs";
import { connectDB } from "../db.mjs";

/* ---------------------- SITE-WIDE STATS FOR ADMIN DASHBOARD ---------------------- */
export const getStats = async (req, res) => {
    try {
        const collection = await getPropertyCollection();

        const total = await collection.countDocuments();
        const paid = await collection.countDocuments({ paymentStatus: "paid" });
        const pending = await collection.countDocuments({ paymentStatus: "pending" });

        // Total revenue
        const revenueAgg = await collection
            .aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$finalTaxAmount" } } },
            ])
            .toArray();
        const totalRevenue = revenueAgg[0]?.total || 0;

        // Monthly payment trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyAgg = await collection
            .aggregate([
                { $match: { paymentStatus: "paid", paymentDate: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$paymentDate" },
                            month: { $month: "$paymentDate" },
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: "$finalTaxAmount" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ])
            .toArray();

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTrend = monthlyAgg.map((m) => ({
            month: monthNames[m._id.month - 1],
            payments: m.count,
            revenue: m.revenue,
        }));

        // Zone breakdown
        const zoneAgg = await collection
            .aggregate([
                { $group: { _id: "$zone", count: { $sum: 1 }, revenue: { $sum: "$finalTaxAmount" } } },
                { $sort: { _id: 1 } },
            ])
            .toArray();
        const zoneBreakdown = zoneAgg.map((z) => ({ zone: z._id || "Unknown", count: z.count, revenue: z.revenue }));

        // Property type breakdown
        const typeAgg = await collection
            .aggregate([
                { $group: { _id: "$propertyType", count: { $sum: 1 } } },
            ])
            .toArray();
        const typeBreakdown = typeAgg.map((t) => ({ type: t._id || "Unknown", count: t.count }));

        res.json({ total, paid, pending, totalRevenue, monthlyTrend, zoneBreakdown, typeBreakdown });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
