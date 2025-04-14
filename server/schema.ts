import { pgTable, text, timestamp, integer, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Moods table
export const moods = pgTable('moods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  moodId: uuid('mood_id').notNull().references(() => moods.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reactions table
export const reactions = pgTable('reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => posts.id),
  userId: uuid('user_id').notNull(),
  emoji: text('emoji').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').notNull().references(() => posts.id),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Affiliates table
export const affiliates = pgTable('affiliates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  inviteLink: text('invite_link').notNull().unique(),
  totalInvites: integer('total_invites').default(0).notNull(),
  activeUsers: integer('active_users').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const moodRelations = relations(moods, ({ many }) => ({
  posts: many(posts),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  mood: one(moods, {
    fields: [posts.moodId],
    references: [moods.id],
  }),
  reactions: many(reactions),
  comments: many(comments),
}));

export const reactionRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
})); 