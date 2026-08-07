'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import {
  buildContactSubmissionRequest,
  createSubmissionGuard,
} from '../../ghee-roast/forms/formRequests'
import styles from './Theme.module.css'

type ContactSubjectOption = { label: string; value: string }

type ContactFormProps = {
  errorMessage: string
  heading: string
  subjectOptions: ContactSubjectOption[]
  submitLabel: string
  successMessage: string
}

export function ContactForm({ errorMessage, heading, subjectOptions, submitLabel, successMessage }: ContactFormProps) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [subject, setSubject] = useState(subjectOptions[0]?.value ?? '')
  const submissionGuard = useRef(createSubmissionGuard())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const interest = new URLSearchParams(window.location.search).get('interest')
    if (interest && subjectOptions.some((option) => option.value === interest)) {
      // Deliberately deferred to an effect: the server has no access to the URL's query string,
      // so the initial render must match the server's default-first-option selection to avoid a
      // hydration mismatch. This one-time post-mount sync from the URL is exactly the case React's
      // own docs carve out as legitimate for this rule.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubject(interest)
    }
    // Only ever read on first mount, matching the original page's one-shot query-param preselect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    const allowedSubjects = subjectOptions.map((option) => option.value)
    const requestResult = buildContactSubmissionRequest(values, 'contact', allowedSubjects)
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
      <div className={styles.formSuccess} role="status">
        <h3>Thank you for reaching out!</h3>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div className={styles.premiumFormContainer}>
      {heading && (
        <h2
          className={styles.sectionTitle}
          style={{ color: 'var(--ch-text-light)', fontSize: '2rem', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}
        >
          {heading}
        </h2>
      )}
      <form className="premium-form" noValidate onSubmit={submit}>
        <div className={styles.formGroupCustom}>
          <label htmlFor="name">Your Name</label>
          <input id="name" maxLength={100} name="name" placeholder="John Doe" required type="text" />
        </div>

        <div className={styles.formGroupCustom}>
          <label htmlFor="email">Email Address</label>
          <input id="email" maxLength={254} name="email" placeholder="john@example.com" required type="email" />
        </div>

        <div className={styles.formGroupCustom}>
          <label htmlFor="subject">Area of Interest</label>
          <select id="subject" name="subject" onChange={(event) => setSubject(event.target.value)} value={subject}>
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroupCustom}>
          <label htmlFor="message">Tell us about your project</label>
          <textarea id="message" maxLength={5_000} name="message" placeholder="Share a few details..." required rows={5} />
        </div>

        <button className={styles.submitBtnCustom} disabled={submitting} id="contact-submit-btn" type="submit">
          {submitting ? 'Sending…' : `${submitLabel} →`}
        </button>
        {messageTone === 'error' && message && (
          <p data-tone="error" role="alert" style={{ color: 'var(--ch-accent)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{message}</p>
        )}
      </form>
    </div>
  )
}
