import { MenuExplorer } from '../components/MenuExplorer'
import { ActionLink, PageHero } from '../components/Shared'
import { menuData } from '../data/menu'
import { gheeRoastSiteData } from '../data/site'
import styles from '../components/Theme.module.css'
import type { GheeRoastPageProps } from '../dynamicTypes'

export function MenuPage({ content }: GheeRoastPageProps) {
  const locations = content.collections.locations.length
    ? content.collections.locations.map((location) => ({
        description: location.description || location.address,
        id: location.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || String(location.id),
        label: location.city || location.title,
      }))
    : menuData.locations
  const orderLinks = content.site.orderLinks.length ? content.site.orderLinks : gheeRoastSiteData.orderLinks
  return (
    <>
      <PageHero {...(content.page?.hero ?? menuData.hero)} />
      <MenuExplorer
        categories={content.collections.menu.categories.length ? content.collections.menu.categories : menuData.categories}
        items={content.collections.menu.items.length ? content.collections.menu.items : menuData.items}
        locations={locations}
        orderLinks={orderLinks}
      />
      <section className={styles.cta}>
        <h2>Hungry? Order Now</h2>
        <p>Available on Swiggy &amp; Zomato — hot, fresh, and delivered straight to your door.</p>
        <div className={styles.actions}>
          {orderLinks.map((link) => <ActionLink href={link.href} key={link.label} label={link.label} variant="accent" />)}
        </div>
      </section>
    </>
  )
}
