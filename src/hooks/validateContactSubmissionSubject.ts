import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'
import { normalizeTenantID, resolveTrustedTenantID } from '../access/tenantContext'
import { DEFAULT_CONTACT_SUBJECT_OPTIONS } from '../validation/contactPage'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const rejectSubject = (message: string): never => {
  throw new ValidationError({ errors: [{ message, path: 'subject' }] })
}

export const configuredContactSubjects = (pages: unknown[]): string[] => {
  const configured: string[] = []
  for (const pageValue of pages) {
    const page = record(pageValue)
    const layout = Array.isArray(page?.layout) ? page.layout : []
    for (const blockValue of layout) {
      const block = record(blockValue)
      if (block?.blockType !== 'formBlock' || block.enabled === false) continue
      const options = Array.isArray(block.subjectOptions) ? block.subjectOptions : []
      for (const optionValue of options) {
        const option = record(optionValue)
        const value = text(option?.value)
        if (value) configured.push(value)
      }
    }
  }

  const values = configured.length
    ? configured
    : DEFAULT_CONTACT_SUBJECT_OPTIONS.map((option) => option.value)
  return [...new Map(values.map((value) => [value.toLocaleLowerCase('en-IN'), value])).values()]
}

export const validateContactSubmissionSubject: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (!data || operation !== 'create') return data
  const subject = text(data.subject)
  if (!subject) return rejectSubject('Choose a valid enquiry subject.')
  if (subject.length > 80) return rejectSubject('Subject must not exceed 80 characters.')

  data.subject = subject
  if (subject === 'Newsletter Signup') return data

  const tenantID = normalizeTenantID(data.tenantId) ?? await resolveTrustedTenantID(req)
  if (!tenantID) return rejectSubject('The enquiry tenant could not be verified.')

  const result = await req.payload.find({
    collection: 'pages',
    depth: 0,
    draft: false,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    select: { layout: true },
    where: {
      and: [
        { tenantId: { equals: tenantID } },
        { _status: { equals: 'published' } },
        { pageType: { in: ['contact', 'catering'] } },
      ],
    },
  } as never) as { docs: unknown[] }
  const allowed = configuredContactSubjects(result.docs)
  if (!allowed.some((value) => value.toLocaleLowerCase('en-IN') === subject.toLocaleLowerCase('en-IN'))) {
    return rejectSubject('Choose one of the configured enquiry subjects.')
  }
  return data
}

