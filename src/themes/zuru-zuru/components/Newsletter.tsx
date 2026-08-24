'use client'

import { FormEvent, useRef, useState } from 'react'
import {
  buildNewsletterRequest,
  createSubmissionGuard,
} from '../../ghee-roast/forms/formRequests'
import type { ZuruZuruNewsletterData } from '../mappers/dynamicTypes'

export function Newsletter({ newsletter }: { newsletter?: ZuruZuruNewsletterData }) {
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submissionGuard = useRef(createSubmissionGuard())

  if (newsletter && !newsletter.enabled) return null

  const title = newsletter?.title || 'Join Our Inner Circle'
  const description = newsletter?.description || 'Receive exclusive recipes, event invitations, and special offers directly in your inbox. No spam, just Japanese inspiration.'
  const placeholder = newsletter?.placeholder || 'Enter your email address'
  const buttonLabel = newsletter?.buttonLabel || 'Subscribe'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!submissionGuard.current.begin()) return

    const form = event.currentTarget
    const requestResult = buildNewsletterRequest(
      Object.fromEntries(new FormData(form).entries()),
    )
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
      setMessage(newsletter?.successMessage || 'Thank you for subscribing.')
    } catch {
      setMessageTone('error')
      setMessage(newsletter?.errorMessage || 'We could not save your subscription. Please try again.')
    } finally {
      submissionGuard.current.finish()
      setSubmitting(false)
    }
  }

  return (
    <section className="zz-nl-section zz-section-alt">
      <div className="zz-container">
        <div className="zz-section-subtitle zz-centered">Stay Connected</div>
        <h2 className="zz-heading-section zz-text-center">{title}</h2>
        <p className="zz-section-desc zz-text-center zz-newsletter-copy">{description}</p>
        <form className="zz-nl-form" onSubmit={submit}>
          <label className="zz-visually-hidden" htmlFor="zz-newsletter">Email address</label>
          <input id="zz-newsletter" maxLength={254} name="email" placeholder={placeholder} required type="email" />
          <button aria-disabled={submitting} disabled={submitting} type="submit">{submitting ? 'Submitting…' : buttonLabel}</button>
        </form>
        {message && (
          <p aria-live="polite" className="zz-nl-message" data-tone={messageTone} role="status">{message}</p>
        )}
      </div>
    </section>
  )
}
