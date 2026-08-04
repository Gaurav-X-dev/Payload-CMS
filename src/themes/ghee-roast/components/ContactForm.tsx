'use client'

import { FormEvent, useRef, useState } from 'react'
import type { FormFieldData } from '../types'
import { DEFAULT_CONTACT_SUBJECT_OPTIONS } from '../../../validation/contactPage'
import {
  buildGheeRoastFormRequest,
  createSubmissionGuard,
} from '../forms/formRequests'
import styles from './Theme.module.css'

const contactFields = (subjectOptions: Array<{ label: string; value: string }>): FormFieldData[] => [
  { label: 'Full Name', name: 'name', placeholder: 'Enter your name', required: true, type: 'text' },
  { label: 'Email Address', name: 'email', placeholder: 'Enter your email', required: true, type: 'email' },
  { label: 'Phone Number', name: 'phone', placeholder: '10-digit mobile number', type: 'tel' },
  { label: 'Subject', name: 'subject', required: true, type: 'select', options: subjectOptions },
  { label: 'Message', name: 'message', placeholder: 'How can we help you?', required: true, type: 'textarea' },
]

const reservationFields: FormFieldData[] = [
  { label: 'Full Name', name: 'name', placeholder: 'Enter your name', required: true, type: 'text' },
  { label: 'Email Address', name: 'email', placeholder: 'Enter your email', required: true, type: 'email' },
  { label: 'Phone Number', name: 'phone', placeholder: '10-digit mobile number', required: true, type: 'tel' },
  { label: 'Date', name: 'date', required: true, type: 'date' },
  { label: 'Time', name: 'time', required: true, type: 'time' },
  { label: 'Number of Guests', name: 'guests', required: true, type: 'number' },
  { label: 'Notes', name: 'notes', placeholder: 'Dietary needs or special requests', type: 'textarea' },
]

export function ContactForm({
  fields,
  formType = 'contact',
  heading,
  errorMessage = 'We could not submit the form. Please check your details or contact the restaurant directly.',
  subjectOptions = DEFAULT_CONTACT_SUBJECT_OPTIONS.map((option) => ({ ...option })),
  submitLabel = 'Send Message',
  successMessage = 'Thank you. We will be in touch shortly.',
}: {
  fields?: FormFieldData[]
  errorMessage?: string
  formType?: string
  heading?: string | null
  subjectOptions?: Array<{ label: string; value: string }>
  submitLabel?: string
  successMessage?: string
}) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())
  const formFields = fields ?? (formType === 'reservation' ? reservationFields : contactFields(subjectOptions))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    const allowedSubjects = formFields
      .find((field) => field.name === 'subject')
      ?.options?.map((option) => typeof option === 'string' ? option : option.value)
    const requestResult = buildGheeRoastFormRequest(formType, values, allowedSubjects)
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

  return (
    <form className={styles.contactForm} onSubmit={submit}>
      {heading !== null && <h2>{heading || (formType === 'reservation' ? 'Request a Reservation' : formType === 'catering' ? 'Plan Your Event' : 'Send a Message')}</h2>}
      {formFields.map((field) => (
        <div className={!['email', 'phone', 'date', 'time'].includes(field.name) ? styles.fullField : undefined} key={field.name}>
          <label htmlFor={`contact-${field.name}`}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              id={`contact-${field.name}`}
              maxLength={field.name === 'message' ? 5_000 : field.name === 'notes' ? 2_000 : undefined}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select defaultValue="" id={`contact-${field.name}`} name={field.name} required={field.required}>
              <option disabled value="">Select an option</option>
              {field.options?.map((option) => {
                const label = typeof option === 'string' ? option : option.label
                const optionValue = typeof option === 'string' ? option : option.value
                return <option key={optionValue} value={optionValue}>{label}</option>
              })}
            </select>
          ) : (
            <input
              id={`contact-${field.name}`}
              inputMode={field.type === 'tel' || field.type === 'number' ? 'numeric' : undefined}
              max={field.type === 'number' ? 50 : undefined}
              maxLength={field.name === 'email' ? 254 : field.name === 'phone' ? 20 : field.name === 'name' ? 100 : undefined}
              min={field.type === 'number' ? 1 : undefined}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              type={field.type}
            />
          )}
        </div>
      ))}
      <button aria-disabled={submitting} disabled={submitting} type="submit">{submitting ? 'Sending…' : submitLabel}</button>
      {message && <p className={styles.formNotice} data-tone={messageTone} role="status">{message}</p>}
    </form>
  )
}
