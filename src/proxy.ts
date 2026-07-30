import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveLocalSite } from './lib/site/resolveLocalSite'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  const site = resolveLocalSite(request.headers.get('host'))
  if (!site) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-local-site', site.key)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
