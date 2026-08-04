# Deprecated Ghee Roast static content

The files in this directory are retained temporarily as conversion reference
and for rollback while the existing Ghee Roast tenant is populated in Payload.
Normal public rendering does not import or merge this business content.

For a short-lived local comparison only, whole legacy pages can be enabled with
`ENABLE_GHEE_ROAST_LEGACY_FALLBACKS=true`. The flag is disabled by default and
is always ignored when `NODE_ENV=production`.

Delete this directory only after the Ghee Roast CMS population has been fully
verified and the compatibility path has been retired.
