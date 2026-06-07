const modules = import.meta.glob('../../../docs/mariage/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function getMariageKnowledge(): string {
  const entries = Object.entries(modules)
  if (entries.length === 0) return ''

  return entries
    .map(([filePath, content]) => {
      const fileName = filePath.split('/').pop() ?? filePath
      const trimmed = (content ?? '').trim()
      if (!trimmed) return null
      return `--- ${fileName} ---\n\n${trimmed}`
    })
    .filter(Boolean)
    .join('\n\n')
}
