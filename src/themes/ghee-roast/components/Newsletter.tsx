'use client'

import { FormEvent, useRef, useState } from 'react'
import type { GheeRoastSiteData } from '../dynamicTypes'
import {
  buildNewsletterRequest,
  createSubmissionGuard,
} from '../forms/formRequests'
import styles from './Theme.module.css'

type NewsletterContent = GheeRoastSiteData['newsletter']

export function Newsletter({
  override,
}: {
  override: NewsletterContent
}) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const requestResult = buildNewsletterRequest(
      Object.fromEntries(new FormData(form).entries()),
    )
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
      if (!response.ok) throw new Error('Subscription rejected')
      form.reset()
      setMessage('Thank you for joining the list.')
    } catch {
      setMessage('We could not save your signup. Please try again later.')
    } finally {
      submissionGuard.current.finish()
      setSubmitting(false)
    }
  }

  if (!override.enabled) return null
  const highlighted = override.highlightedWord
  const titleParts = highlighted && override.title.includes(highlighted)
    ? override.title.split(highlighted)
    : null

  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-heading">
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterLeft}>
          <h2 id="newsletter-heading">
            {titleParts ? <>{titleParts[0]}<span>{highlighted}</span>{titleParts.slice(1).join(highlighted)}</> : override.title}
          </h2>
          {override.description && <p>{override.description}</p>}
        </div>
        <div className={styles.newsletterRight}>
          <form onSubmit={submit}>
            <label className={styles.visuallyHidden} htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" maxLength={254} name="email" placeholder={override.placeholder} required type="email" />
            <button disabled={submitting} type="submit">{submitting ? 'Submitting…' : override.buttonLabel}</button>
          </form>
          <small aria-live="polite">{message || override.privacyText}</small>
        </div>
      </div>
    </section>
  )
}
