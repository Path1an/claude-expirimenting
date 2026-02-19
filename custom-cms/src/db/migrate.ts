import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { users, siteSettings } from './schema';

// Load .env.local manually (tsx doesn't load Next.js env)
import { config } from 'dotenv';
config({ path: '.env.local' });

const sqlite = new Database(process.env.DATABASE_PATH ?? 'cms.db');
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });
console.log('✓ Migrations applied.');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (email && password) {
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (!existing) {
    const passwordHash = bcrypt.hashSync(password, 12);
    db.insert(users).values({ email, passwordHash }).run();
    console.log(`✓ Admin user seeded: ${email}`);
  } else {
    console.log(`  Admin user already exists: ${email}`);
  }
} else {
  console.log('  ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping seed.');
}

// Seed default site settings if not exists
const existingSettings = db.select().from(siteSettings).get();
if (!existingSettings) {
  db.insert(siteSettings).values({ siteName: 'My CMS' }).run();
  console.log('✓ Default site settings created.');
}

sqlite.close();
