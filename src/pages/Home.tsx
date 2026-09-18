import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div>
      {/* Hero — Forkward brand + Pantry Lens CTA */}
      <section className="relative overflow-hidden bg-navy text-cream">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full border-[18px] border-lime/90 opacity-90" />
        <div
          className="pointer-events-none absolute bottom-0 right-0 hidden text-[10px] tracking-[0.35em] text-cream/40 sm:block"
          style={{ writingMode: 'vertical-rl' }}
        >
          OPEN / COOK / SHARE
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="eyebrow flex items-center gap-2 text-coral">
              <span className="inline-block h-2 w-2 rounded-full bg-lime" />
              Private cooking companion
            </p>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              See your food{' '}
              <span className="text-lime">with fresh eyes.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80 sm:text-lg">
              Turn up to four fridge, freezer, pantry, cupboard, or bench photos
              into three practical recipes made around what you already have.
              First, you confirm the ingredients — because a photo should never
              guess for you.
            </p>
            <ul className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
              <li className="flex items-center gap-2">
                <span className="text-lime">✓</span> Australia-relevant pantry
                ideas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lime">✓</span> Australian + Filipino
                cultural cues
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lime">✓</span> Your photos are not saved
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pantry" className="btn-lime">
                Open Pantry Lens
              </Link>
              <Link to="/swaps" className="btn-ghost">
                Browse swaps
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rotate-3 rounded-3xl bg-violet" />
            <div className="relative -rotate-2 overflow-hidden rounded-3xl border-4 border-cream bg-coral p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-16 flex-1 rounded-xl bg-cream/90" />
                  <div className="h-16 flex-1 rounded-xl bg-lime" />
                </div>
                <div className="h-2 rounded bg-navy/80" />
                <div className="flex gap-3">
                  <div className="h-20 flex-1 rounded-xl bg-violet" />
                  <div className="h-20 flex-1 rounded-xl bg-cream/80" />
                  <div className="h-20 w-16 rounded-xl bg-navy" />
                </div>
                <div className="h-2 rounded bg-navy/80" />
                <p className="text-center font-display text-sm text-cream">
                  Pantry Lens
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-3 bg-violet" />
      </section>

      {/* How Pantry Lens works */}
      <section
        id="how-it-works"
        className="border-b border-navy/10 bg-cream-warm"
        aria-label="How Pantry Lens works"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="eyebrow text-violet">The Forkward food path</p>
          <h2 className="font-display mt-2 text-3xl text-navy sm:text-4xl">
            How Pantry Lens works
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy/70">
            Privacy-first. Up to four kitchen views · about 15 MB each. We will
            not guess hidden items, quantities, expiry dates, allergens, food
            safety, or nutrition facts.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-3">
            <JourneyStep
              n="01"
              title="Photos"
              body="Photograph the fridge, freezer, pantry, cupboard, or bench (up to four views). JPG, PNG, WebP, or HEIC · ~15 MB each. Photos stay in-session only."
            />
            <JourneyStep
              n="02"
              title="Confirm"
              body="Edit a starter ingredient list — confirm what you see. Add avoid-ingredients and culture cues before anything is cooked up."
            />
            <JourneyStep
              n="03"
              title="Recipes"
              body="Get three practical Australian, Filipino, or fusion cards around what you confirmed — plus optional shopping-list gaps."
            />
          </ol>
          <div className="mt-8">
            <Link to="/pantry" className="btn-lime">
              Open Pantry Lens
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="eyebrow text-violet">How Forkward helps</p>
        <h2 className="font-display mt-2 text-3xl text-navy sm:text-4xl">
          Practical moves you can repeat.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <FeatureCard
            to="/pantry"
            accent="lime"
            title="Pantry Lens"
            body="Upload kitchen photos, confirm ingredients, pick Aussie or Filipino cues, get three recipe cards."
          />
          <FeatureCard
            to="/swaps"
            accent="violet"
            title="Swaps program"
            body="Beer, potatoes, chips, rice, pasta — see “how much if I swapped X for Y” with clear alcohol disclaimers."
          />
          <FeatureCard
            to="/reflect"
            accent="coral"
            title="Reflect AI"
            body="A separate studio for conceptual before/after visual studies. Not the home hero — open it on its own route."
          />
        </div>
      </section>

      {/* Reflect callout — separate product */}
      <section className="border-y border-navy/10 bg-cream-warm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="eyebrow text-coral">● Separate product</p>
            <h2 className="font-display mt-2 text-2xl text-navy sm:text-3xl">
              Reflect AI is available as a{' '}
              <span className="text-violet">standalone</span> studio.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-navy/70">
              Mirror photo upload, routine sliders, and a conceptual after
              preview. Educational visualisation — not a medical prediction.
            </p>
          </div>
          <Link to="/reflect" className="btn-violet shrink-0">
            Open Reflect AI
          </Link>
        </div>
      </section>
    </div>
  )
}

function JourneyStep({
  n,
  title,
  body,
}: {
  n: string
  title: string
  body: string
}) {
  return (
    <li className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
      <span className="font-display text-2xl text-lime drop-shadow-[0_0_0_#101223]">
        <span className="rounded-lg bg-navy px-2 py-0.5 text-lime">{n}</span>
      </span>
      <h3 className="font-display mt-4 text-xl text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy/70">{body}</p>
    </li>
  )
}

function FeatureCard({
  to,
  title,
  body,
  accent,
}: {
  to: string
  title: string
  body: string
  accent: 'lime' | 'violet' | 'coral'
}) {
  const bar =
    accent === 'lime'
      ? 'bg-lime'
      : accent === 'violet'
        ? 'bg-violet'
        : 'bg-coral'
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`mb-4 h-1.5 w-12 rounded-full ${bar}`} />
      <h3 className="font-display text-xl text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy/70">{body}</p>
      <span className="mt-4 inline-block text-sm font-bold text-violet group-hover:underline">
        Open →
      </span>
    </Link>
  )
}
