import type { Endpoints } from '@octokit/types'
import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import type { TokenPayload } from 'google-auth-library'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// --- Utility Types ---

type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T]

export type InferSelect<T extends Table>
  = InferSelectModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never

export type InferInsert<T extends Table>
  = InferInsertModel<T> extends infer S
    ? Omit<S, NullableKeys<S>> & Partial<Pick<S, NullableKeys<S>>>
    : never

export type GoogleUser = TokenPayload
export type GitHubUser = Endpoints['GET /user']['response']['data']

// --- Enums ---

enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

function enumToPgEnum(myEnum: any): [string, ...string[]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as [string, ...string[]]
}

export const providerEnum = pgEnum('auth_provider', enumToPgEnum(AuthProvider))

export enum ActivityAction {
  SIGN_IN = 'auth:sign_in',
  SIGN_UP = 'auth:sign_up',
}

export const activityActionEnum = pgEnum('activity_action', ActivityAction)

// --- Tables ---

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),

  // User profile data
  username: varchar('username', { length: 64 }),
  name: varchar('name', { length: 255 }),
  primary_email: varchar('primary_email', { length: 255 }).unique().notNull(),
  primary_phone: varchar('primary_phone', { length: 32 }).unique(),
  avatar: varchar('avatar', { length: 2048 }),

  // Settings
  verified: boolean('verified').default(false),
  email_notifications: boolean('email_notifications').default(true),

  // Metadata
  custom_data: jsonb('custom_data').default({}),
  last_sign_in_at: timestamp('last_sign_in_at', { withTimezone: true }),
  is_suspended: boolean('is_suspended').default(false),

  // Timestamps
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('users_username_idx').on(table.username),
  index('users_name_idx').on(table.name),
])

export type User = InferSelect<typeof userTable>

export const identityTable = pgTable('identities', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  provider: providerEnum('provider').notNull(),
  provider_user_id: varchar('provider_user_id', { length: 255 }).notNull(),
  provider_data: jsonb('provider_data').$type<GoogleUser | GitHubUser>(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('identities_user_id_idx').on(table.user_id),
  uniqueIndex('identities_provider_unique_idx').on(table.provider, table.provider_user_id),
])

export type Identity = InferSelect<typeof identityTable>

export const activityTable = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  action: activityActionEnum('action').notNull(),
  action_ref_id: uuid('action_ref_id'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('activities_user_id_idx').on(table.user_id),
])

// --- New Enums ---

export const channelTypeEnum = pgEnum('channel_type', ['zalo', 'facebook', 'telegram', 'webchat'])
export const channelStatusEnum = pgEnum('channel_status', ['active', 'disconnected', 'error', 'pending'])
export const conversationStatusEnum = pgEnum('conversation_status', ['open', 'closed', 'archived', 'snoozed'])
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'file', 'video', 'sticker', 'system'])
export const messageSenderTypeEnum = pgEnum('message_sender_type', ['contact', 'agent', 'system'])
export const dealStageEnum = pgEnum('deal_stage', ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])

// --- New Tables ---

export const channelConnectionTable = pgTable('channel_connections', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  channel_type: channelTypeEnum('channel_type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  account_identifier: varchar('account_identifier', { length: 255 }),
  credentials: text('credentials'),
  status: channelStatusEnum('status').default('pending').notNull(),
  status_message: text('status_message'),
  metadata: jsonb('metadata').default({}),
  last_active_at: timestamp('last_active_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('channel_connections_user_id_idx').on(table.user_id),
  index('channel_connections_status_idx').on(table.status),
])

export type ChannelConnection = InferSelect<typeof channelConnectionTable>

export const contactTable = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 2048 }),
  phone: varchar('phone', { length: 32 }),
  email: varchar('email', { length: 255 }),
  channel_type: channelTypeEnum('channel_type'),
  channel_contact_id: varchar('channel_contact_id', { length: 255 }),
  channel_connection_id: uuid('channel_connection_id')
    .references(() => channelConnectionTable.id, { onDelete: 'set null' }),
  tags: jsonb('tags').$type<string[]>().default([]),
  notes: text('notes'),
  custom_data: jsonb('custom_data').default({}),
  last_contacted_at: timestamp('last_contacted_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('contacts_user_id_idx').on(table.user_id),
  index('contacts_channel_contact_id_idx').on(table.channel_contact_id),
])

export type Contact = InferSelect<typeof contactTable>

export const conversationTable = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  channel_connection_id: uuid('channel_connection_id')
    .references(() => channelConnectionTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  contact_id: uuid('contact_id')
    .references(() => contactTable.id, { onDelete: 'set null' }),
  channel_thread_id: varchar('channel_thread_id', { length: 255 }),
  thread_type: varchar('thread_type', { length: 32 }).default('user').notNull(),
  title: varchar('title', { length: 255 }),
  status: conversationStatusEnum('status').default('open').notNull(),
  is_starred: boolean('is_starred').default(false),
  is_pinned: boolean('is_pinned').default(false),
  unread_count: integer('unread_count').default(0),
  last_message_at: timestamp('last_message_at', { withTimezone: true }),
  last_message_preview: text('last_message_preview'),
  metadata: jsonb('metadata').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('conversations_user_id_idx').on(table.user_id),
  index('conversations_channel_connection_id_idx').on(table.channel_connection_id),
  index('conversations_last_message_at_idx').on(table.last_message_at),
  index('conversations_channel_thread_id_idx').on(table.channel_thread_id),
])

