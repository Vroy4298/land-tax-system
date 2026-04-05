import bcrypt from "bcryptjs";
import { connectDB } from "./db.mjs";

async function seedDemoUsers() {
  try {
    console.log("Connecting to Database...");
    const db = await connectDB();
    const users = db.collection("users");

    // 1. Array of demo users
    const demoUsers = [
      {
        name: "Demo Citizen",
        email: "citizen@example.com",
        password: "password123",
        role: "citizen",
      },
      {
        name: "Demo Admin",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      },
    ];

    for (const demoUser of demoUsers) {
      // Check if user exists
      const existing = await users.findOne({ email: demoUser.email });

      if (existing) {
        console.log(`✅ User ${demoUser.email} already exists. Skipping...`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);
        
        // Insert user
        await users.insertOne({
          name: demoUser.name,
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role,
          createdAt: new Date(),
        });
        console.log(`✅ Successfully created demo user: ${demoUser.email} (Role: ${demoUser.role})`);
      }
    }

    console.log("🎉 Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDemoUsers();
