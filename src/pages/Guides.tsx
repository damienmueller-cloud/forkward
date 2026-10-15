import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import data from '../data/guides.json'

type Section = { h: string; p?: string[]; li?: string[] }
type Guide = { slug: string; title: string; description: string; sections: Section[] }
const guides = data.guides as Guide[]

function Disclaimer() {
  return (
    <p className="mt-10 rounded-xl border border-navy/10 bg-navy/5 p-4 text-xs leading-relaxed text-navy/70">
      <strong>Not medical advice.</strong> Forkward guides are general,
      educational information only. They are not medical, dietary,
      allergen-safety or food-safety advice. For advice about your health or
      diet, talk to your GP or an Accredited Practising Dietitian.
    </p>
  )
}

export function GuidesIndex() {
  useEffect(() => {
    document.title = 'Healthy eating guides | Forkward'
  }, [])
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="eyebrow text-violet">Guides</p>
      <h1 className="font-display mt-2 text-4xl text-navy">Everyday food guides</h1>
      <p className="mt-4 text-sm text-navy/80">
        Practical, plain-English guides for cooking and eating well in
        Australia, from pantry photos to Filipino favourites.
      </p>
      <ul className="mt-8 space-y-4">
        {guides.map((g) => (
          <li key={g.slug} className="rounded-xl border border-navy/10 p-4">
            <Link to={`/guides/${g.slug}`} className="font-display text-lg text-navy underline-offset-4 hover:underline">
              {g.title}
            </Link>
            <p className="mt-1 text-sm text-navy/70">{g.description}</p>
          </li>
        ))}
      </ul>
      <Disclaimer />
    </div>
  )
}

export function GuidePage() {
  const { slug } = useParams()
  const g = guides.find((x) => x.slug === slug)
  useEffect(() => {
    if (g) document.title = `${g.title} | Forkward`
  }, [g])
  if (!g) return <Navigate to="/guides" replace />
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/guides" className="eyebrow text-violet">← All guides</Link>
      <h1 className="font-display mt-2 text-4xl text-navy">{g.title}</h1>
      <p className="mt-4 text-base text-navy/80">{g.description}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-navy/80">
        {g.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl text-navy">{s.h}</h2>
            {s.p?.map((t) => <p key={t} className="mt-2">{t}</p>)}
            {s.li && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {s.li.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/pantry" className="btn-lime">Try Pantry Lens</Link>
        <Link to="/swaps" className="underline">Explore swaps</Link>
      </div>
      <Disclaimer />
    </article>
  )
}
