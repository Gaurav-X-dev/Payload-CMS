import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  buildForgotPasswordRequestBody,
  classifyForgotPasswordResponse,
  EMAIL_NOT_FOUND_MESSAGE,
  FORGOT_PASSWORD_ENDPOINT,
  GENERIC_ERROR_MESSAGE,
  hasEmailFieldValidationError,
} from '../../src/lib/admin/forgotPassword.ts'

// Pure-logic tests for the custom /admin/forgot Admin UI response handling. No DB, no live
// server: classifyForgotPasswordResponse is the exact function the real ForgotPasswordCard
// component calls, so these tests exercise the real decision logic, not a reimplementation of
// it. The mock response bodies below mirror the real wire shape Payload's own
// payload/dist/utilities/formatErrors.js produces for a thrown ValidationError (confirmed by
// reading that source directly): { errors: [{ name, message, data: { errors: [{ message, path }] } }] }.

// Mirrors the real body a POST /api/users/forgot-password returns for an unknown/wrong-tenant
// email, thrown by validateForgotPasswordEligibility in src/collections/Users.ts.
const realEmailNotFoundBody = {
  errors: [
    {
      name: 'ValidationError',
      message: 'The following field is invalid: email',
      data: {
        errors: [{ message: 'Email not found.', path: 'email' }],
      },
    },
  ],
}

// Mirrors a validation failure NOT related to the email eligibility check (e.g. a malformed
// payload rejected before the eligibility hook even runs) — must NOT be treated as "email not
// found".
const unrelatedValidationBody = {
  errors: [
    {
      name: 'ValidationError',
      message: 'The following field is invalid: someOtherField',
      data: {
        errors: [{ message: 'This field is required.', path: 'someOtherField' }],
      },
    },
  ],
}

// Mirrors what routeError.js/formatErrors.js produce for a genuine 500 (isErrorPublic is false
// for internal errors by default, so the real message is replaced server-side already) — but we
// still must never forward whatever text IS present, only ever the fixed safe string.
const real500Body = {
  errors: [{ message: 'Something went wrong.' }],
}

describe('Forgot Password Admin UI — response classification (pure, no DB, no live server)', () => {
  test('1. a 400 with an email-path validation error classifies as "Email not found."', () => {
    const outcome = classifyForgotPasswordResponse({
      body: realEmailNotFoundBody,
      ok: false,
      status: 400,
    })

    assert.equal(outcome.kind, 'field-error')
    assert.equal((outcome as { message: string }).message, 'Email not found.')
    assert.equal((outcome as { message: string }).message, EMAIL_NOT_FOUND_MESSAGE)
  })

  test('2. a 400 email-path validation error never classifies as success (success screen not shown)', () => {
    const outcome = classifyForgotPasswordResponse({
      body: realEmailNotFoundBody,
      ok: false,
      status: 400,
    })

    assert.notEqual(outcome.kind, 'success')
  })

  test('3. a 200 response always classifies as success, regardless of body content', () => {
    const withBody = classifyForgotPasswordResponse({
      body: { message: 'success' },
      ok: true,
      status: 200,
    })
    const withEmptyBody = classifyForgotPasswordResponse({ body: null, ok: true, status: 200 })

    assert.equal(withBody.kind, 'success')
    assert.equal(withEmptyBody.kind, 'success')
  })

  test('4. a 200 success outcome is the ONLY outcome kind that would trigger the success screen', () => {
    // ForgotPasswordCard only calls setHasSubmitted(true) when outcome.kind === 'success' —
    // this asserts that contract directly against the shared classifier.
    const outcome = classifyForgotPasswordResponse({ body: null, ok: true, status: 200 })
    const wouldShowSuccessScreen = outcome.kind === 'success'

    assert.equal(wouldShowSuccessScreen, true)
  })

  test('5. a 500 response always classifies as a generic, safe error — never the server text', () => {
    const outcome = classifyForgotPasswordResponse({ body: real500Body, ok: false, status: 500 })

    assert.equal(outcome.kind, 'generic-error')
    assert.equal((outcome as { message: string }).message, GENERIC_ERROR_MESSAGE)
    assert.notEqual((outcome as { message: string }).message, 'Something went wrong.')
  })

  test('6. malformed/unexpected error response shapes classify as a generic, safe error', () => {
    const cases: unknown[] = [
      null,
      undefined,
      'not an object',
      42,
      [],
      {},
      { errors: 'not an array' },
      { errors: [null] },
      { errors: [{}] },
      unrelatedValidationBody,
    ]

    for (const body of cases) {
      const outcome = classifyForgotPasswordResponse({ body, ok: false, status: 400 })
      assert.equal(outcome.kind, 'generic-error', `expected generic-error for body: ${JSON.stringify(body)}`)
      assert.equal((outcome as { message: string }).message, GENERIC_ERROR_MESSAGE)
    }
  })

  test('7. the request body sent to the backend contains only email — tenantId is never client-submitted', () => {
    const body = buildForgotPasswordRequestBody('someone@example.com')

    assert.deepEqual(Object.keys(body), ['email'])
    assert.equal(body.email, 'someone@example.com')

    const serialized = JSON.stringify(body)
    assert.equal(/tenant/i.test(serialized), false)
  })

  test('8. the request targets the existing official Payload endpoint, not a new custom one', () => {
    assert.equal(FORGOT_PASSWORD_ENDPOINT, '/api/users/forgot-password')
  })

  test('9. no internal error details (raw server message, JSON, stack) are ever surfaced to the user', () => {
    const sensitiveServerBody = {
      errors: [
        {
          name: 'DatabaseError',
          message: 'connection to 10.0.0.5:5432 failed for tenant_id=42, user_id=1337',
          data: { stack: 'at Pool.query (pg/lib/pool.js:214:11)' },
        },
      ],
    }

    const outcome = classifyForgotPasswordResponse({
      body: sensitiveServerBody,
      ok: false,
      status: 500,
    })

    assert.equal(outcome.kind, 'generic-error')
    const displayedMessage = (outcome as { message: string }).message
    assert.equal(displayedMessage, GENERIC_ERROR_MESSAGE)
    assert.equal(/10\.0\.0\.5|tenant_id|user_id|pg\/lib|Pool\.query/i.test(displayedMessage), false)
  })

  test('hasEmailFieldValidationError correctly distinguishes email-path errors from other fields', () => {
    assert.equal(hasEmailFieldValidationError(realEmailNotFoundBody), true)
    assert.equal(hasEmailFieldValidationError(unrelatedValidationBody), false)
    assert.equal(hasEmailFieldValidationError(real500Body), false)
    assert.equal(hasEmailFieldValidationError(null), false)
  })
})
