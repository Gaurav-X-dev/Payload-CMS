type DBNameContext = {
  tableName?: string
}

export const pageBlockVisibilityDBName = ({
  tableName = 'pages_blocks_unknown_block_settings',
}: DBNameContext): string => {
  const blockName = tableName
    .replace(/^_?pages(?:_v)?_blocks_/, '')
    .replace(/_block_settings$/, '')

  return `page_${blockName || 'unknown'}_vis`
}
