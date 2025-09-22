PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_image_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`original_r2_key` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer,
	`format` text,
	`cached_r2_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_image_cache`("id", "original_r2_key", "width", "height", "format", "cached_r2_key", "created_at") SELECT "id", "original_r2_key", "width", "height", "format", "cached_r2_key", "created_at" FROM `image_cache`;--> statement-breakpoint
DROP TABLE `image_cache`;--> statement-breakpoint
ALTER TABLE `__new_image_cache` RENAME TO `image_cache`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_image_cache_original` ON `image_cache` (`original_r2_key`);--> statement-breakpoint
CREATE INDEX `uk_image_cache_params` ON `image_cache` (`original_r2_key`,`width`,`height`,`format`);