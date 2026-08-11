const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

export type TemplateVariables = Record<string, string>

/**
 * Controlled placeholder substitution only — no eval, no Function(), no executable
 * expressions. Unknown placeholders are left in the output verbatim so a typo or an
 * unavailable variable (e.g. {{password}} in a Forgot Password template) is visibly
 * detectable rather than silently disappearing.
 */
const substitute = (template: string, variables: TemplateVariables): string =>
  template.replace(PLACEHOLDER_PATTERN, (match, key: string) =>
    Object.hasOwn(variables, key) ? variables[key] : match,
  )

export const renderPlainText = (template: string, variables: TemplateVariables): string =>
  substitute(template, variables)

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Renders an admin-authored plain-text template body into safe inline HTML: the body
 * text itself is escaped first (so a stray "<script>" typed into a textarea can never
 * become live markup), then placeholder values are escaped and substituted, then line
 * breaks become <br>.
 */
export const renderHtmlFromPlainText = (template: string, variables: TemplateVariables): string => {
  const escapedVariables = Object.fromEntries(
    Object.entries(variables).map(([key, value]) => [key, escapeHtml(value)]),
  )
  const escapedTemplate = escapeHtml(template)
  const withPlaceholders = substitute(escapedTemplate, escapedVariables)
  return withPlaceholders.replace(/\r\n|\r|\n/g, '<br />')
}
