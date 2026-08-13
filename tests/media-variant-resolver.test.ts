import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { resolveMediaVariantUrl } from '../src/lib/media/resolveMediaVariant.ts'

describe('resolveMediaVariantUrl (pure, no DB)', () => {
  test('prefers the requested size variant when it has a real URL', () => {
    const media = {
      sizes: { card: { url: '/api/media/file/photo-768x1024.jpg' } },
      url: '/api/media/file/photo.png',
    }
    assert.equal(resolveMediaVariantUrl(media, 'card'), '/api/media/file/photo-768x1024.jpg')
  })

  test('falls back to the original URL when the requested variant has no url (Payload could not generate it)', () => {
    const media = {
      sizes: { hero: { url: null } },
      url: '/api/media/file/photo.png',
    }
    assert.equal(resolveMediaVariantUrl(media, 'hero'), '/api/media/file/photo.png')
  })

  test('falls back to the original URL for legacy media with no sizes object at all', () => {
    const media = { url: '/api/media/file/legacy.png' }
    assert.equal(resolveMediaVariantUrl(media, 'card'), '/api/media/file/legacy.png')
  })

  test('returns undefined for null/undefined media (never throws)', () => {
    assert.equal(resolveMediaVariantUrl(null, 'card'), undefined)
    assert.equal(resolveMediaVariantUrl(undefined, 'og'), undefined)
  })

  test('returns undefined when neither the variant nor the original URL exist', () => {
    assert.equal(resolveMediaVariantUrl({}, 'thumbnail'), undefined)
  })

  test('works identically for an already-absolute (S3/R2) URL — passes it through unchanged', () => {
    const media = {
      sizes: { og: { url: 'https://bucket.r2.cloudflarestorage.com/photo-1200x630.jpg' } },
      url: 'https://bucket.r2.cloudflarestorage.com/photo.png',
    }
    assert.equal(
      resolveMediaVariantUrl(media, 'og'),
      'https://bucket.r2.cloudflarestorage.com/photo-1200x630.jpg',
    )
  })

  test('each of the 4 size contexts resolves its own matching variant independently', () => {
    const media = {
      sizes: {
        card: { url: '/card.jpg' },
        hero: { url: '/hero.jpg' },
        og: { url: '/og.jpg' },
        thumbnail: { url: '/thumb.jpg' },
      },
      url: '/original.png',
    }
    assert.equal(resolveMediaVariantUrl(media, 'card'), '/card.jpg')
    assert.equal(resolveMediaVariantUrl(media, 'hero'), '/hero.jpg')
    assert.equal(resolveMediaVariantUrl(media, 'og'), '/og.jpg')
    assert.equal(resolveMediaVariantUrl(media, 'thumbnail'), '/thumb.jpg')
  })
})
