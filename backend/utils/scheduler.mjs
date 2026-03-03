import cron from "node-cron";
import { connectDB } from "../db.mjs";
import { sendTaxReminderEmail } from "./mailer.mjs";

export function startScheduler() {
    // Run every day at 8 AM
    cron.schedule("0 8 * * *", async () => {
        console.log("⏰ Running tax reminder cron job...");
        try {
            const db = await connectDB();
            const properties = db.collection("properties");

            // Find properties where dueDate is ~30 days away and still pending
            const now = new Date();
            const from = new Date(now);
            from.setDate(from.getDate() + 29);
            from.setHours(0, 0, 0, 0);

            const to = new Date(now);
            to.setDate(to.getDate() + 31);
            to.setHours(23, 59, 59, 999);

            const pending = await properties
                .find({ paymentStatus: "pending", dueDate: { $gte: from, $lte: to } })
                .toArray();

            console.log(`📬 Found ${pending.length} properties due for reminder`);

            for (const p of pending) {
                if (p.ownerEmail) {
                    await sendTaxReminderEmail(p.ownerEmail, p.ownerName, p.finalTaxAmount, p.dueDate);
                    console.log(`✅ Reminder sent to ${p.ownerEmail}`);
                }
            }
        } catch (err) {
            console.error("Cron job error:", err);
        }
    });

    console.log("📅 Tax reminder scheduler started (runs daily at 8 AM)");
}
