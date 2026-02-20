import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Admin Users ───────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ── Pages ─────────────────────────────────────────────────────────────────────
export const pages = sqliteTable('pages', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  title:           text('title').notNull(),
  slug:            text('slug').notNull().unique(),
  content:         text('content'),
  sortOrder:       integer('sort_order').default(0).notNull(),
  metaTitle:       text('meta_title'),
  metaDescription: text('meta_description'),
  keywords:        text('keywords'),
  published:       integer('published', { mode: 'boolean' }).default(false).notNull(),
  createdAt:       text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt:       text('updated_at').default(sql`(datetime('now'))`).notNull(),
}, (t) => ({
  pubCreatedIdx: index('idx_pages_pub_created').on(t.published, t.createdAt),
}));

// ── Media Library ─────────────────────────────────────────────────────────────
export const media = sqliteTable('media', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  filename:    text('filename').notNull(),
  storedName:  text('stored_name').notNull().unique(),
  mimeType:    text('mime_type').notNull(),
  size:        integer('size').notNull(),
  url:         text('url').notNull(),
  alt:         text('alt'),
  createdAt:   text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ── Products ──────────────────────────────────────────────────────────────────
export const products = sqliteTable('products', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  name:            text('name').notNull(),
  slug:            text('slug').notNull().unique(),
  description:     text('description'),
  price:           real('price').notNull(),
  sortOrder:       integer('sort_order').default(0).notNull(),
  metaTitle:       text('meta_title'),
  metaDescription: text('meta_description'),
  keywords:        text('keywords'),
  published:       integer('published', { mode: 'boolean' }).default(false).notNull(),
  createdAt:       text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt:       text('updated_at').default(sql`(datetime('now'))`).notNull(),
}, (t) => ({
  pubCreatedIdx: index('idx_products_pub_created').on(t.published, t.createdAt),
}));

// ── Product Images ────────────────────────────────────────────────────────────
export const productImages = sqliteTable('product_images', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  mediaId:   integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// ── Blog Posts ────────────────────────────────────────────────────────────────
export const posts = sqliteTable('posts', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  title:           text('title').notNull(),
  slug:            text('slug').notNull().unique(),
  content:         text('content'),
  sortOrder:       integer('sort_order').default(0).notNull(),
  author:          text('author'),
  tags:            text('tags'),           // JSON string: string[]
  publishedAt:     text('published_at'),
  metaTitle:       text('meta_title'),
  metaDescription: text('meta_description'),
  keywords:        text('keywords'),
  published:       integer('published', { mode: 'boolean' }).default(false).notNull(),
  createdAt:       text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt:       text('updated_at').default(sql`(datetime('now'))`).notNull(),
}, (t) => ({
  pubCreatedIdx: index('idx_posts_pub_created').on(t.published, t.createdAt),
}));

// ── API Tokens ────────────────────────────────────────────────────────────────
export const apiTokens = sqliteTable('api_tokens', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  token:       text('token').notNull().unique(), // SHA-256 hash of the raw token
  tokenHint:   text('token_hint'),               // last 4 chars of raw token for masked display
  createdAt:   text('created_at').default(sql`(datetime('now'))`).notNull(),
  lastUsedAt:  text('last_used_at'),
});

// ── Site Settings (singleton row, id = 1) ────────────────────────────────────
export const siteSettings = sqliteTable('site_settings', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  siteName:        text('site_name').notNull().default('My CMS'),
  siteDescription: text('site_description'),
  logoUrl:         text('logo_url'),
  socialLinks:     text('social_links'),  // JSON: { twitter?, github?, linkedin?, ... }
  corsOrigins:     text('cors_origins'),  // JSON: string[]
  updatedAt:       text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

// ── Inferred TypeScript types ─────────────────────────────────────────────────
export type User            = typeof users.$inferSelect;
export type Page            = typeof pages.$inferSelect;
export type NewPage         = typeof pages.$inferInsert;
export type Product         = typeof products.$inferSelect;
export type NewProduct      = typeof products.$inferInsert;
export type Post            = typeof posts.$inferSelect;
export type NewPost         = typeof posts.$inferInsert;
export type Media           = typeof media.$inferSelect;
export type NewMedia        = typeof media.$inferInsert;
export type ApiToken        = typeof apiTokens.$inferSelect;
export type NewApiToken     = typeof apiTokens.$inferInsert;
export type SiteSettings    = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
