import type { BasePayload } from 'payload'

type ReleasableClient = {
  release?: (destroy?: boolean) => void
}

type PayloadPool = {
  _clients?: ReleasableClient[]
  _idle?: Array<{ client: ReleasableClient }>
  end: () => Promise<void>
  ended?: boolean
}

/**
 * Payload 3.86's Postgres connector checks out a bootstrap client without
 * releasing it. Release only that still-checked-out client after Payload has
 * finished all work, then close the pool normally.
 */
export async function shutdownPayload(payload: BasePayload): Promise<{
  releasedBootstrapClients: number
}> {
  await payload.destroy()

  const pool = (payload.db as unknown as { pool?: PayloadPool }).pool
  if (!pool || pool.ended) {
    return { releasedBootstrapClients: 0 }
  }

  const idleClients = new Set(
    (pool._idle ?? []).map((entry) => entry.client),
  )
  let releasedBootstrapClients = 0

  for (const client of pool._clients ?? []) {
    if (!idleClients.has(client) && typeof client.release === 'function') {
      client.release()
      releasedBootstrapClients += 1
    }
  }

  await pool.end()
  return { releasedBootstrapClients }
}
