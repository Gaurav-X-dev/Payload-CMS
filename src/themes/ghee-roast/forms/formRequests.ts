import {
  normalizeEmail,
  normalizeIndianMobile,
  normalizeName,
  validateEmail,
  validateFiniteInteger,
  validateIndianMobile,
  validateName,
} from '../../../validation/shared'
import { DEFAULT_CONTACT_SUBJECT_OPTIONS } from '../../../validation/contactPage'

export const CONTACT_SUBMISSIONS_ENDPOINT = '/api/contact-submissions'
export const RESERVATIONS_ENDPOINT = '/api/reservations'

type FormValues = Readonly<Record<string, unknown>>

type ContactSubmissionType = 'catering' | 'franchise' | 'general'

export type ContactSubmissionRequestBody = {
  email: string
  message: string
  name: string
  phone?: string
  subject: string
  type: ContactSubmissionType
}

export type ReservationRequestBody = {
  customerName: string
  date: string
  email: string
  guests: number
  notes: string
  phone: string
  time: string
}

export type GheeRoastFormRequest =
  | {
      body: ContactSubmissionRequestBody
      endpoint: typeof CONTACT_SUBMISSIONS_ENDPOINT
    }
  | {
      body: ReservationRequestBody
      endpoint: typeof RESERVATIONS_ENDPOINT
    }

export type FormRequestResult<TRequest extends GheeRoastFormRequest = GheeRoastFormRequest> =
  | { error: string; ok: false }
  | { ok: true; request: TRequest }

const value = (values: FormValues, key: string): string =>
  typeof values[key] === 'string' ? values[key].trim() : ''

const failure = (error: string): { error: string; ok: false } => ({ error, ok: false })

const validateRequiredText = (
  input: string,
  label: string,
  maxLength: number,
): true | string => {
  if (!input) return `Enter ${label}.`
  if (input.length > maxLength) return `${label} must not exceed ${maxLength} characters.`
  return true
}

const isCalendarDate = (input: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
  )
}

export const resolveContactSubmissionType = (
  formType: string,
  subject: string,
): ContactSubmissionType => {
  if (formType === 'catering' || subject.toLowerCase().includes('catering')) return 'catering'
  if (subject.toLowerCase().includes('partnership')) return 'franchise'
  return 'general'
}

export function buildContactSubmissionRequest(
  values: FormValues,
  formType = 'contact',
  allowedSubjects: readonly string[] = DEFAULT_CONTACT_SUBJECT_OPTIONS.map((option) => option.value),
): FormRequestResult<{
  body: ContactSubmissionRequestBody
  endpoint: typeof CONTACT_SUBMISSIONS_ENDPOINT
}> {
  const name = normalizeName(value(values, 'name'))
  const email = normalizeEmail(value(values, 'email'))
  const rawPhone = value(values, 'phone')
  const phone = normalizeIndianMobile(rawPhone)
  const message = value(values, 'message')
  const subject = value(values, 'subject')

  const nameValidation = validateName(name)
  if (nameValidation !== true) return failure(nameValidation)

  const emailValidation = validateEmail(email)
  if (emailValidation !== true) return failure(emailValidation)

  const phoneValidation = validateIndianMobile(phone, { required: false })
  if (phoneValidation !== true) return failure(phoneValidation)

  const messageValidation = validateRequiredText(message, 'a message', 5_000)
  if (messageValidation !== true) return failure(messageValidation)

  const subjectValidation = validateRequiredText(subject, 'an enquiry subject', 80)
  if (subjectValidation !== true) return failure(subjectValidation)
  if (!allowedSubjects.some((allowed) => allowed.toLocaleLowerCase('en-IN') === subject.toLocaleLowerCase('en-IN'))) {
    return failure('Choose one of the available enquiry subjects.')
  }

  return {
    ok: true,
    request: {
      body: {
        email,
        message,
        name,
        ...(phone ? { phone } : {}),
        subject,
        type: resolveContactSubmissionType(formType, value(values, 'subject')),
      },
      endpoint: CONTACT_SUBMISSIONS_ENDPOINT,
    },
  }
}

export function buildReservationRequest(
  values: FormValues,
): FormRequestResult<{
  body: ReservationRequestBody
  endpoint: typeof RESERVATIONS_ENDPOINT
}> {
  const customerName = normalizeName(value(values, 'name'))
  const email = normalizeEmail(value(values, 'email'))
  const phone = normalizeIndianMobile(value(values, 'phone'))
  const date = value(values, 'date')
  const time = value(values, 'time')
  const guests = Number(value(values, 'guests'))
  const notes = value(values, 'notes')

  const nameValidation = validateName(customerName)
  if (nameValidation !== true) return failure(nameValidation)

  const emailValidation = validateEmail(email)
  if (emailValidation !== true) return failure(emailValidation)

  const phoneValidation = validateIndianMobile(phone)
  if (phoneValidation !== true) return failure(phoneValidation)

  if (!isCalendarDate(date)) {
    return failure('Select a valid reservation date.')
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return failure('Select a valid reservation time.')
  }

  const guestValidation = validateFiniteInteger(guests, { min: 1, max: 50 })
  if (guestValidation !== true) return failure(guestValidation)

  const notesValidation = notes
    ? validateRequiredText(notes, 'reservation notes', 2_000)
    : true
  if (notesValidation !== true) return failure(notesValidation)

  return {
    ok: true,
    request: {
      body: {
        customerName,
        date,
        email,
        guests,
        notes,
        phone,
        time,
      },
      endpoint: RESERVATIONS_ENDPOINT,
    },
  }
}

export function buildGheeRoastFormRequest(
  formType: string,
  values: FormValues,
  allowedSubjects?: readonly string[],
): FormRequestResult {
  return formType === 'reservation'
    ? buildReservationRequest(values)
    : buildContactSubmissionRequest(values, formType, allowedSubjects)
}

export function buildNewsletterRequest(
  values: FormValues,
): FormRequestResult<{
  body: ContactSubmissionRequestBody
  endpoint: typeof CONTACT_SUBMISSIONS_ENDPOINT
}> {
  const email = normalizeEmail(value(values, 'email'))
  const emailValidation = validateEmail(email)
  if (emailValidation !== true) return failure(emailValidation)

  return {
    ok: true,
    request: {
      body: {
        email,
        message: 'Newsletter signup request from the website.',
        name: 'Newsletter Subscriber',
        subject: 'Newsletter Signup',
        type: 'general',
      },
      endpoint: CONTACT_SUBMISSIONS_ENDPOINT,
    },
  }
}

export type SubmissionGuard = {
  begin: () => boolean
  finish: () => void
  isActive: () => boolean
}

export const createSubmissionGuard = (): SubmissionGuard => {
  let active = false
  return {
    begin: () => {
      if (active) return false
      active = true
      return true
    },
    finish: () => {
      active = false
    },
    isActive: () => active,
  }
}
