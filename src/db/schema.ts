import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'gacha' | 'voting' | 'pros_cons' | 'dice' | 'cards' | 'picker'
  title: text('title').notNull(),
  options: text('options').notNull(), // JSON - varies by type
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
  state: text('state').notNull(), // JSON - varies by type
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
