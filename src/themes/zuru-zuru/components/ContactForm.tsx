'use client'

import { FormEvent, useRef, useState } from 'react'
import {
  buildContactSubmissionRequest,
  createSubmissionGuard,
} from '../../ghee-roast/forms/formRequests'
import { FormField } from './Shared'
import type { ZuruZuruFormBlockData } from '../mappers/dynamicTypes'

/**
 * Zuru Zuru's own presentation (exact original markup/classes: `zz-form-grid`, the shared
 * `FormField` component, `zz-btn zz-btn-primary`), wired to the same shared, tenant-agnostic form
 * infrastructure Curious Ladoo's own ContactForm already uses (`buildContactSubmissionRequest`,
 * `createSubmissionGuard`) — validation/normalization and the public `/api/contact-submissions`
 * endpoint are identical across themes; only the JSX differs, preserving theme isolation.
 */
export function ContactForm({ block }: { block: ZuruZuruFormBlockData }) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    const allowedSubjects = block.subjectOptions.map((option) => option.value)
    const requestResult = buildContactSubmissionRequest(values, block.formType, allowedSubjects)
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
      setMessage(block.successMessage)
    } catch {
      setMessageTone('error')
      setMessage(block.errorMessage)
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
      <FormField label="Name" name="name" />
      <FormField label="Email" name="email" type="email" />
      <FormField
        label="Subject"
        name="subject"
        options={block.subjectOptions.map((option) => option.label)}
        placeholder="Select a subject"
        type="select"
      />
      <FormField label="Message" name="message" type="textarea" />
      <button className="zz-btn zz-btn-primary zz-form-submit" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : block.submitLabel}
      </button>
      {messageTone === 'error' && message && (
        <p className="zz-form-error" role="alert">{message}</p>
      )}
    </form>
  )
}
