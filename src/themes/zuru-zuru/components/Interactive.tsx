'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { image } from '../data/site'
import { Icon } from './Icon'

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > 600)
      const height = document.documentElement.scrollHeight - window.innerHeight
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <><span className="zz-scroll-progress" style={{ width: `${progress}%` }} /><button aria-label="Back to top" className={`zz-back-to-top ${visible ? 'zz-visible' : ''}`} onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })} type="button"><Icon name="caretUp" /></button></>
}

export function FrontendForm({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }
  return <form className={className} onSubmit={submit}>{children}</form>
}

export function Accordion({ items }: { items: Array<[string, string]> }) {
  const [open, setOpen] = useState(0)
  return <div className="zz-accordion">{items.map(([question, answer], index) => <article className={`zz-accordion-item ${open === index ? 'zz-active' : ''}`} key={question}><button aria-expanded={open === index} className="zz-accordion-header" onClick={() => setOpen(open === index ? -1 : index)} type="button"><span>{question}</span><span>+</span></button><div className="zz-accordion-body"><p>{answer}</p></div></article>)}</div>
}

export function GalleryLightbox() {
  const assets = ['hero_sushi.png', 'interior.png', 'hero_ramen.png', 'gyoza_tempura.png', 'chef.png']
  const items = Array.from({ length: 20 }, (_, index) => ({ asset: assets[index % assets.length], category: ['food', 'interior', 'chefs', 'events'][index % 4] }))
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState<number | null>(null)
  const visible = items.map((item, index) => ({ ...item, index })).filter((item) => filter === 'all' || item.category === filter)
  return <><div className="zz-gallery-filters">{['all', 'food', 'interior', 'chefs', 'events'].map((value) => <button className={filter === value ? 'zz-active' : ''} key={value} onClick={() => setFilter(value)} type="button">{value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)}</button>)}</div><div className="zz-gallery-grid">{visible.map((item) => <button className="zz-gallery-item" key={item.index} onClick={() => setActive(item.index)} type="button"><Image alt={`Zuru Zuru gallery ${item.index + 1}`} fill sizes="(max-width: 700px) 100vw, 33vw" src={image(item.asset)} /><span><Icon name="search" /></span></button>)}</div>{active !== null && <div className="zz-lightbox" role="dialog" aria-modal="true"><button aria-label="Close lightbox" className="zz-lightbox-close" onClick={() => setActive(null)} type="button">×</button><button aria-label="Previous image" className="zz-lightbox-prev" onClick={() => setActive((active - 1 + items.length) % items.length)} type="button">←</button><Image alt={`Zuru Zuru gallery ${active + 1}`} height={900} src={image(items[active].asset)} width={900} /><button aria-label="Next image" className="zz-lightbox-next" onClick={() => setActive((active + 1) % items.length)} type="button">→</button></div>}</>
}

export type MenuItem = { category: string; description: string; image: string; japanese: string; name: string; price: string }

export function MenuBrowser({ items }: { items: MenuItem[] }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => items.filter((item) => (filter === 'all' || item.category === filter) && `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [filter, items, query])
  return <><div className="zz-menu-controls"><label className="zz-menu-search"><Icon name="search" /><input aria-label="Search menu" onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes..." value={query} /></label><div className="zz-filter-buttons">{[['all','All'],['sushi','Sushi & Sashimi'],['ramen','Ramen'],['tempura','Tempura'],['yakitori','Yakitori'],['dessert','Desserts'],['drinks','Drinks']].map(([value,label]) => <button className={filter === value ? 'zz-active' : ''} key={value} onClick={() => setFilter(value)} type="button">{label}</button>)}</div></div><section className="zz-menu-section"><div className="zz-menu-grid">{visible.map((item) => <article className="zz-menu-item" key={`${item.name}-${item.price}`}><div className="zz-menu-item-img"><Image alt={item.name} fill sizes="(max-width: 700px) 100vw, 33vw" src={image(item.image)} /></div><div className="zz-menu-item-content"><div className="zz-menu-item-header"><h3>{item.name}</h3><strong>{item.price}</strong></div><span className="zz-japanese-name">{item.japanese}</span><p>{item.description}</p></div></article>)}</div>{visible.length === 0 && <p className="zz-no-results">No menu items match your search.</p>}</section></>
}
