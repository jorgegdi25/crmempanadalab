const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL_NON_POOLING,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    try {
        const email = "info@empanadaslab.com";
        const passwordHash = await bcrypt.hash("admin123", 10);
        
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) {
            console.log("User exists, updating password...");
            await client.query('UPDATE users SET password = $1 WHERE email = $2', [passwordHash, email]);
            console.log("Updated.");
        } else {
            console.log("Inserting user...");
            await client.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', ['Admin', email, passwordHash]);
            console.log("Inserted.");
        }
    } catch(e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
