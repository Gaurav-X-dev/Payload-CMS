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

/**
 * Social platform badges (Footer, `SiteSettings.socials`). A separate, small registry from
 * CURIOUS_HUB_ICONS above — that one is for decorative content-grid/ticker icons; this one keys
 * off the `socials.icon` field (defaults to `socials.platform`) and covers exactly that field's
 * option set. Simplified outline glyphs in the same stroke style as the rest of the theme's SVG
 * icons, not literal brand marks.
 */
const SOCIAL_ICONS: Record<string, IconDef> = {
  facebook: svgIcon('0 0 24 24', <path d="M15 4h-2a4 4 0 0 0-4 4v3H6v3h3v6h3v-6h2.5l.5-3h-3V8a1 1 0 0 1 1-1h2z" />),
  instagram: svgIcon('0 0 24 24', <><rect height="16" rx="4" width="16" x="4" y="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" fill="currentColor" r="0.8" stroke="none" /></>),
  link: svgIcon('0 0 24 24', <><path d="M9 15l6-6" /><path d="M10 6l1.5-1.5a3.5 3.5 0 0 1 5 5L15 11" /><path d="M14 18l-1.5 1.5a3.5 3.5 0 0 1-5-5L9 13" /></>),
  linkedin: svgIcon('0 0 24 24', <><rect height="16" rx="2" width="16" x="4" y="4" /><path d="M8 10.5v6M8 8v0.01" /><path d="M12 16.5v-3.5a2 2 0 0 1 4 0v3.5M12 13v3.5" /></>),
  twitter: svgIcon('0 0 24 24', <path d="M20 6.5c-.7.4-1.4.6-2.2.7a3.4 3.4 0 0 0 1.5-1.9c-.8.5-1.6.8-2.5 1a3.4 3.4 0 0 0-5.8 3.1A9.7 9.7 0 0 1 4 6.1a3.4 3.4 0 0 0 1 4.5c-.6 0-1.2-.2-1.7-.5v.1a3.4 3.4 0 0 0 2.7 3.3 3.4 3.4 0 0 1-1.5.1 3.4 3.4 0 0 0 3.2 2.4A6.9 6.9 0 0 1 3 17.4a9.7 9.7 0 0 0 5.3 1.6c6.3 0 9.8-5.3 9.8-9.8v-.4c.7-.5 1.3-1.1 1.8-1.8z" />),
  whatsapp: svgIcon('0 0 24 24', <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 9.5c0 3.5 2.5 6 6 6l.5-2-2-1-1 1a5 5 0 0 1-2.5-2.5l1-1-1-2z" /></>),
  youtube: svgIcon('0 0 24 24', <><rect height="14" rx="3" width="20" x="2" y="5" /><path d="M10 9l5 3-5 3z" /></>),
}

export function CuriousHubSocialIcon({
  className,
  name,
}: {
  className?: string
  name: string
}) {
  const icon = SOCIAL_ICONS[name.toLowerCase()] ?? SOCIAL_ICONS.link
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
