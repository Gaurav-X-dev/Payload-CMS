'use client'

import { FormEvent, useState } from 'react'
import { gheeRoastSiteData } from '../data/site'
import styles from './Theme.module.css'

export function Newsletter() {
  const [message, setMessage] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('Development preview only—your email was not stored or sent.')
  }

  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-heading">
      <div className={styles.newsletterInner}>
        <div className={styles.newsletterLeft}>
          <h2 id="newsletter-heading">Join The <span>Flavour</span> Club</h2>
          <p>{gheeRoastSiteData.newsletter.description}</p>
        </div>
        <div className={styles.newsletterRight}>
          <form onSubmit={submit}>
            <label className={styles.visuallyHidden} htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" name="email" placeholder="Enter your email address" required type="email" />
            <button type="submit">Subscribe</button>
          </form>
          <small>{message || 'We respect your privacy. Unsubscribe anytime.'}</small>
        </div>
      </div>
    </section>
  )
}
