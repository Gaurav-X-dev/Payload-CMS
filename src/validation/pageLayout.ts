export const CMS_PAGE_TYPES = [
  'home',
  'about',
  'menu',
  'quality',
  'delivery',
  'catering',
  'contact',
  'gallery',
  'locations',
  'faq',
  'reservation',
  'blog-index',
  'generic',
  'legal',
] as const

export type CMSPageType = typeof CMS_PAGE_TYPES[number]

const pageTypes = new Set<string>(CMS_PAGE_TYPES)

export const normalizeCMSPageType = (
  value: unknown,
  isHomePage = false,
): CMSPageType => {
  if (isHomePage) return 'home'
  return typeof value === 'string' && pageTypes.has(value)
    ? value as CMSPageType
    : 'generic'
}

type LayoutBlock = Record<string, unknown>

const asLayoutBlocks = (value: unknown): LayoutBlock[] =>
  Array.isArray(value)
    ? value.filter((block): block is LayoutBlock => Boolean(block && typeof block === 'object'))
    : []

const SINGLETON_BLOCK_LABELS = new Map<string, string>([
  ['heroBlock', 'Hero'],
  ['featurestripBlock', 'Feature Strip'],
  ['gheeHomeStoryBlock', 'Ghee Roast Our Story'],
  ['gheeHomeQualityBlock', 'Ghee Roast Quality Promise'],
  ['gheeHomePromosBlock', 'Ghee Roast Promotional Split'],
  ['newsletterBlock', 'Newsletter'],
  ['formBlock', 'Contact Form'],
  ['locationsBlock', 'Locations'],
  ['socialLinksBlock', 'Social Media'],
  ['tickerBlock', 'Ticker / Marquee'],
  ['brandsshowcaseBlock', 'Brands Showcase'],
])

export const validateHTMLID = (value: unknown): true | string => {
  const htmlID = typeof value === 'string' ? value.trim() : ''
  return !htmlID || /^[A-Za-z][A-Za-z0-9_-]*$/.test(htmlID)
    ? true
    : 'HTML ID must start with a letter and contain only letters, numbers, hyphens, or underscores.'
}

export const validateCSSClassList = (value: unknown): true | string => {
  const classNames = typeof value === 'string' ? value.trim().split(/\s+/).filter(Boolean) : []
  return classNames.every((className) => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(className))
    ? true
    : 'Custom classes must be space-separated CSS class names containing only letters, numbers, hyphens, or underscores.'
}

export const validatePageLayout = (value: unknown): true | string => {
  const blocks = asLayoutBlocks(value)
  const counts = new Map<string, number>()
  const htmlIDs = new Set<string>()

  for (const [index, block] of blocks.entries()) {
    const blockType = typeof block.blockType === 'string' ? block.blockType : ''
    if (blockType) counts.set(blockType, (counts.get(blockType) ?? 0) + 1)

    const settings = block.settings && typeof block.settings === 'object'
      ? block.settings as Record<string, unknown>
      : null
    const htmlID = typeof settings?.htmlId === 'string' ? settings.htmlId.trim() : ''
    const htmlIDValidation = validateHTMLID(htmlID)
    if (htmlIDValidation !== true) {
      return `Block ${index + 1}: ${htmlIDValidation}`
    }
    if (htmlID && htmlIDs.has(htmlID)) {
      return `HTML ID "${htmlID}" is used by more than one block. Use a unique ID on this page.`
    }
    if (htmlID) htmlIDs.add(htmlID)
  }

  for (const [blockType, label] of SINGLETON_BLOCK_LABELS) {
    if ((counts.get(blockType) ?? 0) > 1) {
      return `${label} can be added only once per page.`
    }
  }

  const heroIndex = blocks.findIndex((block) => block.blockType === 'heroBlock')
  if (heroIndex > 0) return 'The Hero block must be the first block in Layout.'

  return true
}
