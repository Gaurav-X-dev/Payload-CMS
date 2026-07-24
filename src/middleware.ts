import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type TenantConfig = {
  id: string
  slug: string
  name: string
  type: string
  branding: Record<string, string>
  features: Record<string, boolean>
}

// Development-only presentation data. Payload access resolves the authoritative
// tenant from the configured default slug or a verified tenant domain.
const tenantDomainMap: Record<string, TenantConfig> = {
  'localhost:3000': {
    id: '1',
    slug: 'ghee-roast',
    name: 'Ghee Roast',
    type: 'restaurant',
    branding: {
      primaryColor: '#3E5237',
      accentColor: '#C44D18',
      backgroundColor: '#f4efe6',
      headingFont: 'Oswald',
      bodyFont: 'Inter',
      headingTransform: 'uppercase',
      cardRadius: '12px'
    },
    features: {
      enableMenu: true,
      enableBlog: false,
    }
  },
  // We can add mock configurations for zuru-zuru and hospitality here
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Exclude API, Payload Admin, and static assets from tenant resolution
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Determine Tenant
  const hostname = request.headers.get('host') || 'localhost:3000'
  
  let tenantConfig = tenantDomainMap[hostname]

  // Preserve the explicit localhost development fallback without accepting
  // lookalike domains such as "example-localhost.invalid".
  if (hostname === 'localhost' || /^localhost:\d+$/.test(hostname)) {
    tenantConfig = tenantDomainMap['localhost:3000']
  }

  if (!tenantConfig) {
    // No tenant found for domain, could rewrite to a generic 404/landing page
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  // Clone headers and inject tenant config
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-config', JSON.stringify(tenantConfig))

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
