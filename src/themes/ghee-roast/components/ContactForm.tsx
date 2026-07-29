'use client'

import { FormEvent, useState } from 'react'
import type { FormFieldData } from '../types'
import styles from './Theme.module.css'

export function ContactForm({ fields }: { fields: FormFieldData[] }) {
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Development preview only—this message was not stored or sent.')
  }

  return (
    <form className={styles.contactForm} onSubmit={submit}>
      <h2>Send a Message</h2>
      {fields.map((field) => (
        <div className={!['email', 'phone'].includes(field.name) ? styles.fullField : undefined} key={field.name}>
          <label htmlFor={`contact-${field.name}`}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea id={`contact-${field.name}`} name={field.name} placeholder={field.placeholder} required={field.required} />
          ) : field.type === 'select' ? (
            <select defaultValue="" id={`contact-${field.name}`} name={field.name} required={field.required}>
              <option disabled value="">Select a subject</option>
              {field.options?.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input id={`contact-${field.name}`} name={field.name} placeholder={field.placeholder} required={field.required} type={field.type} />
          )}
        </div>
      ))}
      <button type="submit">Send Message</button>
      {message && <p className={styles.formNotice} role="status">{message}</p>}
    </form>
  )
}
