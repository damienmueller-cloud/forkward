import { useEffect, useState } from 'react'
import { createAfterPreview, loadImageFromFile } from '../lib/imageTransform'

export function Reflect() {
  const [file, setFile] = useState<File | null>(null)
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null)
  const [afterUrl, setAfterUrl] = useState<string | null>(null)
  const [kgLoss, setKgLoss] = useState(10)
  const [pushups, setPushups] = useState(20)
  const [situps, setSitups] = useState(30)
  const [days, setDays] = useState(90)
  const [consentAge, setConsentAge] = useState(false)
  const [consentPhoto, setConsentPhoto] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [heicNote, setHeicNote] = useState(false)

  useEffect(() => {
    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl)
    }
  }, [beforeUrl])

  async function onFile(f: File | null) {
    setError(null)
    setAfterUrl(null)
    setHeicNote(false)
    if (!f) return

    const isHeic =
      f.type === 'image/heic' ||
      f.type === 'image/heif' ||
      /\.heic$/i.test(f.name) ||
      /\.heif$/i.test(f.name)

    if (isHeic) {
      setHeicNote(true)
      setError(
        'HEIC detected. This browser MVP needs JPG, PNG, or WebP. On iPhone: Settings → Camera → Formats → Most Compatible, or share/export as JPEG first.',
      )
      setFile(null)
      setBeforeUrl(null)
      return
    }

    try {
      // Validate loadable
      await loadImageFromFile(f)
      if (beforeUrl) URL.revokeObjectURL(beforeUrl)
      setFile(f)
      setBeforeUrl(URL.createObjectURL(f))
    } catch {
      setError('Could not read that image. Try JPG, PNG, or WebP.')
      setFile(null)
      setBeforeUrl(null)
    }
  }

  async function runStudy() {
    if (!file || !consentAge || !consentPhoto) return
    setBusy(true)
    setError(null)
    try {
      const img = await loadImageFromFile(file)
      const dataUrl = await createAfterPreview(img, {
        kgLoss,
        pushups,
        situps,
      })
      setAfterUrl(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transform failed')
    } finally {
      setBusy(false)
    }
  }

  const canRun = Boolean(file && consentAge && consentPhoto && !busy)

  return (
    <div>
      <section className="border-b border-navy/10 bg-cream-warm">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="eyebrow flex items-center gap-2 text-navy/50">
            <span className="h-2 w-2 rounded-full bg-coral" />
            Your private studio · Reflect AI
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight text-navy sm:text-5xl">
            Build a plan
            <br />
            you can
            <br />
            <span className="text-violet">repeat.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy/70">
            Choose a timeframe and practical movement context. Your study is a
            conceptual visual prompt — not a medical outcome, alcohol outcome,
            or promise. Original photos are not retained on a server in this
            MVP.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy">
            🔒 Original not retained
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Mirror photo</h2>
          <p className="mt-2 text-sm text-navy/65">
            Upload JPG, PNG, or WebP. HEIC (Apple default) is noted below —
            convert to JPEG for this MVP browser canvas.
          </p>
          {heicNote && (
            <p className="disclaimer mt-4 text-navy">
              HEIC support note: iOS photos are often HEIC. Export as JPEG
              before upload so the after-preview canvas can process the image.
            </p>
          )}
          <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-violet/30 bg-violet/5 px-4 py-8">
            <span className="font-semibold text-violet">Choose mirror photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {error && (
            <p className="mt-3 text-sm font-medium text-coral">{error}</p>
          )}
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Weight-loss scope</h2>
          <p className="mt-1 text-sm text-navy/60">
            Conceptual target: <strong>{kgLoss} kg</strong> (1–50 kg)
          </p>
          <input
            type="range"
            min={1}
            max={50}
            value={kgLoss}
            onChange={(e) => setKgLoss(Number(e.target.value))}
            className="mt-4 w-full accent-violet"
          />
          <div className="mt-2 flex justify-between text-xs text-navy/45">
            <span>1 kg</span>
            <span>50 kg</span>
          </div>

          <label className="mt-6 block text-sm font-bold">
            Timeframe (days)
            <input
              type="number"
              min={14}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-navy/15 px-3 py-2 font-normal"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Routine sliders</h2>
          <label className="mt-4 block text-sm font-bold">
            Push-ups / day: {pushups}
            <input
              type="range"
              min={0}
              max={100}
              value={pushups}
              onChange={(e) => setPushups(Number(e.target.value))}
              className="mt-2 w-full accent-lime"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Sit-ups / day: {situps}
            <input
              type="range"
              min={0}
              max={100}
              value={situps}
              onChange={(e) => setSitups(Number(e.target.value))}
              className="mt-2 w-full accent-coral"
            />
          </label>
          <p className="mt-3 text-xs text-navy/55">
            Higher routine + larger kg target increases the strength of the
            conceptual after transform ({days} day study framing).
          </p>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Consents</h2>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentAge}
              onChange={(e) => setConsentAge(e.target.checked)}
            />
            <span>I am 18 years or older.</span>
          </label>
          <label className="mt-3 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentPhoto}
              onChange={(e) => setConsentPhoto(e.target.checked)}
            />
            <span>
              This is my photo (or I have permission to use it). I understand
              this is a conceptual visual study, not medical advice.
            </span>
          </label>
          <button
            type="button"
            className="btn-lime mt-6 w-full sm:w-auto"
            disabled={!canRun}
            onClick={runStudy}
          >
            {busy ? 'Generating after…' : 'Generate conceptual after'}
          </button>
        </div>

        {(beforeUrl || afterUrl) && (
          <div className="rounded-2xl border border-navy/10 bg-navy p-6 text-cream shadow-sm">
            <h2 className="font-display text-xl text-lime">
              Before / after study
            </h2>
            <p className="mt-1 text-xs text-cream/60">
              The after image is intentionally transformed so you can see a
              clear difference (contrast, midsection sculpt, labelled strip).
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <figure>
                <figcaption className="mb-2 text-xs font-bold uppercase tracking-wide text-coral">
                  Before
                </figcaption>
                {beforeUrl ? (
                  <img
                    src={beforeUrl}
                    alt="Before mirror photo"
                    className="w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-white/5 text-sm text-cream/40">
                    Upload a photo
                  </div>
                )}
              </figure>
              <figure>
                <figcaption className="mb-2 text-xs font-bold uppercase tracking-wide text-lime">
                  After (conceptual)
                </figcaption>
                {afterUrl ? (
                  <img
                    src={afterUrl}
                    alt="Conceptual after preview"
                    className="w-full rounded-xl object-cover ring-2 ring-lime"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-white/5 text-sm text-cream/40">
                    Run the study to see a visible change
                  </div>
                )}
              </figure>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
