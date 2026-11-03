import type { ReactNode } from 'react'

/**
 * Minimal, safe Markdown subset for blog posts: ## / ### headings, paragraphs, "- " lists, "> " quotes,
 * **bold**, *italic* and [links](https://...). Rendered as React elements, so raw HTML is never interpreted.
 */
export function safeHref(href: string): string | null {
  const h = href.trim()
  if (/^https?:\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h)) return h
  if (/^\/(?!\/)/.test(h)) return h
  return null
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyBase}-${i++}`
    if (m[1]) out.push(<strong key={key}>{m[1]}</strong>)
    else if (m[2]) out.push(<em key={key}>{m[2]}</em>)
    else if (m[3] && m[4]) {
      const href = safeHref(m[4])
      const external = href?.startsWith('http')
      out.push(
        href ? (
          <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
            {m[3]}
          </a>
        ) : (
          m[3]
        ),
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <>
      {blocks.map((raw, bi) => {
        const block = raw.trim()
        const k = `b${bi}`
        if (!block) return null
        if (block.startsWith('### ')) return <h3 key={k}>{inline(block.slice(4), k)}</h3>
        if (block.startsWith('## ')) return <h2 key={k}>{inline(block.slice(3), k)}</h2>
        const lines = block.split('\n')
        if (lines.every((l) => /^[-*] /.test(l.trim())))
          return (
            <ul key={k}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.trim().slice(2), `${k}-${li}`)}</li>
              ))}
            </ul>
          )
        if (lines.every((l) => l.trim().startsWith('>')))
          return <blockquote key={k}>{inline(lines.map((l) => l.replace(/^\s*>\s?/, '')).join(' '), k)}</blockquote>
        return <p key={k}>{inline(lines.join(' '), k)}</p>
      })}
    </>
  )
}
