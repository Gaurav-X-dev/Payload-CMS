// Re-exports the single shared normalizer (see src/lib/site/normalizePathname.ts) — this was
// the original source of the now-shared behavior; kept as a thin re-export here so every
// existing import of this theme-scoped path keeps working unchanged (P7).
export { normalizePathname } from '../../../lib/site/normalizePathname'
