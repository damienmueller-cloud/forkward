import { useEffect, useMemo, useState } from 'react'
import {
  generateRecipes,
  type CultureCue,
  type RecipeCard,
  type RecipeIntent,
} from '../data/recipes'
import {
  draftIngredientsFromLocations,
  LOCATION_LABELS,
  type KitchenLocation,
} from '../lib/ingredientDraft'
import {
  HEIC_ACCEPT,
  isHeicFile,
  MAX_PHOTO_BYTES,
  tryConvertHeicToJpeg,
} from '../lib/heic'
import {
  forgetPantryContext,
  loadPantryContext,
  savePantryContext,
} from '../lib/pantryContext'

type Step = 'upload' | 'privacy' | 'ingredients' | 'prefs' | 'recipes'

interface PhotoSlot {
  file: File
  previewUrl: string
  location: KitchenLocation
  heicConverted: boolean
}

export function Pantry() {
  const saved = useMemo(() => loadPantryContext(), [])

  const [step, setStep] = useState<Step>('upload')
  const [photos, setPhotos] = useState<PhotoSlot[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [heicGuidance, setHeicGuidance] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [privacyOk, setPrivacyOk] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>(
    saved?.confirmedIngredients ?? [],
  )
  const [ingredientDraft, setIngredientDraft] = useState('')
  const [avoidList, setAvoidList] = useState<string[]>(
    saved?.avoidIngredients ?? [],
  )
  const [avoidDraft, setAvoidDraft] = useState('')
  const [culture, setCulture] = useState<CultureCue>(saved?.culture ?? 'fusion')
  const [recipeIntent, setRecipeIntent] = useState<RecipeIntent>(
    saved?.recipeIntent ?? 'everyday',
  )
  const [dietary, setDietary] = useState(saved?.dietary ?? '')
  const [timing, setTiming] = useState(saved?.timing ?? '30')
  const [recipes, setRecipes] = useState<RecipeCard[]>([])
  const [contextBanner, setContextBanner] = useState(
    saved ? 'Restored pantry prefs from this browser (photos were never saved).' : null,
  )

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, [])

  async function onFiles(list: FileList | null) {
    if (!list) return
    setUploadError(null)
    setHeicGuidance(null)
    setConverting(true)
    try {
      const incoming = Array.from(list)
      const next = [...photos]
      for (const f of incoming) {
        if (next.length >= 4) break
        if (f.size > MAX_PHOTO_BYTES) {
          setUploadError(`Keep each image under ~15 MB (skipped “${f.name}”).`)
          continue
        }
        if (isHeicFile(f)) {
          const converted = await tryConvertHeicToJpeg(f)
          if (!converted.ok) {
            setHeicGuidance(converted.guidance)
            continue
          }
          next.push({
            file: converted.file,
            previewUrl: converted.previewUrl,
            location: 'unspecified',
            heicConverted: true,
          })
        } else if (
          f.type === 'image/jpeg' ||
          f.type === 'image/png' ||
          f.type === 'image/webp' ||
          /\.(jpe?g|png|webp)$/i.test(f.name)
        ) {
          next.push({
            file: f,
            previewUrl: URL.createObjectURL(f),
            location: 'unspecified',
            heicConverted: false,
          })
        } else {
          setUploadError(
            `Unsupported type for “${f.name}”. Use JPG, PNG, WebP, or HEIC/HEIF.`,
          )
        }
      }
      setPhotos(next.slice(0, 4))
    } finally {
      setConverting(false)
    }
  }

  function setPhotoLocation(index: number, location: KitchenLocation) {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, location } : p)),
    )
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  function confirmPrivacy() {
    if (!privacyOk || photos.length === 0) return
    const locs = photos.map((p) => p.location)
    const draft = draftIngredientsFromLocations(locs)
    // Prefer restored chips only if user hasn't uploaded fresh context this session
    const base =
      ingredients.length >= 2 && contextBanner
        ? ingredients
        : draft
    setIngredients(base)
    setContextBanner(null)
    setStep('ingredients')
  }

  function addChip(
    list: string[],
    setList: (v: string[]) => void,
    draft: string,
    setDraft: (v: string) => void,
    max = 24,
  ) {
    const v = draft.trim()
    if (!v) return
    if (!list.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setList([...list, v].slice(0, max))
    }
    setDraft('')
  }

  function persistAndGenerate() {
    savePantryContext({
      culture,
      recipeIntent,
      dietary,
      timing,
      avoidIngredients: avoidList,
      confirmedIngredients: ingredients,
    })
    const cards = generateRecipes({
      ingredients,
      culture,
      recipeIntent,
      dietary,
      timing,
      avoidIngredients: avoidList,
    })
    setRecipes(cards)
    setStep('recipes')
  }

  function onForgetContext() {
    forgetPantryContext()
    setAvoidList([])
    setDietary('')
    setCulture('fusion')
    setRecipeIntent('everyday')
    setTiming('30')
    setIngredients([])
    setContextBanner('Pantry prefs cleared from this browser. Photos were never stored.')
  }

  function restart(clearPhotos = true) {
    if (clearPhotos) {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      setPhotos([])
    }
    setPrivacyOk(false)
    setRecipes([])
    setUploadError(null)
    setHeicGuidance(null)
    setStep('upload')
  }

  const canGenerate = ingredients.filter((i) => i.trim()).length >= 2

  const stepIndex = useMemo(
    () =>
      (
        ['upload', 'privacy', 'ingredients', 'prefs', 'recipes'] as Step[]
      ).indexOf(step),
    [step],
  )

  return (
    <div className="bg-cream">
      <section className="bg-navy text-cream">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow flex items-center gap-2 text-coral">
              <span className="h-2 w-2 rounded-full bg-lime" />
              Pantry Lens
            </p>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl">
              Photos → confirmed ingredients →{' '}
              <span className="text-lime">recipes</span>
            </h1>
            <p className="mt-3 text-sm text-cream/75 leading-relaxed">
              Up to four kitchen views. Private by default. You confirm what the
              starter list shows before any recipes are built — we will not guess
              hidden items.
            </p>
            <ol className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
              {(
                [
                  'Upload',
                  'Privacy',
                  'Ingredients',
                  'Prefs',
                  'Recipes',
                ] as const
              ).map((label, i) => (
                <li
                  key={label}
                  className={`rounded-full px-3 py-1 ${
                    i <= stepIndex
                      ? 'bg-lime text-navy'
                      : 'bg-white/10 text-cream/60'
                  }`}
                >
                  {i + 1}. {label}
                </li>
              ))}
            </ol>
          </div>
          <div className="relative mx-auto hidden w-full max-w-xs overflow-hidden rounded-2xl border-2 border-lime/40 shadow-lg lg:block">
            <img
              src={`${import.meta.env.BASE_URL}pantry-hero.png`}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              width={320}
              height={400}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {contextBanner && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet/30 bg-violet/5 px-4 py-3 text-sm text-navy">
            <span>{contextBanner}</span>
            <button
              type="button"
              className="rounded-full border border-navy/20 px-3 py-1 text-xs font-bold"
              onClick={onForgetContext}
            >
              Forget pantry context
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Upload 1–4 kitchen photos</h2>
            <p className="mt-2 text-sm text-navy/70">
              Fridge, freezer, pantry, cupboard, or bench. JPG, PNG, WebP, HEIC
              or HEIF · up to ~15 MB each. Photos stay in this session only —
              never written to pantry context.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-navy/10">
              <img
                src={`${import.meta.env.BASE_URL}pantry-upload-section.png`}
                alt="Example kitchen views for Pantry Lens"
                className="max-h-40 w-full object-cover object-center"
                width={720}
                height={200}
              />
            </div>
            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet/40 bg-violet/5 px-4 py-10 transition hover:bg-violet/10">
              <span className="font-display text-lg text-violet">
                {converting ? 'Converting…' : 'Choose photos'}
              </span>
              <span className="mt-1 text-xs text-navy/50">
                {photos.length}/4 selected · max ~15 MB each
              </span>
              <input
                type="file"
                accept={HEIC_ACCEPT}
                multiple
                className="hidden"
                disabled={converting}
                onChange={(e) => {
                  void onFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            {uploadError && (
              <p className="mt-3 text-sm font-medium text-coral">{uploadError}</p>
            )}
            {heicGuidance && (
              <p className="mt-3 rounded-xl bg-coral/10 px-3 py-2 text-sm text-navy">
                <strong className="text-coral">HEIC note:</strong> {heicGuidance}
              </p>
            )}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {photos.map((p, i) => (
                  <div
                    key={p.previewUrl}
                    className="overflow-hidden rounded-xl border border-navy/10"
                  >
                    <img
                      src={p.previewUrl}
                      alt={`Kitchen view ${i + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="space-y-2 p-3">
                      <label className="block text-xs font-bold text-navy/60">
                        Location (optional)
                        <select
                          className="mt-1 w-full rounded-lg border border-navy/15 px-2 py-1.5 text-sm font-normal text-navy"
                          value={p.location}
                          onChange={(e) =>
                            setPhotoLocation(
                              i,
                              e.target.value as KitchenLocation,
                            )
                          }
                        >
                          {LOCATION_LABELS.map((loc) => (
                            <option key={loc.value} value={loc.value}>
                              {loc.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {p.heicConverted && (
                        <p className="text-[11px] text-violet">
                          Converted from HEIC for preview
                        </p>
                      )}
                      <button
                        type="button"
                        className="text-xs font-semibold text-coral"
                        onClick={() => removePhoto(i)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-lime"
                disabled={photos.length === 0 || converting}
                onClick={() => setStep('privacy')}
              >
                Continue
              </button>
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={onForgetContext}
              >
                Forget pantry context
              </button>
            </div>
          </div>
        )}

        {step === 'privacy' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Privacy confirm</h2>
            <p className="mt-2 text-sm text-navy/70 leading-relaxed">
              Pantry Lens builds a <strong>starter ingredient list</strong> in
              your browser from location labels and common AU pantry heuristics —
              not remote AI vision. Photos are not uploaded to a Forkward server
              and are not retained after you leave this page. Optional prefs can
              be saved in localStorage; use Forget anytime.
            </p>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-navy/5 p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={privacyOk}
                onChange={(e) => setPrivacyOk(e.target.checked)}
              />
              <span className="text-sm font-medium">
                I understand these photos stay private by default and I will
                confirm ingredients before recipes are generated.
              </span>
            </label>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={() => setStep('upload')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-lime"
                disabled={!privacyOk}
                onClick={confirmPrivacy}
              >
                Draft ingredients
              </button>
            </div>
          </div>
        )}

        {step === 'ingredients' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Confirm ingredients</h2>
            <p className="mt-2 text-sm text-navy/70">
              Starter list — confirm what you see. Remove anything wrong. Add
              what the photo missed. We will not guess hidden items, quantities,
              expiry, allergens, or nutrition.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ingredients.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-full bg-lime/30 px-3 py-1.5 text-sm font-semibold text-navy"
                >
                  {item}
                  <button
                    type="button"
                    className="text-navy/50 hover:text-coral"
                    aria-label={`Remove ${item}`}
                    onClick={() =>
                      setIngredients(ingredients.filter((x) => x !== item))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <input
                value={ingredientDraft}
                onChange={(e) => setIngredientDraft(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  addChip(
                    ingredients,
                    setIngredients,
                    ingredientDraft,
                    setIngredientDraft,
                  )
                }
                placeholder="Add ingredient"
                className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="btn-violet !py-2"
                onClick={() =>
                  addChip(
                    ingredients,
                    setIngredients,
                    ingredientDraft,
                    setIngredientDraft,
                  )
                }
              >
                Add
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={() => setStep('privacy')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-lime"
                disabled={!canGenerate}
                onClick={() => setStep('prefs')}
              >
                Meal preferences
              </button>
            </div>
          </div>
        )}

        {step === 'prefs' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Style, culture & exclusions</h2>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold text-navy">
                Cultural cue
              </legend>
              <p className="mt-1 text-xs text-navy/60">
                Australian and Filipino households often share ingredients but
                want different recipes — pick the lane that fits tonight.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ['australian', 'Australian'],
                    ['filipino', 'Filipino'],
                    ['fusion', 'AU × Filipino'],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold ${
                      culture === value
                        ? 'border-violet bg-violet/10 text-violet'
                        : 'border-navy/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="culture"
                      className="sr-only"
                      checked={culture === value}
                      onChange={() => setCulture(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold text-navy">
                Recipe intent
              </legend>
              <p className="mt-1 text-xs text-navy/60">
                Everyday balance, lighter plates, or something more substantial.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ['everyday', 'Everyday'],
                    ['lighter', 'Lighter'],
                    ['substantial', 'Substantial'],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold ${
                      recipeIntent === value
                        ? 'border-lime bg-lime/20 text-navy'
                        : 'border-navy/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="intent"
                      className="sr-only"
                      checked={recipeIntent === value}
                      onChange={() => setRecipeIntent(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <p className="text-sm font-bold text-navy">Avoid ingredients</p>
              <p className="mt-1 text-xs text-navy/60">
                Excluded before generation — recipes will not feature these.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {avoidList.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1.5 text-sm font-semibold text-navy"
                  >
                    {item}
                    <button
                      type="button"
                      className="text-navy/50 hover:text-coral"
                      aria-label={`Remove avoid ${item}`}
                      onClick={() =>
                        setAvoidList(avoidList.filter((x) => x !== item))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={avoidDraft}
                  onChange={(e) => setAvoidDraft(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    addChip(avoidList, setAvoidList, avoidDraft, setAvoidDraft, 12)
                  }
                  placeholder="e.g. pork, shellfish, peanuts"
                  className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="btn-violet !py-2"
                  onClick={() =>
                    addChip(avoidList, setAvoidList, avoidDraft, setAvoidDraft, 12)
                  }
                >
                  Avoid
                </button>
              </div>
            </div>

            <label className="mt-6 block text-sm font-bold">
              Dietary notes
              <input
                className="mt-2 w-full rounded-xl border border-navy/15 px-3 py-2 font-normal"
                placeholder="e.g. lower carb, no pork, gluten-free"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </label>

            <label className="mt-4 block text-sm font-bold">
              Timing (minutes)
              <select
                className="mt-2 w-full rounded-xl border border-navy/15 px-3 py-2 font-normal"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
              >
                <option value="15">~15</option>
                <option value="30">~30</option>
                <option value="45">~45</option>
                <option value="60">~60</option>
              </select>
            </label>

            <p className="mt-4 text-xs text-navy/55 leading-relaxed">
              Prefs (not photos) can stay in this browser under{' '}
              <code className="rounded bg-navy/5 px-1">forkward.pantry-context.v1</code>
              . Not medical advice · not allergen-safe.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={() => setStep('ingredients')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-lime"
                onClick={persistAndGenerate}
              >
                Generate 3 recipes
              </button>
              <button
                type="button"
                className="rounded-full border border-coral/40 px-4 py-2 text-sm font-semibold text-coral"
                onClick={onForgetContext}
              >
                Forget pantry context
              </button>
            </div>
          </div>
        )}

        {step === 'recipes' && (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Your three recipes</h2>
                <p className="text-sm text-navy/60">
                  Offline culture-aware cards from your confirmed ingredients and
                  avoid list. Tune prefs and regenerate anytime.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={() => setStep('prefs')}
              >
                Adjust prefs
              </button>
            </div>
            <div className="grid gap-5">
              {recipes.map((r) => (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 bg-navy px-5 py-3 text-cream">
                    <h3 className="font-display text-lg">{r.title}</h3>
                    <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold text-navy">
                      {r.cultureLabel}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-navy/75">{r.summary}</p>
                    <p className="mt-2 text-xs font-semibold text-violet">
                      {r.timeMins} min · serves {r.servings}
                    </p>
                    <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-navy/50">
                      Ingredients
                    </h4>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      {r.ingredients.map((ing) => (
                        <li key={ing}>{ing}</li>
                      ))}
                    </ul>
                    <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-navy/50">
                      Steps
                    </h4>
                    <ol className="mt-1 list-inside list-decimal space-y-1 text-sm">
                      {r.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    {r.shoppingList.length > 0 && (
                      <>
                        <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-navy/50">
                          Optional shopping list
                        </h4>
                        <ul className="mt-1 list-inside list-disc text-sm text-navy/80">
                          {r.shoppingList.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mt-4 text-[11px] leading-relaxed text-navy/45">
                      {r.disclaimer}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-violet"
                onClick={() => restart(true)}
              >
                Start another Pantry Lens
              </button>
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={onForgetContext}
              >
                Forget pantry context
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
