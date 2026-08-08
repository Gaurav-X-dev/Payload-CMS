import { CMSPageHero } from './CMSInnerPageShared'
import { MenuBrowser, type MenuBrowserCategory, type MenuItem as MenuBrowserItem } from './Interactive'
import type {
  ZuruZuruMenuShowcaseBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

/**
 * Wraps the existing `MenuBrowser` client component (search + category filter + grid — unchanged
 * markup/behavior) with CMS-resolved items instead of the static `data/menu.ts` import. The
 * Japanese dish name (e.g. "スパイシーツナロール") has no dedicated MenuItems field; it's folded
 * into `dish.name` (matching the Home page's Seasonal Collections precedent), so MenuBrowser's own
 * separate `japanese` slot renders empty here — see the Milestone Z4 report.
 */
function FullMenuSection({ block }: { block: ZuruZuruMenuShowcaseBlockData }) {
  if (block.items.length === 0) return null

  const categories: MenuBrowserCategory[] = [{ label: 'All', value: 'all' }]
  const seenCategories = new Set<string>()
  for (const dish of block.items) {
    if (dish.category && !seenCategories.has(dish.category.slug)) {
      seenCategories.add(dish.category.slug)
      categories.push({ label: dish.category.title, value: dish.category.slug })
    }
  }

  const items: MenuBrowserItem[] = block.items.map((dish) => ({
    category: dish.category?.slug ?? 'all',
    description: dish.description,
    image: dish.image?.src ?? '',
    japanese: '',
    name: dish.name,
    price: `₹${dish.price}`,
  }))

  return <MenuBrowser categories={categories} items={items} />
}

function CMSMenuPageSection({ block }: { block: ZuruZuruPageBlockData }) {
  switch (block.type) {
    case 'hero': return <CMSPageHero block={block.data} />
    case 'menuShowcase': return <FullMenuSection block={block.data} />
    default: return null
  }
}

export function CMSMenuPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  return (
    <>
      {blocks.map((block, i) => <CMSMenuPageSection block={block} key={i} />)}
    </>
  )
}
