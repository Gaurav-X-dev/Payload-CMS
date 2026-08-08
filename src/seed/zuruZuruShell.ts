import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import { findOrUploadMedia } from './mediaUpload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruShellSeedResult = {
  footerID: number | string
  media: { created: number; reused: number }
  navID: number | string
  siteSettingsID: number | string
  tenantID: number | string
}

const findFirst = async (
  payload: Payload,
  collection: Parameters<Payload['find']>[0]['collection'],
  where: NonNullable<Parameters<Payload['find']>[0]['where']>,
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  })
  return result.docs[0]
}

/**
 * Milestone Z2 — global shell only. Populates the *existing* Zuru Zuru tenant's branding
 * contact info plus Nav/Footer/SiteSettings. Never creates a tenant (throws if the seeded
 * 'zuru-zuru' tenant from the theme scaffold is missing) and never touches Ghee Roast or
 * Curious Ladoo records. Safe to re-run: every document is matched by tenant id first.
 */
export async function seedZuruZuruShellContent(payload: Payload): Promise<ZuruZuruShellSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru shell seed as.')
  }
  const user = superAdmin as User

  const existingTenant = await findFirst(payload, 'tenants', { slug: { equals: 'zuru-zuru' } })
  if (!existingTenant) {
    throw new Error(
      'Zuru Zuru tenant not found. This milestone reuses the existing tenant and never creates one.',
    )
  }
  const tenantId = existingTenant.id

  // ---------------------------------------------------------------------------
  // Media — the existing logo asset, reused (never re-uploaded on re-run).
  // ---------------------------------------------------------------------------
  let mediaCreated = 0
  let mediaReused = 0
  const beforeLogo = await payload.count({
    collection: 'media',
    overrideAccess: true,
    where: { and: [{ tenantId: { equals: tenantId } }, { title: { equals: 'zuruzuru_logo.png' } }] },
  })
  const logo = await findOrUploadMedia(payload, {
    projectRoot,
    spec: { alt: 'Zuru Zuru Izakaya', sourcePath: 'themes/zuru-zuru/images/zuruzuru_logo.png', title: 'zuruzuru_logo.png' },
    tenantId,
    user,
  })
  if (beforeLogo.totalDocs > 0) mediaReused += 1
  else mediaCreated += 1

  // ---------------------------------------------------------------------------
  // Tenant — partial update: only name/contact/branding.logo touched. isActive, isPrimary,
  // domains, features, colors, typography, and every other existing field are left untouched.
  // ---------------------------------------------------------------------------
  const tenant = await payload.update({
    id: tenantId,
    collection: 'tenants',
    data: {
      branding: { logo: logo.id },
      contact: {
        contactEmail: 'hello@zuruzuru.in',
        contactPhone: '+91 11 4052 7373',
      },
      name: 'Zuru Zuru',
    },
    overrideAccess: true,
    user,
  })

  // ---------------------------------------------------------------------------
  // Site Settings
  // ---------------------------------------------------------------------------
  const existingSettings = await findFirst(payload, 'site-settings', { tenantId: { equals: tenantId } })
  const settingsData = {
    _status: 'published' as const,
    announcementText: 'Grand Summer Festival — 20% Off This Weekend',
    businessName: 'Zuru Zuru',
    contactAddress: 'Zuru Zuru, Delhi, India 110049',
    cuisineType: 'Japanese Izakaya',
    hours: (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map((day) => ({
      closeTime: '11:00 PM',
      day,
      isClosed: false,
      openTime: '12:00 PM',
    })),
    newsletter: {
      buttonLabel: 'Subscribe',
      description: 'Receive exclusive recipes, event invitations, and special offers directly in your inbox. No spam, just Japanese inspiration.',
      enabled: true,
      errorMessage: 'We could not save your signup. Please try again later.',
      highlightedWord: 'Inner Circle',
      placeholder: 'Enter your email address',
      privacyText: 'We respect your privacy. Unsubscribe anytime.',
      successMessage: 'Thank you for joining the list.',
      title: 'Join Our Inner Circle',
    },
    priceRange: '$$$' as const,
    showAnnouncementBar: true,
    siteDescription: 'A premium Japanese Izakaya experience bringing the authentic flavours of Tokyo to New Delhi. Every dish tells a story of tradition, passion, and culinary excellence.',
    socials: [
      { enabled: true, icon: 'platform' as const, openInNewTab: true, platform: 'instagram' as const, sortOrder: 0, url: 'https://www.instagram.com/zuruzuru.in/?hl=en' },
      { enabled: false, icon: 'platform' as const, openInNewTab: true, platform: 'facebook' as const, sortOrder: 1, url: '' },
      { enabled: false, icon: 'platform' as const, openInNewTab: true, platform: 'twitter' as const, sortOrder: 2, url: '' },
      { enabled: false, icon: 'platform' as const, openInNewTab: true, platform: 'youtube' as const, sortOrder: 3, url: '' },
    ],
    tenantId,
  }
  const siteSettings = existingSettings
    ? await payload.update({ id: existingSettings.id, collection: 'site-settings', data: settingsData, overrideAccess: true, user })
    : await payload.create({ collection: 'site-settings', data: settingsData, overrideAccess: true, user })

  // ---------------------------------------------------------------------------
  // Nav — the first 7 links (sortOrder 0-60) are exactly the original static desktop nav, in
  // the same order. The 3 links after that (Private Dining/Events/Blog) were mobile-only
  // overflow in the static design; the CMS-driven mobile menu shows all of them, same set of
  // reachable pages as before (see Milestone Z2 report for the one disclosed ordering nuance).
  // ---------------------------------------------------------------------------
  const existingNav = await findFirst(payload, 'nav', { tenantId: { equals: tenantId } })
  const navData = {
    _status: 'published' as const,
    brandName: 'Zuru Zuru',
    cta: { enabled: true, label: 'Reserve', url: '/reservation' },
    internalName: 'Zuru Zuru Primary Header',
    links: [
      { blockType: 'link' as const, children: [], enabled: true, label: 'Home', sortOrder: 0, type: 'internal' as const, url: '/' },
      {
        blockType: 'link' as const,
        children: [
          { enabled: true, label: 'Delhi Menu', sortOrder: 0, url: '/menu?location=delhi' },
          { enabled: true, label: 'Gurugram Menu', sortOrder: 10, url: '/menu?location=gurugram' },
        ],
        enabled: true,
        label: 'Menu',
        sortOrder: 10,
        type: 'internal' as const,
        url: '/menu',
      },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Our Story', sortOrder: 20, type: 'internal' as const, url: '/about' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Chefs', sortOrder: 30, type: 'internal' as const, url: '/chefs' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Gallery', sortOrder: 40, type: 'internal' as const, url: '/gallery' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Reservations', sortOrder: 50, type: 'internal' as const, url: '/reservation' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Contact', sortOrder: 60, type: 'internal' as const, url: '/contact' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Private Dining', sortOrder: 70, type: 'internal' as const, url: '/private-dining' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Events', sortOrder: 80, type: 'internal' as const, url: '/events' },
      { blockType: 'link' as const, children: [], enabled: true, label: 'Blog', sortOrder: 90, type: 'internal' as const, url: '/blog' },
    ],
    location: 'header' as const,
    logo: logo.id,
    tenantId,
  }
  const nav = existingNav
    ? await payload.update({ id: existingNav.id, collection: 'nav', data: navData, overrideAccess: true, user })
    : await payload.create({ collection: 'nav', data: navData, overrideAccess: true, user })

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  const existingFooter = await findFirst(payload, 'footer', { tenantId: { equals: tenantId } })
  const footerData = {
    _status: 'published' as const,
    bottomLinks: [
      { label: 'Privacy Policy', url: '/privacy-policy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'FAQ', url: '/faq' },
    ],
    columns: [
      { title: 'Explore', links: [{ label: 'Our Menu', url: '/menu' }, { label: 'Our Story', url: '/about' }, { label: 'Our Chefs', url: '/chefs' }, { label: 'Gallery', url: '/gallery' }, { label: 'Blog', url: '/blog' }] },
      { title: 'Services', links: [{ label: 'Reservations', url: '/reservation' }, { label: 'Private Dining', url: '/private-dining' }, { label: 'Events', url: '/events' }, { label: 'Catering', url: '/catering' }, { label: 'Careers', url: '/careers' }] },
      { title: 'Information', links: [{ label: 'Locations', url: '/locations' }, { label: 'Franchise', url: '/franchise' }, { label: 'FAQ', url: '/faq' }, { label: 'Privacy Policy', url: '/privacy-policy' }, { label: 'Terms', url: '/terms' }] },
    ],
    contactHeading: 'Get In Touch',
    copyright: '© {year} Zuru Zuru Izakaya. All Rights Reserved.',
    tenantId,
  }
  const footer = existingFooter
    ? await payload.update({ id: existingFooter.id, collection: 'footer', data: footerData, overrideAccess: true, user })
    : await payload.create({ collection: 'footer', data: footerData, overrideAccess: true, user })

  payload.logger.info('Zuru Zuru shell seed completed.')

  return {
    footerID: footer.id,
    media: { created: mediaCreated, reused: mediaReused },
    navID: nav.id,
    siteSettingsID: siteSettings.id,
    tenantID: tenant.id,
  }
}
