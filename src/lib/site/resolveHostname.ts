export function resolveHostname(value: string | null | undefined): string {
  const host = value?.split(',')[0]?.trim().toLowerCase() ?? ''

  if (host.startsWith('[')) {
    return host.slice(1, host.indexOf(']'))
  }

  return host.split(':')[0].replace(/^www\./, '')
}
