-- Recreate pages table: keep agent_edited_at and agent_token_id as plain
-- nullable columns WITHOUT a foreign-key constraint on agent_token_id.
-- The FK was added in 0016 but (a) ALTER TABLE ADD COLUMN ... REFERENCES is
-- not reliably supported in all libsql builds, and (b) an ON DELETE RESTRICT
-- FK would block workspace cascade-deletes that go through agent_tokens.

PRAGMA foreign_keys = OFF;
--> statement-breakpoint

CREATE TABLE `pages_new` (
  `id` text PRIMARY KEY NOT NULL,
  `database_id` text NOT NULL REFERENCES `databases`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `content` text NOT NULL DEFAULT '',
  `properties` text NOT NULL DEFAULT '{}',
  `sort_order` integer NOT NULL DEFAULT 0,
  `icon` text,
  `icon_color` text,
  `created_at` integer NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` integer NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `agent_edited_at` integer,
  `agent_token_id` text
);
--> statement-breakpoint

INSERT INTO `pages_new` (id, database_id, title, content, properties, sort_order, icon, icon_color, created_at, updated_at)
  SELECT id, database_id, title, content, properties, sort_order, icon, icon_color, created_at, updated_at
  FROM `pages`;
--> statement-breakpoint

DROP TABLE `pages`;
--> statement-breakpoint

ALTER TABLE `pages_new` RENAME TO `pages`;
--> statement-breakpoint

CREATE INDEX `pages_database_id_idx` ON `pages` (`database_id`);
--> statement-breakpoint

PRAGMA foreign_keys = ON;
