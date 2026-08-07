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
  'gheeHomePromosBlock',
  'gheeHomeQualityBlock',
  'gheeHomeStoryBlock',
  'heroBlock',
  'locationsBlock',
  'menushowcaseBlock',
  'newsletterBlock',
  'packagesBlock',
  'richtextBlock',
  'roomsshowcaseBlock',
  'socialLinksBlock',
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

/**
 * Block types registered in the shared `AllBlocks` catalog (see `src/blocks/index.ts`) solely
 * for Curious Ladoo's Pages — `tickerBlock`/`storyBlock`/`brandsshowcaseBlock` have no Ghee
 * Roast field shape they could render meaningfully (e.g. `storyBlock`'s content lives under
 * `title`/`quote`/`body`, not the flat `title`/`subtitle` the generic section fallback reads;
 * `tickerBlock` has no title/subtitle at all). `capabilityBlock` (Milestone 6) is the same
 * story — its content lives in a nested `items[]` array, not a flat `title`/`subtitle`.
 * `pipelineBlock` (Milestone 7) is the same again — its list/spotlight shape doesn't fit the flat
 * `title`/`subtitle` fallback either. `portfolioshowcaseBlock` and `compareBlock` (Milestone 8)
 * follow the same rule — a `portfolio`-collection relationship and two before/after media panels
 * have no meaningful flat-title/subtitle rendering either, and Ghee Roast has no Portfolio
 * collection content or case-study concept at all. `careersBlock` (Milestone 11) is the same
 * again — its content lives in a nested `positions[]` array (title/department/type/location/
 * description), not a flat `title`/`subtitle`, and Ghee Roast has no careers/job-listing concept.
 * `officeMapBlock` (Milestone 13) is the same again — its content is a `markers[]` array of
 * illustrative label/left%/top% positions, not a flat `title`/`subtitle`, and it renders Curious
 * Ladoo's decorative Contact-page map, a concept Ghee Roast's own Contact/Locations pages don't
 * use. They must never be added to `GHEE_ROAST_SUPPORTED_BLOCK_TYPES` just to satisfy a
 * block-registry parity check. Because the `layout` block picker is shared across every tenant, a
 * Ghee Roast editor could still add one of these in the admin UI — `CMSPage.tsx`'s `CMSBlock`
 * deliberately renders nothing for it (the fallthrough `return null` once no `if (type === ...)`
 * branch or simple-section membership matches), which is the intended, documented disposition, not
 * an oversight.
 */
export const GHEE_ROAST_THEME_EXCLUSIVE_BLOCK_TYPES = [
  'tickerBlock',
  'storyBlock',
  'brandsshowcaseBlock',
  'capabilityBlock',
  'pipelineBlock',
  'portfolioshowcaseBlock',
  'compareBlock',
  'careersBlock',
  'officeMapBlock',
] as const
