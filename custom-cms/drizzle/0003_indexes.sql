CREATE INDEX `idx_pages_pub_created` ON `pages` (`published`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_posts_pub_created` ON `posts` (`published`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_products_pub_created` ON `products` (`published`, `created_at`);
