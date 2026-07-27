/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import configPromise from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

export const GET = REST_GET(configPromise)
const payloadPost = REST_POST(configPromise)

export const POST: typeof payloadPost = async (request, context) => {
  if (new URL(request.url).pathname.endsWith('/api/users/login')) {
    try {
      const body = await request.clone().json()
      const credentials = [body?.email, body?.password]
      const containsControlCharacters = credentials.some(
        (value) => typeof value === 'string' && /[\u0000-\u001F\u007F]/.test(value),
      )

      if (containsControlCharacters) {
        return Response.json(
          { errors: [{ message: 'Invalid authentication credentials.' }] },
          { status: 400 },
        )
      }
    } catch {
      // Payload handles malformed JSON and returns its standard client error response.
    }
  }

  return payloadPost(request, context)
}
export const DELETE = REST_DELETE(configPromise)
export const PATCH = REST_PATCH(configPromise)
export const OPTIONS = REST_OPTIONS(configPromise)
