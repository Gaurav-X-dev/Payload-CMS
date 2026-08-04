import { validateFiniteInteger } from './shared'
import { isGheeRoastIconName } from '../themes/ghee-roast/iconRegistry'

type OrderedRow = Record<string, unknown>

const asRows = (value: unknown): OrderedRow[] =>
  Array.isArray(value)
    ? value.filter((row): row is OrderedRow => Boolean(row && typeof row === 'object'))
    : []

const rowName = (row: OrderedRow, index: number, field: 'label' | 'title'): string => {
  const value = row[field]
  return typeof value === 'string' && value.trim() ? value.trim() : `Row ${index + 1}`
}

const validateUniqueSortOrders = (
  rows: OrderedRow[],
  nameField: 'label' | 'title',
  noun: string,
): true | string => {
  const used = new Map<number, string>()

  for (const [index, row] of rows.entries()) {
    const order = row.sortOrder
    const integerResult = validateFiniteInteger(order, { min: 0, max: 1_000_000 })
    if (integerResult !== true) {
      return `${noun} "${rowName(row, index, nameField)}": ${integerResult}`
    }

    const currentName = rowName(row, index, nameField)
    const existingName = used.get(order as number)
    if (existingName) {
      return `Sort Order ${order} is already used by "${existingName}". Choose a unique Sort Order for "${currentName}".`
    }
    used.set(order as number, currentName)
  }

  return true
}

export const validateBrandFeatureRows = (value: unknown): true | string => {
  const rows = asRows(value)
  if (rows.length > 5) {
    return 'A maximum of 5 Brand Features is allowed.'
  }

  for (const [index, row] of rows.entries()) {
    const name = rowName(row, index, 'title')
    if (row.enabled !== undefined && typeof row.enabled !== 'boolean') {
      return `Brand Feature "${name}": Enabled must be true or false.`
    }

    const title = typeof row.title === 'string' ? row.title.trim() : ''
    if (title.length < 2 || title.length > 60) {
      return `Brand Feature "${name}": Title must contain 2 to 60 characters.`
    }

    const description = typeof row.description === 'string' ? row.description.trim() : ''
    if (description.length < 5 || description.length > 180) {
      return `Brand Feature "${name}": Description must contain 5 to 180 characters.`
    }

    const iconSource = row.iconSource ?? 'built-in'
    if (iconSource !== 'built-in' && iconSource !== 'custom-svg') {
      return `Brand Feature "${name}": choose Built-in Icon or Custom SVG.`
    }
    if (iconSource === 'built-in' && !isGheeRoastIconName(row.icon)) {
      return `Brand Feature "${name}": choose a supported Built-in Icon.`
    }
    if (iconSource === 'custom-svg' && (
      row.customSVG === null
      || row.customSVG === undefined
      || row.customSVG === ''
    )) {
      return `Brand Feature "${name}": select a Custom SVG Icon.`
    }
  }

  return validateUniqueSortOrders(rows, 'title', 'Brand Feature')
}

export const validateNavTopLevelSortOrders = (value: unknown): true | string =>
  validateUniqueSortOrders(
    asRows(value).filter((row) => row.blockType === 'link'),
    'label',
    'Navigation item',
  )

export const validateNavChildSortOrders = (value: unknown): true | string =>
  validateUniqueSortOrders(asRows(value), 'label', 'Child navigation item')
