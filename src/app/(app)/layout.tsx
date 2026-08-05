import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../styles/globals.css'
import '../../themes/ghee-roast/styles/theme.css'
import '../../themes/zuru-zuru/styles/theme.css'
import '../../themes/curious-hub/styles/theme.css'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Courier+Prime:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

