import { MenuExplorer } from '../components/MenuExplorer'
import { ActionLink, PageHero } from '../components/Shared'
import { menuData } from '../data/menu'
import { gheeRoastSiteData } from '../data/site'
import styles from '../components/Theme.module.css'

export function MenuPage() {
  return (
    <>
      <PageHero {...menuData.hero} />
      <MenuExplorer categories={menuData.categories} items={menuData.items} locations={menuData.locations} />
      <section className={styles.cta}>
        <h2>Hungry? Order Now</h2>
        <p>Available on Swiggy &amp; Zomato — hot, fresh, and delivered straight to your door.</p>
        <div className={styles.actions}>
          {gheeRoastSiteData.orderLinks.map((link) => <ActionLink href={link.href} key={link.label} label={link.label} variant="accent" />)}
        </div>
      </section>
    </>
  )
}
