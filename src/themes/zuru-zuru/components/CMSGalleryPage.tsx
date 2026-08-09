import { CMSGalleryLightbox } from './CMSGalleryLightbox'
import { CMSPageHero } from './CMSInnerPageShared'
import type { ZuruZuruPageBlockData } from '../mappers/dynamicTypes'

export function CMSGalleryPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const gallery = blocks.find((block) => block.type === 'gallery')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      <section className="zz-gallery-section">
        <CMSGalleryLightbox items={gallery?.type === 'gallery' ? gallery.data.items : []} />
      </section>
    </>
  )
}
