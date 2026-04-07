import type { Updater } from '@tanstack/vue-table'
import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date)
    return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60)
    return 'Just now'
  if (diffMins < 60)
    return `${diffMins}m`
  if (diffHours < 24)
    return `${diffHours}h`
  if (diffDays < 7)
    return `${diffDays}d`
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date: Date | string | null): string {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateSeparator(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000).toDateString()

  if (d.toDateString() === today)
    return 'Today'
  if (d.toDateString() === yesterday)
    return 'Yesterday'
  return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function formatFileSize(bytes?: number): string {
  if (!bytes)
    return ''
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
