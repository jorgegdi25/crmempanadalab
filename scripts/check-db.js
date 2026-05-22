const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function main() {
    try {
        console.log("Connecting to:", process.env.POSTGRES_URL);
        const email = "info@empanadaslab.com";
        const passwordHash = await bcrypt.hash("admin123", 10);
        
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
        
        if (rows.length > 0) {
            console.log("User exists, updating password...");
            await sql`UPDATE users SET password = ${passwordHash} WHERE email = ${email}`;
            console.log("Password updated.");
        } else {
            console.log("Inserting user...");
            await sql`INSERT INTO users (name, email, password) VALUES ('Admin', ${email}, ${passwordHash})`;
            console.log("User inserted.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
