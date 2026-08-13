import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../styles/globals.css'
// Per-theme CSS (theme.css) is deliberately NOT imported here — each theme's own layout
// component (GheeRoastLayout.tsx, ZuruZuruLayout.tsx, CuriousHubLayout.tsx) imports its own
// theme.css directly, so a visitor to one tenant only downloads that tenant's theme CSS, not
// all three (see M3 performance audit — this file previously imported all three unconditionally
// for every request regardless of which tenant was being rendered).

export const metadata: Metadata = {
  description: 'A premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.',
  title: {
    default: 'Curious Ladoo — We Build Hospitality That Lasts',
    template: '%s',
  },
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Kept shared: cheap DNS/TLS warmup, harmless and useful regardless of which tenant's
            font <link> ends up being hoisted from its own theme layout (see e.g.
            GheeRoastLayout.tsx) — only the actual per-family stylesheet links are tenant-scoped. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

