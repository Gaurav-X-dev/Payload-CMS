import assert from 'node:assert/strict'
import test from 'node:test'
import { ContactSubmissions } from '../src/collections/ContactSubmissions.ts'
import { Reservations } from '../src/collections/Reservations.ts'
import { assignTenant } from '../src/hooks/assignTenant.ts'
import {
  configuredContactSubjects,
  validateContactSubmissionSubject,
} from '../src/hooks/validateContactSubmissionSubject.ts'
import {
  buildContactSubmissionRequest,
  buildNewsletterRequest,
  buildReservationRequest,
  CONTACT_SUBMISSIONS_ENDPOINT,
  createSubmissionGuard,
  RESERVATIONS_ENDPOINT,
} from '../src/themes/ghee-roast/forms/formRequests.ts'

type UnknownRecord = Record<string, unknown>

const record = (input: unknown): UnknownRecord | null =>
  input && typeof input === 'object' ? input as UnknownRecord : null

const findField = (fields: unknown[], name: string): UnknownRecord | null => {
  for (const field of fields) {
    const item = record(field)
    if (!item) continue
    if (item.name === name) return item

    const nested = Array.isArray(item.fields) ? item.fields : []
    const nestedMatch = findField(nested, name)
    if (nestedMatch) return nestedMatch

    const tabs = Array.isArray(item.tabs) ? item.tabs : []
    for (const tab of tabs) {
      const tabFields = record(tab)?.fields
      const tabMatch = findField(Array.isArray(tabFields) ? tabFields : [], name)
      if (tabMatch) return tabMatch
    }
  }
  return null
}

const expectFailure = (
  result: ReturnType<typeof buildContactSubmissionRequest>
    | ReturnType<typeof buildReservationRequest>
    | ReturnType<typeof buildNewsletterRequest>,
  message: RegExp,
) => {
  if (result.ok) assert.fail('Expected request validation to fail.')
  assert.match(result.error, message)
}

test('contact request normalizes public fields and excludes protected input', () => {
  const result = buildContactSubmissionRequest({
    email: '  DINER@EXAMPLE.COM ',
    internalNotes: 'must not leave the browser',
    message: '  Please call me about a partnership.  ',
    name: '  Asha   Rao ',
    phone: '+91 (98765) 43210',
    status: 'resolved',
    subject: 'Partnership',
    tenantId: 999,
    type: 'careers',
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.request.endpoint, CONTACT_SUBMISSIONS_ENDPOINT)
  assert.deepEqual(result.request.body, {
    email: 'diner@example.com',
    message: 'Please call me about a partnership.',
    name: 'Asha Rao',
    phone: '9876543210',
    subject: 'Partnership',
    type: 'franchise',
  })
  assert.equal(Object.hasOwn(result.request.body, 'tenantId'), false)
  assert.equal(Object.hasOwn(result.request.body, 'status'), false)
  assert.equal(Object.hasOwn(result.request.body, 'internalNotes'), false)
})

test('contact request rejects missing or malformed required values', () => {
  const valid = {
    email: 'diner@example.com',
    message: 'Please send menu details.',
    name: 'Asha Rao',
    subject: 'General Enquiry',
  }
  const cases = [
    [{ ...valid, name: '' }, /Enter a name/],
    [{ ...valid, email: 'not-an-email' }, /valid email address/],
    [{ ...valid, phone: '1234567890' }, /valid 10-digit Indian mobile/],
    [{ ...valid, message: '' }, /Enter a message/],
    [{ ...valid, subject: '' }, /enquiry subject/],
    [{ ...valid, subject: 'Not configured' }, /available enquiry subjects/],
    [{ ...valid, message: 'x'.repeat(5_001) }, /must not exceed 5000/],
  ] as const

  for (const [values, expected] of cases) {
    expectFailure(buildContactSubmissionRequest(values), expected)
  }

  const withoutPhone = buildContactSubmissionRequest(valid)
  assert.equal(withoutPhone.ok, true)
  if (withoutPhone.ok) {
    assert.equal(Object.hasOwn(withoutPhone.request.body, 'phone'), false)
  }
})

test('catering form deterministically routes to Contact Submissions as catering', () => {
  const result = buildContactSubmissionRequest({
    email: 'events@example.com',
    message: 'Please share catering availability.',
    name: 'Event Planner',
    phone: '9876543210',
    subject: 'General Enquiry',
  }, 'catering')

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.request.endpoint, CONTACT_SUBMISSIONS_ENDPOINT)
  assert.equal(result.request.body.type, 'catering')
})

