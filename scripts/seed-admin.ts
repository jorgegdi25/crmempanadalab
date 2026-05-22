import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import { users } from "../src/lib/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedAdmin() {
    console.log("STARTING SEED");
    try {
        const email = "info@empanadaslab.com";
        const passwordHash = await bcrypt.hash("admin123", 10);

        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (existing.length > 0) {
            console.log("Admin user already exists. Updating password just in case...");
            await db.update(users).set({ password: passwordHash }).where(eq(users.email, email));
            console.log("Password updated successfully.");
        } else {
            console.log("Creating admin user...");
            await db.insert(users).values({
                name: "Admin Empanadas Lab",
                email: email,
                password: passwordHash
            });
            console.log("Admin user created successfully.");
        }
    } catch (e) {
        console.error("Failed to seed admin:", e);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
