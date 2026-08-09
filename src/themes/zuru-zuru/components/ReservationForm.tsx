'use client'

import { FormEvent, useRef, useState } from 'react'
import { buildReservationRequest, createSubmissionGuard } from '../../ghee-roast/forms/formRequests'
import { FormField } from './Shared'

const GUEST_OPTIONS = [
  { label: '1 Person', value: '1' },
  { label: '2 People', value: '2' },
  { label: '3 People', value: '3' },
  { label: '4 People', value: '4' },
  { label: '5 People', value: '5' },
  { label: '6 People', value: '6' },
  { label: '7 People', value: '7' },
  { label: '8+ People (Contact Us)', value: '8' },
]

const TIME_OPTIONS = [
  { label: '12:00 PM', value: '12:00' },
  { label: '12:30 PM', value: '12:30' },
  { label: '1:00 PM', value: '13:00' },
  { label: '1:30 PM', value: '13:30' },
  { label: '2:00 PM', value: '14:00' },
  { label: '6:30 PM', value: '18:30' },
  { label: '7:00 PM', value: '19:00' },
  { label: '7:30 PM', value: '19:30' },
  { label: '8:00 PM', value: '20:00' },
  { label: '8:30 PM', value: '20:30' },
  { label: '9:00 PM', value: '21:00' },
  { label: '9:30 PM', value: '21:30' },
]

// `FormField`'s <select> always submits its visible label as the value (no separate value
// attribute), so the 12-hour time / "N People" labels shown to guests are translated back to the
// 24-hour time / numeric guest count `buildReservationRequest` and the Reservations collection
// require, via these reverse-lookup tables — no change needed to the shared FormField component.
const GUEST_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(GUEST_OPTIONS.map((option) => [option.label, option.value]))
const TIME_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(TIME_OPTIONS.map((option) => [option.label, option.value]))

/**
 * Dedicated to `/api/reservations` (the `Reservations` collection), distinct from every other
 * Zuru Zuru form on this page and unrelated to `InquiryForm`/ContactSubmissions — reuses the same
 * shared `buildReservationRequest` builder and tenant-spoofing protection Ghee Roast's own
 * reservation form already relies on (both go through the same host-derived `tenantField()`).
 */
export function ReservationForm() {
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

    // buildReservationRequest (shared with Ghee Roast's own reservation form) has no
    // specialOccasion field, so rather than extending that shared module the guest's occasion
    // selection is folded into `notes` as a labeled line — see the Milestone Z7 report.
    const occasionLabel = text(raw.occasion)
    const notes = [occasionLabel && `Occasion: ${occasionLabel}`, text(raw.requests)].filter(Boolean).join('\n')
    const guests = GUEST_LABEL_TO_VALUE[text(raw.guests)] ?? text(raw.guests)
    const time = TIME_LABEL_TO_VALUE[text(raw.time)] ?? text(raw.time)

    const requestResult = buildReservationRequest({ ...raw, guests, notes, time })
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
      setMessage('Thank you. Your reservation request has been received — we will confirm shortly.')
    } catch {
      setMessageTone('error')
      setMessage('We could not submit your reservation. Please check your details or call the restaurant directly.')
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
      <FormField label="Full Name" name="name" />
      <FormField label="Phone Number" name="phone" type="tel" />
      <FormField label="Email Address" name="email" type="email" />
      <FormField label="Number of Guests" name="guests" options={GUEST_OPTIONS.map((option) => option.label)} type="select" />
      <FormField label="Occasion (Optional)" name="occasion" options={['Standard Dining', 'Birthday', 'Anniversary', 'Business Meal', 'Date Night']} type="select" />
      <FormField label="Date" name="date" type="date" />
      <FormField label="Time" name="time" options={TIME_OPTIONS.map((option) => option.label)} type="select" />
      <FormField label="Special Requests (Optional)" name="requests" type="textarea" />
      <button className="zz-btn zz-btn-primary zz-form-submit" disabled={submitting} type="submit">
        {submitting ? 'Sending…' : 'Confirm Reservation'}
      </button>
      {messageTone === 'error' && message && (
        <p className="zz-form-error" role="alert">{message}</p>
      )}
    </form>
  )
}
