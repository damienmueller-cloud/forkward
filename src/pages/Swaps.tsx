import { useMemo, useState } from 'react'
import {
  alcoholDisclaimer,
  productSuggestions,
  swapCatalogue,
  type SwapItem,
} from '../data/swaps'

export function Swaps() {
  const [habitId, setHabitId] = useState(swapCatalogue[0].id)
  const [category, setCategory] = useState<'all' | SwapItem['category']>('all')

  const filtered = useMemo(
    () =>
      category === 'all'
        ? swapCatalogue
        : swapCatalogue.filter((s) => s.category === category),
    [category],
  )

  const selected =
    filtered.find((s) => s.id === habitId) ?? filtered[0] ?? swapCatalogue[0]

  return (
    <div>
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <p className="eyebrow text-lime">Swaps program</p>
          <h1 className="font-display mt-3 text-3xl sm:text-5xl">
            How much if I swapped{' '}
            <span className="text-coral">X</span> for{' '}
            <span className="text-lime">Y</span>?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/75">
            Built for Australian diets common around ages 40–50 — beer and
            alcohol, potatoes, chips, rice, pasta. Start with the swap you can
            repeat. Educational estimates only — not medical advice.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <div className="disclaimer text-navy">
          <strong>Alcohol:</strong> {alcoholDisclaimer}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['alcohol', 'Alcohol'],
              ['carbs', 'Carbs'],
              ['snacks', 'Snacks'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setCategory(id)
                const next =
                  id === 'all'
                    ? swapCatalogue[0]
                    : swapCatalogue.find((s) => s.category === id)
                if (next) setHabitId(next.id)
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                category === id
                  ? 'bg-violet text-white'
                  : 'bg-warm/50 text-navy/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <ul className="space-y-2">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setHabitId(s.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                    selected.id === s.id
                      ? 'bg-navy text-lime'
                      : 'bg-white border border-navy/10 text-navy hover:bg-navy/5'
                  }`}
                >
                  {s.habit}
                </button>
              </li>
            ))}
          </ul>

          <article className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <p className="eyebrow text-violet">{selected.category}</p>
            <h2 className="font-display mt-2 text-2xl text-navy">
              {selected.habit}
            </h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="font-bold text-navy/50">Typical weekly pattern</dt>
                <dd className="mt-1">{selected.typicalWeekly}</dd>
              </div>
              <div>
                <dt className="font-bold text-navy/50">Swap for</dt>
                <dd className="mt-1 font-semibold text-violet">
                  {selected.swapFor}
                </dd>
              </div>
              <div className="rounded-xl bg-lime/20 p-4">
                <dt className="font-bold text-navy">How much if I swapped…</dt>
                <dd className="mt-2 leading-relaxed">{selected.howMuch}</dd>
              </div>
              <div>
                <dt className="font-bold text-navy/50">Rough weekly impact</dt>
                <dd className="mt-1 leading-relaxed">{selected.roughImpact}</dd>
              </div>
              <div>
                <dt className="font-bold text-navy/50">Stick tip</dt>
                <dd className="mt-1">{selected.tip}</dd>
              </div>
            </dl>
            {selected.alcoholDisclaimer && (
              <p className="disclaimer mt-6 text-navy">
                This card involves alcohol. See the full disclaimer above. Seek
                professional help if cutting back feels unsafe.
              </p>
            )}
          </article>
        </div>

        <section className="rounded-2xl bg-navy p-6 text-cream sm:p-8">
          <p className="eyebrow text-coral">Comparable suggestions</p>
          <h2 className="font-display mt-2 text-2xl">
            Training & recovery style products
          </h2>
          <p className="mt-2 text-sm text-cream/70">
            Generic comparable ideas only — no real company brand names. Think
            creatine gummies, liver-support style courses, and sugar-free
            electrolyte drinks as category examples.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {productSuggestions.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="font-display text-base text-lime">{p.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-cream/75">
                  {p.why}
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-coral">
                  Pairs with: {p.pairsWith}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
