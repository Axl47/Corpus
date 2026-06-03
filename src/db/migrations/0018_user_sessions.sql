CREATE TABLE `user_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `started_at` integer NOT NULL,
  `last_seen_at` integer NOT NULL,
  `duration_seconds` integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `user_sessions_user_id_idx` ON `user_sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `user_sessions_last_seen_at_idx` ON `user_sessions` (`last_seen_at`);
