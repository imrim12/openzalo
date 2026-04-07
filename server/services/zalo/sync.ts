import { eq, and } from 'drizzle-orm'
import type { ZaloFriend, ZaloGroupInfo } from '~~/shared/types/zalo'
import { conversationTable } from '~~/server/db/pg/schema'
import { upsertZaloContact, upsertZaloConversation } from './upsert'
import { callZaloWorkerAction } from './worker'

type Db = ReturnType<typeof getPgClient>

interface SyncContext {
  db: Db
  userId: string
  channelConnectionId: string
  sessionId: string
}

export async function syncZaloFriends(ctx: SyncContext): Promise<Map<string, string>> {
  const { db, userId, channelConnectionId, sessionId } = ctx
  const contactMap = new Map<string, string>() // zaloUid -> our contactId
  let page = 0
  const pageSize = 200

  while (true) {
    const result = await callZaloWorkerAction<{ friends: ZaloFriend[]; more?: boolean }>(
      sessionId,
      'getAllFriends',
      [pageSize, page],
    )

    const friends = result?.friends ?? []

    for (const friend of friends) {
      const contact = await upsertZaloContact(db, {
        userId,
        channelConnectionId,
        channelContactId: friend.uid,
        name: friend.zaloName,
        avatar: friend.avatar,
        phone: friend.phoneNumber,
      })
      contactMap.set(friend.uid, contact.id)

      await upsertZaloConversation(db, {
        userId,
        channelConnectionId,
        channelThreadId: friend.uid,
        threadType: 'user',
        contactId: contact.id,
        title: friend.zaloName,
        metadata: { avatar: friend.avatar },
      })
    }

    if (!result?.more || friends.length < pageSize) break
    page++
  }

  return contactMap
}

export async function syncZaloGroups(ctx: SyncContext): Promise<void> {
  const { db, userId, channelConnectionId, sessionId } = ctx

  const result = await callZaloWorkerAction<{ gridVerMap?: Record<string, unknown> }>(
    sessionId,
    'getAllGroups',
    [],
  )

  const groupIds = Object.keys(result?.gridVerMap ?? {})
  if (groupIds.length === 0) return

  // Fetch detailed info in batches of 10
  const batchSize = 10
  for (let i = 0; i < groupIds.length; i += batchSize) {
    const batch = groupIds.slice(i, i + batchSize)
    const details = await callZaloWorkerAction<{ gridInfoMap?: Record<string, ZaloGroupInfo> }>(
      sessionId,
      'getGroupInfo',
      [batch],
    )

    for (const [groupId, group] of Object.entries(details?.gridInfoMap ?? {})) {
      await upsertZaloConversation(db, {
        userId,
        channelConnectionId,
        channelThreadId: groupId,
        threadType: 'group',
        title: group.name,
        metadata: {
          avatar: group.avt,
          memberCount: group.totalMember,
          description: group.desc,
        },
      })
    }
  }
}

export async function syncZaloPinnedConversations(ctx: SyncContext): Promise<void> {
  const { db, channelConnectionId, sessionId } = ctx

  const result = await callZaloWorkerAction<{ items?: Array<{ uid?: string; groupId?: string; isGroup?: boolean }> }>(
    sessionId,
    'getPinConversations',
    [],
  )

  const items = result?.items ?? []

  for (const item of items) {
    const threadId = item.isGroup ? item.groupId : item.uid
    if (!threadId) continue

    await db
      .update(conversationTable)
      .set({ is_pinned: true })
      .where(and(
        eq(conversationTable.channel_connection_id, channelConnectionId),
        eq(conversationTable.channel_thread_id, threadId),
      ))
  }
}
