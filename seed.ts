import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './src/lib/db';
import { users } from './src/lib/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding admin user...');
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      email: 'info@empanadaslab.com',
      password: hashedPassword,
      name: 'Admin',
    });
    console.log('Admin user seeded successfully. You can log in with info@empanadaslab.com / admin123');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Admin user already exists.');
    } else {
      console.error('Error seeding user:', error);
    }
  }
  process.exit(0);
}

seed();
