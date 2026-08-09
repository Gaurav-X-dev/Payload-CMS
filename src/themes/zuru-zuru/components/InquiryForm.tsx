'use client'

import { FormEvent, useRef, useState } from 'react'
import {
  buildContactSubmissionRequest,
  createSubmissionGuard,
} from '../../ghee-roast/forms/formRequests'
import { FormField } from './Shared'

export type InquiryFieldConfig = {
  label: string
  name: string
  options?: string[]
  placeholder?: string
  type?: string
}

const NON_MESSAGE_FIELDS = new Set(['email', 'first', 'firstName', 'last', 'lastName', 'name', 'phone'])

/**
 * A single reusable submission component for every Zuru Zuru page whose original form has no
 * visible Subject selector and asks for fields `buildContactSubmissionRequest` doesn't natively
 * carry (event date, guest count, venue, position, company, city, investment capacity, ...).
 * Reuses the same shared, tenant-agnostic infrastructure the Contact page's form uses
 * (`buildContactSubmissionRequest`, `createSubmissionGuard`, the public `/api/contact-submissions`
 * endpoint) — every non-contact field is composed into the submission's `message` body as clearly
 * labeled lines, so no information from the original static form is lost. `subject` is fixed (not
 * user-facing, matching the original design) and must already be one of the tenant's configured
 * enquiry subjects (see the Milestone Z7 report for which page configures which subject).
 */
export function InquiryForm({
  errorMessage = 'We could not submit the form. Please check your details or contact the restaurant directly.',
  fields,
  formType,
  submitLabel,
  subject,
  successMessage = 'Thank you. We will be in touch shortly.',
}: {
  errorMessage?: string
  fields: InquiryFieldConfig[]
  formType: string
  submitLabel: string
  subject: string
  successMessage?: string
}) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const raw = Object.fromEntries(new FormData(form).entries())
    const text = (value: FormDataEntryValue | undefined): string => (typeof value === 'string' ? value.trim() : '')

    const name = text(raw.name) || [text(raw.firstName), text(raw.lastName)].filter(Boolean).join(' ')
      || [text(raw.first), text(raw.last)].filter(Boolean).join(' ')

    const composedLines: string[] = []
    for (const field of fields) {
      if (NON_MESSAGE_FIELDS.has(field.name)) continue
      const value = text(raw[field.name])
      if (value) composedLines.push(`${field.label}: ${value}`)
    }

    const values = {
      ...raw,
      email: text(raw.email),
      message: composedLines.join('\n'),
      name,
      phone: text(raw.phone),
      subject,
    }

    const requestResult = buildContactSubmissionRequest(values, formType, [subject])
    if (!requestResult.ok) {
      submissionGuard.current.finish()
      setMessageTone('error')
      setMessage(requestResult.error)
      return
    }

    setSubmitting(true)
    setMessageTone(null)
    setMessage('')
    try {
      const response = await fetch(requestResult.request.endpoint, {
        body: JSON.stringify(requestResult.request.body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Submission rejected')
      form.reset()
      setMessageTone('success')
      setMessage(successMessage)
    } catch {
      setMessageTone('error')
      setMessage(errorMessage)
    } finally {
      submissionGuard.current.finish()
      setSubmitting(false)
    }
  }

  if (messageTone === 'success') {
    return (
      <div className="zz-form-success" role="status">
        <h3>Thank you for reaching out!</h3>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <form className="zz-form-grid" noValidate onSubmit={submit}>
      {fields.map((field) => (
        <FormField key={field.name} label={field.label} name={field.name} options={field.options} placeholder={field.placeholder} type={field.type} />
      ))}
      <button className="zz-btn zz-btn-primary zz-form-submit" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : submitLabel}
      </button>
      {messageTone === 'error' && message && (
        <p className="zz-form-error" role="alert">{message}</p>
      )}
    </form>
  )
}
