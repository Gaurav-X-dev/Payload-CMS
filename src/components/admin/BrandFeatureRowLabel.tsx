'use client'

import { useRowLabel } from '@payloadcms/ui'

type BrandFeatureRow = {
  enabled?: boolean
  title?: string
}

export function BrandFeatureRowLabel() {
  const { data, rowNumber } = useRowLabel<BrandFeatureRow>()
  const title = data?.title?.trim() || `Feature ${(rowNumber ?? 0) + 1}`
  return <span>{title}{data?.enabled === false ? ' (disabled)' : ''}</span>
}
