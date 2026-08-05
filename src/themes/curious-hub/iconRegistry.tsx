/**
 * Curious Ladoo decorative icon registry.
 *
 * CMS `icon` fields on contentgridBlock/tickerBlock items are free text. A value that matches
 * one of these known slugs renders the original designer SVG; anything else (an emoji, a glyph,
 * or an unrecognized string) is rendered as raw text, which is exactly how the pre-CMS design
 * already displayed Our Edge/Industries icons (plain emoji rendered directly, no SVG involved).
 */
import type { JSX } from 'react'

type IconDef = {
  viewBox: string
  paths: JSX.Element
}

const svgIcon = (viewBox: string, paths: JSX.Element): IconDef => ({ viewBox, paths })

export const CURIOUS_HUB_ICONS: Record<string, IconDef> = {
  // Philosophy pillars (Home)
  question: svgIcon('0 0 48 48', <><circle cx="24" cy="24" r="20" /><path d="M24 14v20M14 24h20" /></>),
  design: svgIcon('0 0 48 48', <><rect height="32" rx="2" width="32" x="8" y="8" /><path d="M8 20h32M20 8v32" /></>),
  build: svgIcon('0 0 48 48', <path d="M8 40l10-16 8 8 8-24 6 32" />),
  people: svgIcon('0 0 48 48', <><circle cx="24" cy="20" r="8" /><path d="M8 40c0-8.84 7.16-16 16-16s16 7.16 16 16" /></>),
  care: svgIcon('0 0 48 48', <path d="M24 4l4 12h12l-10 8 4 12-10-8-10 8 4-12L8 16h12z" />),

  // Services preview (Home)
  'restaurant-brands': svgIcon('0 0 40 40', <><path d="M4 36V10l16-6 16 6v26" /><rect height="16" rx="1" width="12" x="14" y="20" /></>),
  delivery: svgIcon('0 0 40 40', <><circle cx="20" cy="20" r="16" /><path d="M20 4v16l10 6" /></>),
  'cloud-kitchen': svgIcon('0 0 40 40', <><rect height="24" rx="2" width="32" x="4" y="8" /><path d="M4 16h32M14 8v24" /></>),
  consulting: svgIcon('0 0 40 40', <><path d="M8 32l6-6 6 6 12-16" /><circle cx="32" cy="12" r="4" /></>),
  'menu-engineering': svgIcon('0 0 40 40', <><rect height="28" rx="2" width="28" x="6" y="6" /><path d="M6 18h28M18 6v28" /></>),
  'restaurant-design': svgIcon('0 0 40 40', <><path d="M4 20h32M20 4l10 16-10 16-10-16z" /></>),
  'brand-strategy': svgIcon('0 0 40 40', <><circle cx="20" cy="20" r="16" /><path d="M12 20l6 6 10-12" /></>),
  operations: svgIcon('0 0 40 40', <><path d="M8 8h24v24H8z" /><path d="M14 16h12M14 20h8M14 24h10" /></>),
  franchise: svgIcon('0 0 40 40', <><path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16" /><path d="M28 4l8 8-8 8" /></>),
  'kitchen-planning': svgIcon('0 0 40 40', <><rect height="14" rx="1" width="14" x="4" y="4" /><rect height="14" rx="1" width="14" x="22" y="4" /><rect height="14" rx="1" width="14" x="4" y="22" /><rect height="14" rx="1" width="14" x="22" y="22" /></>),
  technology: svgIcon('0 0 40 40', <><rect height="24" rx="2" width="32" x="4" y="8" /><path d="M16 20l-6 4V16l6 4zm4 0h8" /></>),
  'staff-training': svgIcon('0 0 40 40', <><circle cx="14" cy="20" r="8" /><circle cx="28" cy="14" r="6" /><circle cx="28" cy="28" r="5" /><path d="M21 16l5-2M21 24l5 2" /></>),
  investment: svgIcon('0 0 40 40', <path d="M20 4l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" />),
  'managed-services': svgIcon('0 0 40 40', <><path d="M8 12h24v16H8z" /><path d="M12 28l4 4M28 28l-4 4" /></>),
  'new-brand': svgIcon('0 0 40 40', <><path d="M20 4v32M4 20h32" /><circle cx="20" cy="20" r="8" /></>),

  // B2B cards (Home)
  investors: svgIcon('0 0 44 44', <path d="M22 4l5 10 11 2.5-8 8 2 11-10-5.5-10 5.5 2-11-8-8 11-2.5z" />),
  'franchise-partners': svgIcon('0 0 44 44', <><circle cx="22" cy="22" r="18" /><path d="M14 22l6 6 10-12" /></>),
  landlords: svgIcon('0 0 44 44', <><rect height="28" rx="2" width="36" x="4" y="8" /><path d="M4 18h36M16 8v28" /></>),
  suppliers: svgIcon('0 0 44 44', <><path d="M6 36V16L22 6l16 10v20" /><rect height="14" rx="1" width="16" x="14" y="22" /></>),
}

export const CURIOUS_HUB_ICON_NAMES = Object.keys(CURIOUS_HUB_ICONS)

export function CuriousHubIcon({
  className,
  name,
}: {
  className?: string
  name: string
}) {
  const icon = CURIOUS_HUB_ICONS[name]
  if (!icon) return <span aria-hidden="true">{name}</span>
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox={icon.viewBox}
    >
      {icon.paths}
    </svg>
  )
}
