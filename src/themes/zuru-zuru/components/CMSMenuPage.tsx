import type { Location } from '@/payload-types'
import { CMSPageHero } from './CMSInnerPageShared'
import { MenuBrowser, type MenuBrowserCategory, type MenuBrowserLocation, type MenuItem as MenuBrowserItem } from './Interactive'
import { splitDishName } from '../utils/foldedTitles'
import type {
  ZuruZuruMenuShowcaseBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

/**
 * Wraps the existing `MenuBrowser` client component (search + category filter + grid — unchanged
 * markup/behavior) with CMS-resolved items instead of the static `data/menu.ts` import.
 */
function FullMenuSection({ block, locations }: { block: ZuruZuruMenuShowcaseBlockData; locations: MenuBrowserLocation[] }) {
  if (block.items.length === 0) return null

  const categories: MenuBrowserCategory[] = [{ label: 'All', value: 'all' }]
  const seenCategories = new Set<string>()
  for (const dish of block.items) {
    if (dish.category && !seenCategories.has(dish.category.slug)) {
      seenCategories.add(dish.category.slug)
      categories.push({ label: dish.category.title, value: dish.category.slug })
    }
  }

  const items: MenuBrowserItem[] = block.items.map((dish) => {
    const { japanese, name } = splitDishName(dish.name)
    return {
      category: dish.category?.slug ?? 'all',
      description: dish.description,
      image: dish.image?.src ?? '',
      japanese,
      locationIDs: dish.locationIDs,
      locationPricing: dish.locationPricing,
      name,
      price: `₹${dish.price}`,
    }
  })

  return <MenuBrowser categories={categories} items={items} locations={locations} />
}

function CMSMenuPageSection({ block, locations }: { block: ZuruZuruPageBlockData; locations: MenuBrowserLocation[] }) {
  switch (block.type) {
    case 'hero': return <CMSPageHero block={block.data} />
    case 'menuShowcase': return <FullMenuSection block={block.data} locations={locations} />
    default: return null
  }
}

export function CMSMenuPage({ blocks, locations = [] }: { blocks: ZuruZuruPageBlockData[]; locations?: Location[] }) {
  const browserLocations: MenuBrowserLocation[] = locations
    .filter((location) => location.isActive !== false)
    .map((location) => ({ id: String(location.id), label: location.city || location.title }))

  return (
    <>
      {blocks.map((block, i) => <CMSMenuPageSection block={block} key={i} locations={browserLocations} />)}
    </>
  )
}
