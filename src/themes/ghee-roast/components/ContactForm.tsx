'use client'

import { FormEvent, useRef, useState } from 'react'
import type { FormFieldData } from '../types'
import {
  buildGheeRoastFormRequest,
  createSubmissionGuard,
} from '../forms/formRequests'
import styles from './Theme.module.css'

const contactFields: FormFieldData[] = [
  { label: 'Full Name', name: 'name', placeholder: 'Enter your name', required: true, type: 'text' },
  { label: 'Email Address', name: 'email', placeholder: 'Enter your email', required: true, type: 'email' },
  { label: 'Phone Number', name: 'phone', placeholder: '10-digit mobile number', type: 'tel' },
  { label: 'Subject', name: 'subject', required: true, type: 'select', options: ['General Enquiry', 'Catering Request', 'Feedback', 'Partnership'] },
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
  submitLabel = 'Send Message',
  successMessage = 'Thank you. We will be in touch shortly.',
}: {
  fields?: FormFieldData[]
  formType?: string
  submitLabel?: string
  successMessage?: string
}) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())
  const formFields = fields ?? (formType === 'reservation' ? reservationFields : contactFields)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    const requestResult = buildGheeRoastFormRequest(formType, values)
    if (!requestResult.ok) {
      submissionGuard.current.finish()
      setMessage(requestResult.error)
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const response = await fetch(requestResult.request.endpoint, {
        body: JSON.stringify(requestResult.request.body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error('Submission rejected')
      form.reset()
      setMessage(successMessage)
    } catch {
      setMessage('We could not submit the form. Please check your details or contact the restaurant directly.')
    } finally {
      submissionGuard.current.finish()
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.contactForm} onSubmit={submit}>
      <h2>{formType === 'reservation' ? 'Request a Reservation' : formType === 'catering' ? 'Plan Your Event' : 'Send a Message'}</h2>
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
              {field.options?.map((option) => <option key={option}>{option}</option>)}
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
      <button disabled={submitting} type="submit">{submitting ? 'Sending…' : submitLabel}</button>
      {message && <p className={styles.formNotice} role="status">{message}</p>}
    </form>
  )
}
