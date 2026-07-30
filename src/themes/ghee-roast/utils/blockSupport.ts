export const GHEE_ROAST_SUPPORTED_BLOCK_TYPES = [
  'amenitiesBlock',
  'blogpreviewBlock',
  'cardgridBlock',
  'contentgridBlock',
  'ctaBlock',
  'embedBlock',
  'eventsBlock',
  'faqBlock',
  'featurestripBlock',
  'formBlock',
  'galleryBlock',
  'heroBlock',
  'locationsBlock',
  'menushowcaseBlock',
  'newsletterBlock',
  'packagesBlock',
  'richtextBlock',
  'roomsshowcaseBlock',
  'spacerBlock',
  'splitBlock',
  'statsBlock',
  'stepsBlock',
  'subbrandsBlock',
  'teamBlock',
  'testimonialsBlock',
] as const

export type GheeRoastSupportedBlockType =
  typeof GHEE_ROAST_SUPPORTED_BLOCK_TYPES[number]

const supported = new Set<string>(GHEE_ROAST_SUPPORTED_BLOCK_TYPES)

export const isGheeRoastSupportedBlock = (
  blockType: string,
): blockType is GheeRoastSupportedBlockType => supported.has(blockType)

export const GHEE_ROAST_SIMPLE_SECTION_BLOCK_TYPES = new Set<string>([
  'amenitiesBlock',
  'blogpreviewBlock',
  'embedBlock',
  'packagesBlock',
  'roomsshowcaseBlock',
  'subbrandsBlock',
])
