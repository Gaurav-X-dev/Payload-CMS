// Re-exports the single shared normalizer (see src/lib/site/normalizePathname.ts) — kept as a
// thin re-export here so every existing import of this theme-scoped path keeps working
// unchanged, while all 3 themes now share one consistent, tested implementation (P7).
export { normalizePathname } from '../../../lib/site/normalizePathname'
