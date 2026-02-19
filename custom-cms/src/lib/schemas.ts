import { z } from 'zod';

const slug = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens');

const optionalText = z.string().max(100_000).nullish();
const optionalShort = z.string().max(200).nullish();
const optionalMeta = z.string().max(500).nullish();

export const PageSchema = z.object({
  title: z.string().min(1).max(200),
  slug,
  content: optionalText,
  metaTitle: optionalShort,
  metaDescription: optionalMeta,
  keywords: optionalMeta,
  published: z.boolean().optional(),
});

export const PageUpdateSchema = PageSchema.partial();

export const PostSchema = z.object({
  title: z.string().min(1).max(200),
  slug,
  content: optionalText,
  author: optionalShort,
  tags: optionalMeta,
  publishedAt: z.string().max(100).nullish(),
  metaTitle: optionalShort,
  metaDescription: optionalMeta,
  keywords: optionalMeta,
  published: z.boolean().optional(),
});

export const PostUpdateSchema = PostSchema.partial();

export const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug,
  description: optionalText,
  price: z.number().nonnegative(),
  metaTitle: optionalShort,
  metaDescription: optionalMeta,
  keywords: optionalMeta,
  published: z.boolean().optional(),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const SettingsSchema = z.object({
  siteName: z.string().min(1).max(200).optional(),
  siteDescription: z.string().max(1000).nullish(),
  logoUrl: z.string().max(500).nullish(),
  socialLinks: z.record(z.string(), z.string()).nullish(),
  corsOrigins: z.array(z.string().min(1).max(500)).nullish(),
});
