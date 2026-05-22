import { pgTable, uuid, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  source: varchar('source', { length: 255 }),
  status: varchar('status', { length: 50 }).default('Nuevo'),
  notes: text('notes'),
  country: varchar('country', { length: 255 }),
  city: varchar('city', { length: 255 }),
  tags: jsonb('tags').$type<string[]>(),
  product_interest: varchar('product_interest', { length: 255 }),
  next_follow_up: timestamp('next_follow_up'),
  follow_up_method: varchar('follow_up_method', { length: 50 }),
  user_id: uuid('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const interactions = pgTable('interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  lead_id: uuid('lead_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  user_id: uuid('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscription_data: jsonb('subscription_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
