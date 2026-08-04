'use client'

import { useRowLabel } from '@payloadcms/ui'

type HomeBlockRow = {
  enabled?: boolean
  heading?: string
  sectionHeader?: { title?: string }
  settings?: { enabled?: boolean }
  title?: string
}

export function GheeHomeBlockLabel() {
  const { data, rowNumber } = useRowLabel<HomeBlockRow>()
  const title = data?.sectionHeader?.title?.trim()
    || data?.heading?.trim()
    || data?.title?.trim()
    || `Home section ${(rowNumber ?? 0) + 1}`
  const disabled = data?.enabled === false || data?.settings?.enabled === false

  return <span>{title}{disabled ? ' (disabled)' : ''}</span>
}
