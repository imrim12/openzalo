/** zca-js response shapes used for sync and webhooks. */

export interface ZaloFriend {
  uid: string
  zaloName: string
  avatar: string
  bgavatar?: string
  gender?: number
  sdob?: string
  type?: number
  isFr?: number
  isBlocked?: number
  phoneNumber?: string
}

export interface ZaloGroupSummary {
  groupId: string
  name: string
  avt: string
  totalMember: number
  type?: number
}

export interface ZaloGroupMember {
  uid: string
  zaloName: string
  avatar: string
  dname?: string
  type?: number
}

export interface ZaloGroupInfo {
  groupId: string
  name: string
  desc?: string
  avt: string
  totalMember: number
  memVerList: ZaloGroupMember[]
}

export interface ZaloMessage {
  msgId: string
  clientMsgId?: string
  fromUid: string
  toUid: string
  message: string
  type: number
  timestamp: number
  msgType?: string
  quote?: {
    attach?: string
    msg: string
    cliMsgId?: string
    globalMsgId?: string
    ownerId?: string
    ownerName?: string
  }
  attach?: string // JSON string of attachment info
  reactions?: ZaloReaction[]
  isGroup?: boolean
  groupId?: string
}

export interface ZaloReaction {
  reactionType: number
  uid: string
  targetMsgId: string
}

export interface ZaloConversationMark {
  uid?: string
  groupId?: string
  isGroup: boolean
  unreadCount?: number
}

export interface ZaloPinConversation {
  uid?: string
  groupId?: string
  isGroup: boolean
  name: string
  avt: string
}

export interface ZaloAttachment {
  type: 'image' | 'video' | 'audio' | 'file' | 'gif'
  url?: string
  thumb?: string
  width?: number
  height?: number
  name?: string
  size?: number
  fileType?: string
}

/** Thread type enum matching zca-js ThreadType */
export const ZaloThreadType = {
  User: 0,
  Group: 1,
} as const

export type ZaloThreadTypeValue = typeof ZaloThreadType[keyof typeof ZaloThreadType]
