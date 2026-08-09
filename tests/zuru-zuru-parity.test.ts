import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildMobileNavOrder,
  splitDishName,
  splitLocationBadge,
  splitOmotenashiEmphasis,
  splitSeasonTitle,
  splitTitleMeta,
} from '../src/themes/zuru-zuru/utils/foldedTitles.ts'

// ---------------------------------------------------------------------------
// Milestone Z9 — design-parity title-splitting fixes
// ---------------------------------------------------------------------------

test('splitDishName splits on the first " · ", and passes through titles with no separator', () => {
  assert.deepEqual(splitDishName('Spicy Tuna Roll · スパイシーツナロール'), { japanese: 'スパイシーツナロール', name: 'Spicy Tuna Roll' })
  // A japanese reading that itself contains a parenthetical must stay attached to the japanese half.
  assert.deepEqual(splitDishName('Traditional Hot Sake · 熱燗 (Atsukan)'), { japanese: '熱燗 (Atsukan)', name: 'Traditional Hot Sake' })
  assert.deepEqual(splitDishName('No Separator Here'), { japanese: '', name: 'No Separator Here' })
})

test('splitSeasonTitle splits on the LAST " · " so the season+kanji portion (which itself contains one) stays intact', () => {
  assert.deepEqual(splitSeasonTitle('Spring · 春 · Sakura'), { name: 'Sakura', season: 'Spring · 春' })
  assert.deepEqual(splitSeasonTitle('Winter · 冬 · Fuyu'), { name: 'Fuyu', season: 'Winter · 冬' })
  assert.deepEqual(splitSeasonTitle('No Separator'), { name: '', season: 'No Separator' })
})

test('splitTitleMeta extracts a trailing "(...)" as meta (parens stripped) and leaves plain titles untouched', () => {
  assert.deepEqual(splitTitleMeta('Omotenashi (Hospitality from the Heart)'), { meta: 'Hospitality from the Heart', title: 'Omotenashi' })
  assert.deepEqual(splitTitleMeta('Express (₹75L – ₹1Cr)'), { meta: '₹75L – ₹1Cr', title: 'Express' })
  assert.deepEqual(splitTitleMeta('Silver Tier (₹4,500 / guest)'), { meta: '₹4,500 / guest', title: 'Silver Tier' })
  assert.deepEqual(splitTitleMeta('Respect & Culture'), { meta: '', title: 'Respect & Culture' })
})

test('splitLocationBadge splits on " — " for the newer locations, and passes the flagship (no separator) through unchanged', () => {
  assert.deepEqual(splitLocationBadge('Connaught Place, New Delhi — Open Now'), { badge: 'Open Now', name: 'Connaught Place, New Delhi' })
  assert.deepEqual(splitLocationBadge('Indiranagar, Bengaluru — Coming Soon (Dec 2026)'), { badge: 'Coming Soon (Dec 2026)', name: 'Indiranagar, Bengaluru' })
  assert.deepEqual(splitLocationBadge('23 Shahpur Jat, New Delhi'), { badge: '', name: '23 Shahpur Jat, New Delhi' })
})

test('splitOmotenashiEmphasis isolates the literal word "Omotenashi" so the renderer can wrap only that piece', () => {
  const parts = splitOmotenashiEmphasis('the Japanese philosophy of Omotenashi — hospitality from the heart.')
  assert.ok(parts.includes('Omotenashi'))
  assert.equal(parts.join(''), 'the Japanese philosophy of Omotenashi — hospitality from the heart.')
  assert.deepEqual(splitOmotenashiEmphasis('no mention of that word here'), ['no mention of that word here'])
})

test('buildMobileNavOrder reproduces the original mobileNavigation order: desktop set minus its last link, then extras, then that last link at the very end', () => {
  const allLinks = ['Home', 'Menu', 'Our Story', 'Chefs', 'Gallery', 'Reservations', 'Contact', 'Private Dining', 'Events', 'Blog']
  assert.deepEqual(
    buildMobileNavOrder(allLinks, 7),
    ['Home', 'Menu', 'Our Story', 'Chefs', 'Gallery', 'Reservations', 'Private Dining', 'Events', 'Blog', 'Contact'],
  )
})

test('buildMobileNavOrder is a no-op when there are no mobile-only extras beyond the desktop set', () => {
  const allLinks = ['A', 'B', 'C']
  assert.deepEqual(buildMobileNavOrder(allLinks, 3), ['A', 'B', 'C'])
})
