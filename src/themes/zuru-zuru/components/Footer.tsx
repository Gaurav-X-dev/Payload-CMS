import Image from 'next/image'
import Link from 'next/link'
import { footerColumns, image } from '../data/site'
import { Icon } from './Icon'

export function Newsletter() {
  return (
    <section className="zz-nl-section zz-section-alt">
      <div className="zz-container">
        <div className="zz-section-subtitle zz-centered">Stay Connected</div>
        <h2 className="zz-heading-section zz-text-center">Join Our Inner Circle</h2>
        <p className="zz-section-desc zz-text-center zz-newsletter-copy">Receive exclusive recipes, event invitations, and special offers directly in your inbox. No spam, just Japanese inspiration.</p>
        <form className="zz-nl-form"><label className="zz-visually-hidden" htmlFor="zz-newsletter">Email address</label><input id="zz-newsletter" placeholder="Enter your email address" type="email" /><button type="button">Subscribe</button></form>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="zz-footer">
      <div className="zz-container">
        <div className="zz-footer-grid">
          <div className="zz-footer-about">
            <div className="zz-footer-brand-container"><Image alt="Zuru Zuru" className="zz-footer-logo" height={62} src={image('zuruzuru_logo.png')} width={62} /><span className="zz-brand-name">Zuru Zuru</span></div>
            <p>A premium Japanese Izakaya experience bringing the authentic flavours of Tokyo to New Delhi. Every dish tells a story of tradition, passion, and culinary excellence.</p>
            <div className="zz-footer-social">
              <a aria-label="Instagram" href="https://www.instagram.com/zuruzuru.in/?hl=en"><Icon name="instagram" /></a><a aria-label="Facebook" href="#"><Icon name="facebook" /></a><a aria-label="Twitter" href="#"><Icon name="twitter" /></a><a aria-label="YouTube" href="#"><Icon name="youtube" /></a>
            </div>
          </div>
          {footerColumns.map(([heading, links]) => <div className="zz-footer-links" key={heading}><h4>{heading}</h4>{links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</div>)}
          <div><h4>Contact</h4><ul className="zz-footer-contact"><li><Icon name="map" /> Zuru Zuru, Delhi, India 110049</li><li><Icon name="phone" /> +91 11 4052 7373</li><li><Icon name="email" /> hello@zuruzuru.in</li></ul><h4 className="zz-hours-heading">Hours</h4><ul className="zz-footer-hours"><li><strong>1:00 PM - 4:00 PM &amp; 7:00 PM - 10:30 PM</strong><span>Lunch &amp; Dinner (Full Menu)</span></li><li><strong>4:00 PM - 7:00 PM</strong><span>Tempura, Gyoza &amp; Cold Ramen</span></li></ul></div>
        </div>
        <div className="zz-footer-bottom"><p>© 2026 Zuru Zuru Izakaya. All Rights Reserved.</p><div><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/faq">FAQ</Link></div></div>
      </div>
    </footer>
  )
}
