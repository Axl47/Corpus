ALTER TABLE `pages` ADD COLUMN IF NOT EXISTS `agent_edited_at` integer;
--> statement-breakpoint
ALTER TABLE `pages` ADD COLUMN IF NOT EXISTS `agent_token_id` text;
