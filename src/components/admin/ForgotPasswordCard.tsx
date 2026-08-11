'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'

import {
  buildForgotPasswordRequestBody,
  classifyForgotPasswordResponse,
  FORGOT_PASSWORD_ENDPOINT,
  GENERIC_ERROR_MESSAGE,
} from '@/lib/admin/forgotPassword'
import { AdminButton, AdminCard } from './AdminUI'
import styles from './ForgotPasswordCard.module.css'

const LOGIN_HREF = '/admin/login'

export function ForgotPasswordCard() {
  const [email, setEmail] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<null | string>(null)
  const [formError, setFormError] = useState<null | string>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setFieldError(null)
    setFormError(null)

    const outcome = await fetch(FORGOT_PASSWORD_ENDPOINT, {
      body: JSON.stringify(buildForgotPasswordRequestBody(email)),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
      .then(async (response) => {
        let body: unknown = null
        try {
          body = await response.json()
        } catch {
          body = null
        }
        return classifyForgotPasswordResponse({ body, ok: response.ok, status: response.status })
      })
      .catch(() => ({ kind: 'generic-error' as const, message: GENERIC_ERROR_MESSAGE }))

    setIsSubmitting(false)

    if (outcome.kind === 'success') {
      setHasSubmitted(true)
      return
    }
    if (outcome.kind === 'field-error') {
      setFieldError(outcome.message)
      return
    }
    setFormError(outcome.message)
  }

  if (hasSubmitted) {
    return (
      <div className={styles.page}>
        <AdminCard className={styles.card} padding="large">
          <h1 className={styles.heading}>Email Sent</h1>
          <p className={styles.description}>
            Check your email for a link to reset your password.
          </p>
          <Link className={styles.backLink} href={LOGIN_HREF}>
            Back to login
          </Link>
        </AdminCard>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <AdminCard className={styles.card} padding="large">
        <h1 className={styles.heading}>Forgot Password</h1>
        <p className={styles.description}>
          Please enter your email below. You will receive an email message with instructions on
          how to reset your password.
        </p>

        <form noValidate onSubmit={handleSubmit}>
          {formError ? (
            <div className={styles.formError} role="alert">
              {formError}
            </div>
          ) : null}

          <label className={styles.label} htmlFor="forgot-password-email">
            Email
          </label>
          <input
            autoComplete="email"
            className={styles.input}
            id="forgot-password-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          {fieldError ? (
            <p className={styles.fieldError} role="alert">
              {fieldError}
            </p>
          ) : null}

          <AdminButton
            className={styles.submitButton}
            isLoading={isSubmitting}
            loadingLabel="Submitting"
            size="large"
            type="submit"
          >
            Submit
          </AdminButton>
        </form>

        <Link className={styles.backLink} href={LOGIN_HREF}>
          Back to login
        </Link>
      </AdminCard>
    </div>
  )
}
