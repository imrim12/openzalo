export interface MessageAttachment {
  type: 'image' | 'file' | 'video' | 'audio'
  url: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
  width?: number
  height?: number
}

export interface MessageReaction {
  emoji: string
  count: number
  users: { id: string, name: string }[]
}
