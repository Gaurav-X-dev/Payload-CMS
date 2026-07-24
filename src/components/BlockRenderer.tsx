import React from 'react'
import { Hero } from './blocks/Hero'
import { FeatureStrip } from './blocks/FeatureStrip'
import { CardGrid } from './blocks/CardGrid'
import { ContentGrid } from './blocks/ContentGrid'
import { Steps } from './blocks/Steps'
import { Testimonials } from './blocks/Testimonials'
import { Stats } from './blocks/Stats'
import { Split } from './blocks/Split'
import { Gallery } from './blocks/Gallery'
import { Form } from './blocks/Form'
import { MenuShowcase } from './blocks/MenuShowcase'
import { Team } from './blocks/Team'
import { FAQ } from './blocks/FAQ'
import { Locations } from './blocks/Locations'
import { BlogPreview } from './blocks/BlogPreview'
import { Embed } from './blocks/Embed'
import { CTA } from './blocks/CTA'
import { Newsletter } from './blocks/Newsletter'
import { RichText } from './blocks/RichText'
import { Spacer } from './blocks/Spacer'
import { RoomsShowcase } from './blocks/RoomsShowcase'
import { Amenities } from './blocks/Amenities'
import { Packages } from './blocks/Packages'
import { SubBrands } from './blocks/SubBrands'

const blockComponents = {
  hero: Hero,
  featurestrip: FeatureStrip,
  cardgrid: CardGrid,
  contentgrid: ContentGrid,
  steps: Steps,
  testimonials: Testimonials,
  stats: Stats,
  split: Split,
  gallery: Gallery,
  form: Form,
  menushowcase: MenuShowcase,
  team: Team,
  faq: FAQ,
  locations: Locations,
  blogpreview: BlogPreview,
  embed: Embed,
  cta: CTA,
  newsletter: Newsletter,
  richtext: RichText,
  spacer: Spacer,
  roomsshowcase: RoomsShowcase,
  amenities: Amenities,
  packages: Packages,
  subbrands: SubBrands,
}

export const BlockRenderer: React.FC<{ blocks: any[] }> = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block, i) => {
        const Block = blockComponents[block.blockType as keyof typeof blockComponents]
        if (Block) {
          return <Block key={i} {...block} />
        }
        return <div key={i}>Unknown Block: {block.blockType}</div>
      })}
    </>
  )
}
