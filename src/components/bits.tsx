import { fold } from '../lib'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { setLang } from '../i18n'

export function LangToggle() {
  const { t, i18n } = useTranslation()
  return (
    <div className="rl-seg" role="group" aria-label={t('lang.label')}>
      {(['en', 'es'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={i18n.language === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

const HUES = ['#3340F2', '#0F9D74', '#7B5CF0', '#E39A12', '#D6455D']
const hue = (s: string) => HUES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length]
const initials = (s: string) => {
  const p = s.split('@')[0]!.split(/[\s._]/)
  return (p.length > 1 ? p[0]![0]! + p[1]![0]! : p[0]!.slice(0, 2)).toUpperCase()
}
export const nameOf = (email: string) => email.split('@')[0]!.replace(/[._]/g, ' ')

export const Avatar = ({ who }: { who: string }) => (
  <span className="avatar" style={{ '--c': hue(who) } as React.CSSProperties}>{initials(who)}</span>
)

export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const q = terms.map(fold).filter(Boolean)
  const f = fold(text)
  const hits: [number, number][] = []
  for (const term of q) for (let i = f.indexOf(term); i > -1; i = f.indexOf(term, i + term.length)) hits.push([i, i + term.length])
  if (!hits.length) return text
  hits.sort((a, b) => a[0] - b[0])
  const merged = [hits[0]!]
  for (const h of hits.slice(1)) {
    const last = merged[merged.length - 1]!
    if (h[0] <= last[1]) last[1] = Math.max(last[1], h[1])
    else merged.push(h)
  }
  let p = 0
  return (
    <>
      {merged.map(([a, b]) => {
        const before = text.slice(p, a)
        p = b
        return (
          <Fragment key={a}>
            {before}
            <mark className="rl-mark">{text.slice(a, b)}</mark>
          </Fragment>
        )
      })}
      {text.slice(p)}
    </>
  )
}
