type LayoutBlock = {
  blockType: string
  id?: string | null
}

type VirtualFeatureStripBlock = {
  blockType: 'featurestripBlock'
  id: string
  presentation: 'ghee-home-brand'
  source: 'site-settings'
}

const blockType = (block: LayoutBlock): string =>
  typeof block.blockType === 'string' ? block.blockType : ''

/**
 * Existing Ghee Roast Home records stored Brand Features in Site Settings
 * before the layout placement block existed. Insert one deterministic virtual
 * placement immediately after Hero for those records only. Once an editor adds
 * a Feature Strip block, Pages.layout becomes the complete ordering source.
 */
export function resolveGheeRoastHomeLayout<TBlock extends LayoutBlock>({
  hasBrandFeatures,
  isHomePage,
  layout,
}: {
  hasBrandFeatures: boolean
  isHomePage: boolean
  layout: TBlock[]
}): Array<TBlock | VirtualFeatureStripBlock> {
  if (
    !isHomePage
    || !hasBrandFeatures
    || layout.some((block) => blockType(block) === 'featurestripBlock')
    || !layout.some((block) => blockType(block) === 'heroBlock')
  ) return layout

  return layout.flatMap((block) => blockType(block) === 'heroBlock'
    ? [
        block,
        {
          blockType: 'featurestripBlock',
          id: 'site-settings-brand-features',
          presentation: 'ghee-home-brand',
          source: 'site-settings',
        },
      ]
    : [block])
}
