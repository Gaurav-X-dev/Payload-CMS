import type {
  Footer,
  Media,
  Nav,
  Page,
  SiteSetting,
  Tenant,
} from '../../../payload-types'
import type {
  ZuruZuruFooterData,
  ZuruZuruMediaData,
  ZuruZuruNavigationData,
  ZuruZuruShellData,
  ZuruZuruSiteData,
} from './dynamicTypes'

const text = (value: string | null | undefined): string => (typeof value === 'string' ? value.trim() : '')

const isPopulated = <T extends { id: number }>(value: number | T | null | undefined): value is T =>
  Boolean(value && typeof value === 'object')

const belongsToTenant = (
  tenantField: number | Tenant | null | undefined,
  tenantID: number,
): boolean => {
  if (typeof tenantField === 'number') return tenantField === tenantID
  if (tenantField && typeof tenantField === 'object') return tenantField.id === tenantID
  return false
}

function mapMedia(value: number | Media | null | undefined, tenantID: number): ZuruZuruMediaData {
  if (!isPopulated<Media>(value)) return null
  if (!belongsToTenant(value.tenantId, tenantID)) return null
  const src = text(value.url)
  if (!src) return null
  return {
    alt: text(value.alt) || 'Zuru Zuru',
    id: value.id,
    src,
  }
}

const emptyNavigation: ZuruZuruNavigationData = { brandName: '', cta: null, links: [], logo: null }

export function mapZuruZuruNavigation(nav: Nav | null, tenantID: number): ZuruZuruNavigationData {
  if (!nav || !belongsToTenant(nav.tenantId, tenantID)) return emptyNavigation
  return {
    brandName: text(nav.brandName),
    cta: nav.cta?.enabled && nav.cta.label && nav.cta.url
      ? { label: text(nav.cta.label), url: text(nav.cta.url) }
      : null,
    links: (nav.links ?? [])
      .filter((entry): entry is Extract<NonNullable<Nav['links']>[number], { blockType: 'link' }> =>
        entry.blockType === 'link' && entry.enabled !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        children: (entry.children ?? [])
          .filter((child) => child.enabled !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((child) => ({ label: text(child.label), url: text(child.url) }))
          .filter((child) => child.label && child.url),
        label: text(entry.label),
        url: entry.type === 'page'
          ? (isPopulated<Page>(entry.page) ? `/${text(entry.page.slug)}` : '/')
          : text(entry.url),
      }))
      .filter((link) => link.label && link.url),
    logo: mapMedia(nav.logo, tenantID),
  }
}

const emptyFooter: ZuruZuruFooterData = { bottomLinks: [], columns: [], copyright: '' }

export function mapZuruZuruFooter(footer: Footer | null, tenantID: number): ZuruZuruFooterData {
  if (!footer || !belongsToTenant(footer.tenantId, tenantID)) return emptyFooter
  return {
    bottomLinks: (footer.bottomLinks ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })),
    columns: (footer.columns ?? []).map((column) => ({
      links: (column.links ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })),
      title: text(column.title),
    })),
    copyright: text(footer.copyright).replace('{year}', String(new Date().getFullYear())),
  }
}

const emptyNewsletter = {
  buttonLabel: '',
  description: '',
  enabled: false,
  errorMessage: '',
  placeholder: '',
  successMessage: '',
  title: '',
}

const emptySite: ZuruZuruSiteData = {
  address: '',
  announcement: { enabled: false, text: '' },
  description: '',
  email: '',
  hours: [],
  logo: null,
  name: '',
  newsletter: emptyNewsletter,
  phone: '',
  social: [],
  tagline: '',
}

export function mapZuruZuruSite(
  tenant: Tenant | null,
  siteSettings: SiteSetting | null,
): ZuruZuruSiteData {
  if (!tenant) return emptySite
  const tenantID = tenant.id
  const settings = siteSettings && belongsToTenant(siteSettings.tenantId, tenantID) ? siteSettings : null
  return {
    address: text(settings?.contactAddress),
    announcement: {
      enabled: settings?.showAnnouncementBar === true && Boolean(text(settings?.announcementText)),
      text: text(settings?.announcementText),
    },
    description: text(settings?.siteDescription),
    email: text(tenant.contact?.contactEmail),
    hours: (settings?.hours ?? []).map((row) => ({
      closeTime: text(row.closeTime),
      day: text(row.day),
      isClosed: row.isClosed === true,
      openTime: text(row.openTime),
    })),
    logo: mapMedia(tenant.branding?.logo, tenantID),
    name: text(settings?.businessName) || text(tenant.name),
    newsletter: settings?.newsletter
      ? {
          buttonLabel: text(settings.newsletter.buttonLabel),
          description: text(settings.newsletter.description),
          enabled: settings.newsletter.enabled !== false,
          errorMessage: text(settings.newsletter.errorMessage),
          placeholder: text(settings.newsletter.placeholder),
          successMessage: text(settings.newsletter.successMessage),
          title: text(settings.newsletter.title),
        }
      : emptyNewsletter,
    phone: text(tenant.contact?.contactPhone),
    social: (settings?.socials ?? [])
      .filter((social) => social.enabled !== false && social.url)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((social) => ({
        href: text(social.url),
        icon: !social.icon || social.icon === 'platform' ? social.platform : social.icon,
        label: social.platform,
      })),
    tagline: text(settings?.tagline),
  }
}

export function mapZuruZuruShell({
  footer,
  nav,
  siteSettings,
  tenant,
}: {
  footer: Footer | null
  nav: Nav | null
  siteSettings: SiteSetting | null
  tenant: Tenant | null
}): ZuruZuruShellData {
  const tenantID = tenant?.id ?? 0
  return {
    footer: mapZuruZuruFooter(footer, tenantID),
    navigation: mapZuruZuruNavigation(nav, tenantID),
    site: mapZuruZuruSite(tenant, siteSettings),
  }
}
