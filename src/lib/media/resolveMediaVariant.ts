// Shared, theme-agnostic media size-variant resolver. Payload already generates 4 resized
// variants on every Media upload (see src/collections/Media.ts: thumbnail 400x300, card
// 768x1024, hero 1920x1080, og 1200x630), but every theme's mapper previously hardcoded the
// original upload URL, ignoring them — meaning every image shipped at full original size
// regardless of how large it actually needed to be on screen (see M3 performance audit).
//
// This resolver picks the size variant that semantically matches how the image is being used,
// falling back gracefully to the original file when that variant doesn't exist (legacy media
// uploaded before variants existed, a variant Payload couldn't generate for a very small source
// image, etc.) — never a broken image, never a forced "always use card" replacement.
//
// Deliberately NOT used by src/lib/mail/tenantMailContext.ts — email logo resolution has its own
// independent, already-correct URL/data-URI logic and is out of scope for this change.

export type MediaSizeContext = 'card' | 'hero' | 'og' | 'thumbnail'

type MediaSizeVariant = {
  url?: null | string
} | null | undefined

export type MediaLikeValue = {
  sizes?: {
    card?: MediaSizeVariant
    hero?: MediaSizeVariant
    og?: MediaSizeVariant
    thumbnail?: MediaSizeVariant
  } | null
  url?: null | string
}

// Returns the best available URL for the given media document and usage context. Pass no
// context (or omit this call entirely) to keep using the original file, unchanged from today's
// behavior — this never runs unless a call site explicitly opts a specific image into a variant.
export const resolveMediaVariantUrl = (
  media: MediaLikeValue | null | undefined,
  context: MediaSizeContext,
): string | undefined => {
  if (!media) return undefined
  const variantUrl = media.sizes?.[context]?.url
  if (typeof variantUrl === 'string' && variantUrl) return variantUrl
  return typeof media.url === 'string' && media.url ? media.url : undefined
}
