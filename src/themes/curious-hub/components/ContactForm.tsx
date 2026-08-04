'use client'

import { useState } from 'react'
import type { FormFieldData } from '../types'
import styles from './Theme.module.css'

type ContactFormProps = {
  fields: FormFieldData[]
  submitLabel?: string
  title?: string
}

export function ContactForm({ fields, submitLabel = 'Send Message →', title = 'Start a Conversation' }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, ''])),
  )

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.formSuccess} role="status">
        <h3>Thank you for reaching out!</h3>
        <p>We will get back to you shortly.</p>
      </div>
    )
  }

  return (
    <div className={styles.premiumFormContainer}>
      <h2 className={styles.formTitle}>{title}</h2>
      <form className={styles.premiumForm} noValidate onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div className={styles.formGroupCustom} key={field.name}>
            <label className={styles.formLabelCustom} htmlFor={`ch-${field.name}`}>
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                className={styles.formTextareaCustom}
                id={`ch-${field.name}`}
                name={field.name}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={5}
                value={values[field.name]}
              />
            ) : field.type === 'select' ? (
              <select
                className={styles.formSelectCustom}
                id={`ch-${field.name}`}
                name={field.name}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                value={values[field.name]}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={styles.formInputCustom}
                id={`ch-${field.name}`}
                name={field.name}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type}
                value={values[field.name]}
              />
            )}
          </div>
        ))}
        <button className={styles.submitBtnCustom} id="contact-submit-btn" type="submit">
          {submitLabel}
        </button>
      </form>
    </div>
  )
}
