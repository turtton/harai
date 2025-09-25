CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`tags` text,
	`published` integer DEFAULT false,
	`publish_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_articles_slug` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_articles_published` ON `articles` (`published`);--> statement-breakpoint
CREATE INDEX `idx_articles_publish_date` ON `articles` (`publish_date`);--> statement-breakpoint
CREATE TABLE `image_cache` (
	`original_r2_key` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer,
	`format` text,
	`cached_r2_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `idx_image_cache_original` ON `image_cache` (`original_r2_key`);--> statement-breakpoint
CREATE INDEX `pk_image_cache` ON `image_cache` (`original_r2_key`,`width`,`height`,`format`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`r2_key` text NOT NULL,
	`original_name` text,
	`size` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_resources_article_id` ON `resources` (`article_id`);--> statement-breakpoint
CREATE INDEX `idx_resources_r2_key` ON `resources` (`r2_key`);--> statement-breakpoint
CREATE INDEX `idx_resources_article_slug` ON `resources` (`article_id`,`slug`);