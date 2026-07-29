export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/'
  const normalized = `/${pathname.split('?')[0].split('#')[0].split('/').filter(Boolean).join('/')}`
  return normalized === '/' ? '/' : normalized.replace(/\/$/, '')
}
