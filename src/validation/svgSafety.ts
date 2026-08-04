import sharp from 'sharp'

export const SVG_MIME_TYPE = 'image/svg+xml'
export const MAX_SVG_FILE_SIZE = 256 * 1024

const SAFE_SVG_ELEMENTS = new Set([
  'circle',
  'clippath',
  'defs',
  'desc',
  'ellipse',
  'g',
  'lineargradient',
  'line',
  'mask',
  'path',
  'polygon',
  'polyline',
  'radialgradient',
  'rect',
  'stop',
  'svg',
  'symbol',
  'title',
  'use',
])

type SVGUploadFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

export type SVGMediaDocument = {
  filename?: unknown
  mimeType?: unknown
  svgSanitized?: unknown
  url?: unknown
}

export class SVGValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SVGValidationError'
  }
}

const fail = (message: string): never => {
  throw new SVGValidationError(message)
}

const decodeNumericEntities = (value: string): string =>
  value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))

const hasSVGExtension = (filename: unknown): boolean =>
  typeof filename === 'string' && filename.toLowerCase().endsWith('.svg')

export const isSanitizedSVGMedia = (
  value: SVGMediaDocument | null | undefined,
  { requireURL = false }: { requireURL?: boolean } = {},
): boolean => Boolean(
  value
  && value.mimeType === SVG_MIME_TYPE
  && hasSVGExtension(value.filename)
  && value.svgSanitized === true
  && (!requireURL || (typeof value.url === 'string' && value.url.trim())),
)

export const sanitizeSVGContent = async (input: Buffer | string): Promise<Buffer> => {
  const source = (Buffer.isBuffer(input) ? input.toString('utf8') : input)
    .replace(/^\uFEFF/, '')
  if (!source.trim() || source.includes('\uFFFD')) fail('The SVG file is empty or is not valid UTF-8.')

  const sanitized = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*<\?xml[\s\S]*?\?>/i, '')
    .trim()

  if (!/^<svg(?:\s|>)[\s\S]*<\/svg>$/i.test(sanitized)) {
    fail('The file must contain one well-formed SVG root element.')
  }
  if ((sanitized.match(/<svg(?:\s|>)/gi) ?? []).length !== 1) {
    fail('Nested or multiple SVG roots are not allowed.')
  }
  if (/<!doctype|<!entity|<\?|<\s*(?:script|foreignObject|iframe|object|embed|image|audio|video|canvas|style|link|meta|animate|set)\b/i.test(sanitized)) {
    fail('The SVG contains an unsafe or executable element.')
  }
  if (/\son[a-z][\w:-]*\s*=/i.test(sanitized)) {
    fail('SVG event-handler attributes are not allowed.')
  }

  const inspection = decodeNumericEntities(sanitized)
  const withoutNamespaces = inspection
    .replace(/\sxmlns\s*=\s*(["'])http:\/\/www\.w3\.org\/2000\/svg\1/gi, '')
    .replace(/\sxmlns:xlink\s*=\s*(["'])http:\/\/www\.w3\.org\/1999\/xlink\1/gi, '')
  if (/javascript\s*:|vbscript\s*:|data\s*:|https?\s*:|\/\//i.test(withoutNamespaces)) {
    fail('External, executable, and data URLs are not allowed in SVG files.')
  }
  if (/@import|expression\s*\(|behavior\s*:|-moz-binding/i.test(inspection)) {
    fail('Unsafe SVG styling is not allowed.')
  }

  for (const match of inspection.matchAll(/<\s*\/?\s*([a-z][\w:-]*)\b/gi)) {
    if (!SAFE_SVG_ELEMENTS.has(match[1].toLowerCase())) {
      fail(`The SVG element <${match[1]}> is not supported.`)
    }
  }

  for (const match of inspection.matchAll(/(?:href|xlink:href)\s*=\s*(["'])(.*?)\1/gi)) {
    const target = match[2].replace(/[\u0000-\u0020\u007F]+/g, '')
    if (!target.startsWith('#')) fail('SVG references must point to an element inside the same file.')
  }
  for (const match of inspection.matchAll(/url\s*\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    const target = match[2].replace(/[\u0000-\u0020\u007F]+/g, '')
    if (!target.startsWith('#')) fail('SVG URL references must point to an element inside the same file.')
  }

  const sanitizedBuffer = Buffer.from(sanitized, 'utf8')
  try {
    const metadata = await sharp(sanitizedBuffer, {
      failOn: 'error',
      limitInputPixels: 4096 * 4096,
    }).metadata()
    if (metadata.format !== 'svg') fail('The uploaded file is not a valid SVG image.')
  } catch (error) {
    if (error instanceof SVGValidationError) throw error
    fail('The uploaded SVG is malformed and could not be parsed.')
  }

  return sanitizedBuffer
}

export const validateAndSanitizeSVGUpload = async (file: SVGUploadFile): Promise<Buffer | null> => {
  const svgMIME = file.mimetype.toLowerCase() === SVG_MIME_TYPE
  const svgExtension = hasSVGExtension(file.name)
  if (!svgMIME && !svgExtension) return null
  if (!svgMIME || !svgExtension) {
    fail('SVG uploads must use both the .svg extension and the image/svg+xml MIME type.')
  }
  if (file.size > MAX_SVG_FILE_SIZE || file.data.length > MAX_SVG_FILE_SIZE) {
    fail('SVG icons must be 256 KB or smaller.')
  }
  return sanitizeSVGContent(file.data)
}