export type Conversation = InferSelect<typeof conversationTable>

export const messageTable = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  conversation_id: uuid('conversation_id')
    .references(() => conversationTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  channel_message_id: varchar('channel_message_id', { length: 255 }),
  sender_type: messageSenderTypeEnum('sender_type').notNull(),
  sender_name: varchar('sender_name', { length: 255 }),
  sender_avatar: varchar('sender_avatar', { length: 2048 }),
  message_type: messageTypeEnum('message_type').default('text').notNull(),
  content: text('content'),
  reply_to_id: uuid('reply_to_id'),
  attachments: jsonb('attachments').$type<import('~~/shared/types/message').MessageAttachment[]>().default([]),
  reactions: jsonb('reactions').$type<import('~~/shared/types/message').MessageReaction[]>().default([]),
  metadata: jsonb('metadata').default({}),
  is_edited: boolean('is_edited').default(false),
  is_deleted: boolean('is_deleted').default(false),
  sent_at: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('messages_conversation_id_idx').on(table.conversation_id),
  index('messages_sent_at_idx').on(table.sent_at),
  index('messages_channel_message_id_idx').on(table.channel_message_id),
])

export type Message = InferSelect<typeof messageTable>

export const dealTable = pgTable('deals', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  contact_id: uuid('contact_id')
    .references(() => contactTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  value: integer('value').default(0),
  currency: varchar('currency', { length: 3 }).default('VND'),
  stage: dealStageEnum('stage').default('lead').notNull(),
  notes: text('notes'),
  closed_at: timestamp('closed_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('deals_user_id_idx').on(table.user_id),
  index('deals_contact_id_idx').on(table.contact_id),
  index('deals_stage_idx').on(table.stage),
])

export type Deal = InferSelect<typeof dealTable>

export const quickMessageTable = pgTable('quick_messages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  shortcut: varchar('shortcut', { length: 32 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('quick_messages_user_id_idx').on(table.user_id),
])

export type QuickMessage = InferSelect<typeof quickMessageTable>

export const autoReplyRuleTable = pgTable('auto_reply_rules', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  user_id: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  channel_connection_id: uuid('channel_connection_id')
    .references(() => channelConnectionTable.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  trigger_type: varchar('trigger_type', { length: 32 }).notNull(),
  trigger_value: text('trigger_value'),
  response_content: text('response_content').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, table => [
  index('auto_reply_rules_user_id_idx').on(table.user_id),
  index('auto_reply_rules_channel_connection_id_idx').on(table.channel_connection_id),
])

export type AutoReplyRule = InferSelect<typeof autoReplyRuleTable>

// --- Relations ---

export const userRelations = relations(userTable, ({ many }) => ({
  identities: many(identityTable),
  activities: many(activityTable),
}))

export const identityRelations = relations(identityTable, ({ one }) => ({
  user: one(userTable, {
    fields: [identityTable.user_id],
    references: [userTable.id],
  }),
}))

export const activityRelations = relations(activityTable, ({ one }) => ({
  user: one(userTable, {
    fields: [activityTable.user_id],
    references: [userTable.id],
  }),
}))

export const channelConnectionRelations = relations(channelConnectionTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [channelConnectionTable.user_id],
    references: [userTable.id],
  }),
  conversations: many(conversationTable),
  autoReplyRules: many(autoReplyRuleTable),
}))

export const contactRelations = relations(contactTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [contactTable.user_id],
    references: [userTable.id],
  }),
  channelConnection: one(channelConnectionTable, {
    fields: [contactTable.channel_connection_id],
    references: [channelConnectionTable.id],
  }),
  conversations: many(conversationTable),
  deals: many(dealTable),
}))

export const conversationRelations = relations(conversationTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [conversationTable.user_id],
    references: [userTable.id],
  }),
  channelConnection: one(channelConnectionTable, {
    fields: [conversationTable.channel_connection_id],
    references: [channelConnectionTable.id],
  }),
  contact: one(contactTable, {
    fields: [conversationTable.contact_id],
    references: [contactTable.id],
  }),
  messages: many(messageTable),
}))

export const messageRelations = relations(messageTable, ({ one }) => ({
  conversation: one(conversationTable, {
    fields: [messageTable.conversation_id],
    references: [conversationTable.id],
  }),
}))

export const dealRelations = relations(dealTable, ({ one }) => ({
  user: one(userTable, {
    fields: [dealTable.user_id],
    references: [userTable.id],
  }),
  contact: one(contactTable, {
    fields: [dealTable.contact_id],
    references: [contactTable.id],
  }),
}))

export const quickMessageRelations = relations(quickMessageTable, ({ one }) => ({
  user: one(userTable, {
    fields: [quickMessageTable.user_id],
    references: [userTable.id],
  }),
}))

export const autoReplyRuleRelations = relations(autoReplyRuleTable, ({ one }) => ({
  user: one(userTable, {
    fields: [autoReplyRuleTable.user_id],
    references: [userTable.id],
  }),
  channelConnection: one(channelConnectionTable, {
    fields: [autoReplyRuleTable.channel_connection_id],
    references: [channelConnectionTable.id],
  }),
}))
