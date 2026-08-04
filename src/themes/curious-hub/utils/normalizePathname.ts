export function normalizePathname(pathname: string): string {
  const path = `/${pathname}`.replace(/\/+/g, '/').replace(/\/$/, '')
  return path === '' ? '/' : path
}
