'use client'

import { FormEvent, useRef, useState } from 'react'
import type { CuriousLadooNewsletterData } from '../mappers/dynamicTypes'
import {
  buildNewsletterRequest,
  createSubmissionGuard,
} from '../../ghee-roast/forms/formRequests'
import styles from './Theme.module.css'

export function BlogNewsletter({ newsletter }: { newsletter: CuriousLadooNewsletterData }) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())

  if (!newsletter.enabled || !newsletter.title) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const requestResult = buildNewsletterRequest(Object.fromEntries(new FormData(form).entries()))
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
      if (!response.ok) throw new Error('Subscription rejected')
      form.reset()
      setMessageTone('success')
      setMessage(newsletter.successMessage || 'Thank you for subscribing.')
    } catch {
      setMessageTone('error')
      setMessage(newsletter.errorMessage || 'We could not save your subscription. Please try again.')
    } finally {
      submissionGuard.current.finish()
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.blogNewsletterBox}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '1rem' }}>
        {newsletter.title}
      </h3>
      {newsletter.description && (
        <p className={styles.sectionBody} style={{ margin: '0 auto', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
          {newsletter.description}
        </p>
      )}
      <form className={styles.blogNewsletterForm} onSubmit={submit}>
        <input
          className={styles.blogNewsletterInput}
          maxLength={254}
          name="email"
          placeholder={newsletter.placeholder}
          required
          type="email"
        />
        <button className={styles.blogNewsletterBtn} disabled={submitting} type="submit">
          {submitting ? 'Sending…' : newsletter.buttonLabel}
        </button>
      </form>
      {message && (
        <p aria-live="polite" data-tone={messageTone} role="status" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.82rem', marginTop: '0.8rem' }}>
          {message}
        </p>
      )}
    </div>
  )
}
