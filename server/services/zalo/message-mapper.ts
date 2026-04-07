import type { MessageAttachment } from '~~/shared/types/message'
import type { ZaloMessage } from '~~/shared/types/zalo'
import type { InferInsert, messageTable } from '~~/server/db/pg/schema'

type MessageInsert = InferInsert<typeof messageTable>

export function parseZaloAttachments(attach?: string): MessageAttachment[] {
  if (!attach)
    return []
  try {
    const parsed = JSON.parse(attach)
    if (Array.isArray(parsed)) {
      return parsed.map((a: any) => {
        const url = a.url ?? a.href ?? ''
        // Infer type from URL when Zalo omits or sends an empty type
        let type = (a.type as string | undefined) || ''
        if (!type) {
          if (/\.(jpg|jpeg|png|gif|webp|bmp|heic)(\?|$)/i.test(url) || /\/(jpg|png|gif|img)\//i.test(url)) {
            type = 'image'
          }
          else if (/\.(mp4|mov|avi|webm)(\?|$)/i.test(url)) {
            type = 'video'
          }
          else {
            type = 'file'
          }
        }
        return {
          type: type as MessageAttachment['type'],
          url,
          fileName: a.name,
          fileSize: a.size,
          mimeType: a.fileType,
          thumbnailUrl: a.thumb,
          width: a.width,
          height: a.height,
        }
      })
    }
    return []
  }
  catch {
    return []
  }
}

export function mapZaloMessageToInsert(
  msg: ZaloMessage,
  conversationId: string,
  ownZaloId?: string,
): Omit<MessageInsert, 'id'> {
  const attachments = parseZaloAttachments(msg.attach)
  const msgType = attachments.length > 0
    ? (attachments[0]?.type === 'image' ? 'image' : 'file')
    : 'text'

  const senderType = ownZaloId && msg.fromUid === ownZaloId ? 'agent' : 'contact'
  const sentAt = msg.timestamp ? new Date(msg.timestamp) : new Date()

  return {
    conversation_id: conversationId,
    channel_message_id: msg.msgId,
    sender_type: senderType,
    message_type: msgType,
    content: msg.message,
    attachments,
    sent_at: sentAt,
    created_at: sentAt,
    metadata: {
      zaloFrom: msg.fromUid,
      zaloCliMsgId: msg.clientMsgId ?? msg.msgId,
      zaloMsgType: msg.msgType ?? 'chat.text',
      zaloTs: msg.timestamp,
    },
  }
}