test('reservation request validates, normalizes, and whitelists its public payload', () => {
  const result = buildReservationRequest({
    bookingSource: 'staff-console',
    cancellationReason: 'protected',
    date: '2026-08-15',
    email: ' GUEST@EXAMPLE.COM ',
    guests: '4',
    internalNotes: 'protected',
    name: '  Ravi   Kumar ',
    notes: '  Window table, if available. ',
    notificationsSent: true,
    phone: '91 98765 43210',
    reminderStatus: 'sent',
    status: 'confirmed',
    tableNumber: 'A1',
    tenantId: 999,
    time: '19:30',
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.request.endpoint, RESERVATIONS_ENDPOINT)
  assert.deepEqual(result.request.body, {
    customerName: 'Ravi Kumar',
    date: '2026-08-15',
    email: 'guest@example.com',
    guests: 4,
    notes: 'Window table, if available.',
    phone: '9876543210',
    time: '19:30',
  })
  for (const protectedField of [
    'bookingSource',
    'cancellationReason',
    'internalNotes',
    'notificationsSent',
    'reminderStatus',
    'status',
    'tableNumber',
    'tenantId',
  ]) {
    assert.equal(Object.hasOwn(result.request.body, protectedField), false)
  }
})

test('reservation request rejects invalid required fields and bounds', () => {
  const valid = {
    date: '2026-08-15',
    email: 'guest@example.com',
    guests: '4',
    name: 'Ravi Kumar',
    phone: '9876543210',
    time: '19:30',
  }
  const cases = [
    [{ ...valid, email: 'guest' }, /valid email address/],
    [{ ...valid, phone: '5876543210' }, /valid 10-digit Indian mobile/],
    [{ ...valid, date: '2026-02-31' }, /valid reservation date/],
    [{ ...valid, time: '25:90' }, /valid reservation time/],
    [{ ...valid, guests: '0' }, /between 1 and 50/],
    [{ ...valid, guests: '51' }, /between 1 and 50/],
    [{ ...valid, guests: '2.5' }, /whole number/],
    [{ ...valid, notes: 'x'.repeat(2_001) }, /must not exceed 2000/],
  ] as const

  for (const [values, expected] of cases) {
    expectFailure(buildReservationRequest(values), expected)
  }
})

test('newsletter honestly creates a general Contact Submission and rejects invalid email', () => {
  const result = buildNewsletterRequest({
    email: ' SUBSCRIBER@EXAMPLE.COM ',
    status: 'resolved',
    tenantId: 999,
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.request.endpoint, CONTACT_SUBMISSIONS_ENDPOINT)
  assert.deepEqual(result.request.body, {
    email: 'subscriber@example.com',
    message: 'Newsletter signup request from the website.',
    name: 'Newsletter Subscriber',
    subject: 'Newsletter Signup',
    type: 'general',
  })
  assert.equal(Object.hasOwn(result.request.body, 'tenantId'), false)
  expectFailure(buildNewsletterRequest({ email: 'invalid' }), /valid email address/)
})

test('submission guard blocks repeated requests until the first request finishes', () => {
  const guard = createSubmissionGuard()
  assert.equal(guard.isActive(), false)
  assert.equal(guard.begin(), true)
  assert.equal(guard.isActive(), true)
  assert.equal(guard.begin(), false)
  guard.finish()
  assert.equal(guard.isActive(), false)
  assert.equal(guard.begin(), true)
})

test('crafted Contact subjects are checked against published CMS options before storage', async () => {
  const pages = [{
    layout: [{
      blockType: 'formBlock',
      enabled: true,
      subjectOptions: [{ value: 'Order Enquiry' }, { value: 'Feedback' }],
    }],
  }]
  assert.deepEqual(configuredContactSubjects(pages), ['Order Enquiry', 'Feedback'])

  const req = {
    payload: { find: async () => ({ docs: pages }) },
  }
  const accepted = await validateContactSubmissionSubject({
    data: { subject: ' Feedback ', tenantId: 41 },
    operation: 'create',
    req,
  } as never)
  assert.equal(record(accepted)?.subject, 'Feedback')
  await assert.rejects(
    () => validateContactSubmissionSubject({
      data: { subject: 'Crafted Subject', tenantId: 41 },
      operation: 'create',
      req,
    } as never),
    (error: unknown) => {
      const validationError = error as { data?: { errors?: Array<{ message?: string }> } }
      assert.match(String(validationError.data?.errors?.[0]?.message), /configured enquiry subjects/)
      return true
    },
  )
})

test('Payload form collections keep backend normalization and validation constraints', async () => {
  const contactPhone = findField(ContactSubmissions.fields, 'phone')
  const contactMessage = findField(ContactSubmissions.fields, 'message')
  const contactSubject = findField(ContactSubmissions.fields, 'subject')
  const reservationGuests = findField(Reservations.fields, 'guests')
  const reservationPhone = findField(Reservations.fields, 'phone')
  const reservationNotes = findField(Reservations.fields, 'notes')

  assert.ok(contactPhone)
  assert.ok(contactMessage)
  assert.ok(contactSubject)
  assert.ok(reservationGuests)
  assert.ok(reservationPhone)
  assert.ok(reservationNotes)

  const phoneHooks = record(contactPhone.hooks)?.beforeValidate
  assert.ok(Array.isArray(phoneHooks))
  const normalizePhone = phoneHooks[0]
  assert.equal(typeof normalizePhone, 'function')
  assert.equal(
    await (normalizePhone as (args: unknown) => unknown)({ value: '+91 98765 43210' }),
    '9876543210',
  )

  const contactPhoneValidator = contactPhone.validate as (value: unknown) => true | string
  const reservationPhoneValidator = reservationPhone.validate as (value: unknown) => true | string
  const guestValidator = reservationGuests.validate as (value: unknown) => true | string
  assert.equal(contactPhoneValidator(''), true)
  assert.match(String(contactPhoneValidator('1234567890')), /valid 10-digit Indian mobile/)
  assert.match(String(reservationPhoneValidator('')), /valid 10-digit Indian mobile/)
  assert.equal(guestValidator(4), true)
  assert.match(String(guestValidator(51)), /between 1 and 50/)
  assert.equal(contactMessage.maxLength, 5_000)
  assert.equal(contactSubject.maxLength, 80)
  assert.equal(reservationNotes.maxLength, 2_000)
})

test('Payload collections keep public create open while staff-only fields reject public control', async () => {
  const publicArgs = { req: { user: null } }
  const memberArgs = { req: { user: { roles: ['tenant_member'] } } }
  const adminArgs = { req: { user: { roles: ['tenant_admin'] } } }
  const superAdminArgs = { req: { user: { roles: ['super_admin'] } } }

  const contactCreate = ContactSubmissions.access?.create
  const reservationCreate = Reservations.access?.create
  assert.equal(typeof contactCreate, 'function')
  assert.equal(typeof reservationCreate, 'function')
  assert.equal(
    await (contactCreate as (args: unknown) => boolean | Promise<boolean>)(publicArgs),
    true,
  )
  assert.equal(
    await (reservationCreate as (args: unknown) => boolean | Promise<boolean>)(publicArgs),
    true,
  )

  const protectedFields = [
    findField(ContactSubmissions.fields, 'status'),
    ...[
      'bookingSource',
      'cancellationReason',
      'internalNotes',
      'notificationsSent',
      'reminderStatus',
      'status',
      'tableNumber',
    ].map((name) => findField(Reservations.fields, name)),
  ]
  for (const field of protectedFields) {
    assert.ok(field)
    const access = record(field.access)
    const create = access?.create
    const update = access?.update
    assert.equal(typeof create, 'function')
    assert.equal(typeof update, 'function')
    const createAccess = create as (args: unknown) => boolean | Promise<boolean>
    const updateAccess = update as (args: unknown) => boolean | Promise<boolean>
    assert.equal(await createAccess(publicArgs), false)
    assert.equal(await createAccess(memberArgs), false)
    assert.equal(await createAccess(adminArgs), true)
    assert.equal(await createAccess(superAdminArgs), true)
    assert.equal(await updateAccess(publicArgs), false)
  }

  assert.equal(findField(Reservations.fields, 'bookingSource')?.defaultValue, 'website')
  assert.equal(findField(ContactSubmissions.fields, 'status')?.defaultValue, 'new')
  assert.equal(findField(Reservations.fields, 'status')?.defaultValue, 'pending')
})

const publicRequest = ({
  host,
  tenantID,
}: {
  host: string
  tenantID: number
}) => {
  const calls: UnknownRecord[] = []
  return {
    calls,
    req: {
      context: {},
      headers: new Headers({ host }),
      payload: {
        find: async (args: UnknownRecord) => {
          calls.push(args)
          return { docs: [{ id: tenantID }] }
        },
      },
      user: null,
    },
  }
}

test('public assignment derives the tenant from hostname when the client omits tenantId', async () => {
  for (const host of [
    'ghee-roast.localhost:3000',
    'www.ghee-roast.localhost:3000',
    'ghee-roast.local:3000',
  ]) {
    const { calls, req } = publicRequest({ host, tenantID: 41 })
    const assigned = await assignTenant({
      data: { name: 'Asha Rao' },
      operation: 'create',
      req,
    } as never)

    assert.equal(record(assigned)?.tenantId, 41)
    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0], {
      collection: 'tenants',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { slug: { equals: 'ghee-roast' } },
          { isActive: { equals: true } },
        ],
      },
    })
  }
})

test('public assignment rejects a client tenantId that does not match the hostname', async () => {
  const { req } = publicRequest({
    host: 'ghee-roast.localhost:3000',
    tenantID: 41,
  })

  await assert.rejects(
    () => assignTenant({
      data: { name: 'Asha Rao', tenantId: 99 },
      operation: 'create',
      req,
    } as never),
    (error: unknown) => {
      const validationError = error as {
        data?: { errors?: Array<{ message?: string; path?: string }> }
      }
      assert.deepEqual(validationError.data?.errors, [{
        message: 'The submitted tenant does not match the public site.',
        path: 'tenantId',
      }])
      return true
    },
  )
})
