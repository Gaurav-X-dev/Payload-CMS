// Pure, framework-free response-classification logic for the custom Admin Forgot Password
// page (src/app/(payload)/admin/forgot/). Kept separate from the React component so it can be
// unit tested without a DOM/testing-library dependency, and so the exact same decision logic
// that ships in the UI is what the tests exercise.
//
// Background: Payload's stock ForgotPasswordForm (@payloadcms/next) never inspects
// response.ok/status — it only checks whether the body parses as JSON — so it always shows the
// generic "Email Sent" screen regardless of the backend result. This project's backend now
// intentionally returns a 400 "Email not found." validation error for unknown/wrong-tenant
// emails (see validateForgotPasswordEligibility in src/collections/Users.ts). This module gives
// the custom UI a way to tell that case apart from success, without ever inventing a new backend
// endpoint — it only classifies the response of the existing, official POST
// /api/users/forgot-password call.

export const FORGOT_PASSWORD_ENDPOINT = '/api/users/forgot-password'

export const EMAIL_NOT_FOUND_MESSAGE = 'Email not found.'
export const GENERIC_ERROR_MESSAGE = 'Unable to process request. Please try again.'

export type ForgotPasswordRequestBody = { email: string }

// The request body is intentionally { email } only — tenant is resolved server-side from the
// trusted request hostname (see resolvePublicTenantID), never submitted by the client.
export const buildForgotPasswordRequestBody = (email: string): ForgotPasswordRequestBody => ({
  email,
})

export type ForgotPasswordOutcome =
  | { kind: 'success' }
  | { field: 'email'; kind: 'field-error'; message: string }
  | { kind: 'generic-error'; message: string }

type PayloadValidationEntry = {
  data?: {
    errors?: Array<{ message?: unknown; path?: unknown }>
  }
}

type PayloadErrorBody = {
  errors?: PayloadValidationEntry[]
}

const isPayloadErrorBody = (value: unknown): value is PayloadErrorBody =>
  typeof value === 'object' && value !== null && 'errors' in value

// Matches the exact shape Payload's routeError/formatErrors produce for a thrown
// ValidationError: { errors: [{ name, message, data: { errors: [{ message, path }] } }] }.
// Deliberately structural/defensive — never assumes the shape is present, never displays the
// server's raw message text back to the user.
export const hasEmailFieldValidationError = (body: unknown): boolean => {
  if (!isPayloadErrorBody(body) || !Array.isArray(body.errors)) return false

  return body.errors.some((entry) => {
    const nested = entry?.data?.errors
    return Array.isArray(nested) && nested.some((fieldError) => fieldError?.path === 'email')
  })
}

export const classifyForgotPasswordResponse = (input: {
  body: unknown
  ok: boolean
  status: number
}): ForgotPasswordOutcome => {
  const { body, ok, status } = input

  if (ok) {
    return { kind: 'success' }
  }

  if (status === 400 && hasEmailFieldValidationError(body)) {
    return { field: 'email', kind: 'field-error', message: EMAIL_NOT_FOUND_MESSAGE }
  }

  // Covers: 400 with an unrecognized/malformed shape, >=500, and any other non-ok status.
  // Never surfaces stack traces, IDs, or raw server JSON — only this fixed, safe message.
  return { kind: 'generic-error', message: GENERIC_ERROR_MESSAGE }
}
