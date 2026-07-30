const MAX_HOSTNAME_LENGTH = 253
const MAX_PORT = 65_535

const isValidPort = (value: string | undefined): boolean => {
  if (value === undefined) return true
  if (!/^\d+$/.test(value)) return false

  const port = Number(value)
  return Number.isInteger(port) && port > 0 && port <= MAX_PORT
}

const isValidDNSHostname = (value: string): boolean => {
  if (!value || value.length > MAX_HOSTNAME_LENGTH) return false

  return value.split('.').every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
  )
}

/**
 * Normalize a single HTTP Host value.
 *
 * Host lists belong to forwarding headers and must be validated by a trusted
 * proxy. Accepting the first comma-separated value here would allow an
 * ambiguous or attacker-controlled Host header to select a local tenant.
 */
export function resolveHostname(value: string | null | undefined): string {
  const hostValue = value?.trim().toLowerCase() ?? ''
  if (!hostValue || hostValue.includes(',') || /\s/.test(hostValue)) return ''

  if (hostValue.startsWith('[')) {
    const match = hostValue.match(/^\[([0-9a-f:.]+)\](?::(\d+))?$/)
    if (!match || !match[1]?.includes(':') || !isValidPort(match[2])) return ''

    try {
      new URL(`http://${hostValue}`)
    } catch {
      return ''
    }

    return match[1]
  }

  const separator = hostValue.lastIndexOf(':')
  const hasPort = separator !== -1
  if (hasPort && hostValue.indexOf(':') !== separator) return ''

  const hostnameWithDot = hasPort ? hostValue.slice(0, separator) : hostValue
  const port = hasPort ? hostValue.slice(separator + 1) : undefined
  if (!isValidPort(port)) return ''

  const hostname = hostnameWithDot.replace(/\.$/, '').replace(/^www\./, '')
  return isValidDNSHostname(hostname) ? hostname : ''
}
