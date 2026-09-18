import { useMemo, useState } from 'react'
import {
  generateMockRecipes,
  type CultureCue,
  type MealStyle,
  type RecipeCard,
} from '../data/recipes'

type Step = 'upload' | 'privacy' | 'ingredients' | 'prefs' | 'recipes'

const DRAFT_FROM_PHOTOS = [
  'eggs',
  'onion',
  'garlic',
  'rice',
  'tomatoes',
  'chicken thighs',
  'soy sauce',
  'olive oil',
]

export function Pantry() {
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [privacyOk, setPrivacyOk] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [ingredientDraft, setIngredientDraft] = useState('')
  const [culture, setCulture] = useState<CultureCue>('fusion')
  const [mealStyle, setMealStyle] = useState<MealStyle>('weeknight')
  const [dietary, setDietary] = useState('')
  const [timing, setTiming] = useState('30')
  const [recipes, setRecipes] = useState<RecipeCard[]>([])

  function onFiles(list: FileList | null) {
    if (!list) return
    const next = [...files, ...Array.from(list)].slice(0, 4)
    setFiles(next)
    setPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  function confirmPrivacy() {
    if (!privacyOk || files.length === 0) return
    // MVP: deterministic draft ingredients (no remote vision API)
    setIngredients([...DRAFT_FROM_PHOTOS])
    setStep('ingredients')
  }

  function addIngredient() {
    const v = ingredientDraft.trim()
    if (!v) return
    if (!ingredients.includes(v)) setIngredients([...ingredients, v])
    setIngredientDraft('')
  }

  function generate() {
    const cards = generateMockRecipes({
      ingredients,
      culture,
      mealStyle,
      dietary,
      timing,
    })
    setRecipes(cards)
    setStep('recipes')
  }

  const canGenerate = ingredients.length >= 2

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
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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
            draft sees before any recipes are built.
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
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {step === 'upload' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Upload 1–4 kitchen photos</h2>
            <p className="mt-2 text-sm text-navy/70">
              Fridge, freezer, pantry, cupboard, or bench. JPG, PNG, or WebP.
            </p>
            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet/40 bg-violet/5 px-4 py-10 transition hover:bg-violet/10">
              <span className="font-display text-lg text-violet">
                Choose photos
              </span>
              <span className="mt-1 text-xs text-navy/50">
                {files.length}/4 selected
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Kitchen view ${i + 1}`}
                    className="aspect-square rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn-lime mt-6 w-full sm:w-auto"
              disabled={files.length === 0}
              onClick={() => setStep('privacy')}
            >
              Continue
            </button>
          </div>
        )}

        {step === 'privacy' && (
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl">Privacy confirm</h2>
            <p className="mt-2 text-sm text-navy/70 leading-relaxed">
              Pantry Lens drafts ingredients in your browser for this MVP.
              Photos are not uploaded to a Forkward server and are not retained
              after you leave this page.
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
              Edit the draft list. Remove anything wrong. Add what the photo
              missed.
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
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Add ingredient"
                className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="btn-violet !py-2"
                onClick={addIngredient}
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
            <h2 className="font-display text-xl">Style, culture & timing</h2>

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

            <label className="mt-6 block text-sm font-bold">
              Meal style
              <select
                className="mt-2 w-full rounded-xl border border-navy/15 px-3 py-2 font-normal"
                value={mealStyle}
                onChange={(e) => setMealStyle(e.target.value as MealStyle)}
              >
                <option value="weeknight">Weeknight fast</option>
                <option value="batch">Batch cook</option>
                <option value="grill">Grill / BBQ</option>
                <option value="comfort">Comfort food</option>
              </select>
            </label>

            <label className="mt-4 block text-sm font-bold">
              Dietary needs
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold"
                onClick={() => setStep('ingredients')}
              >
                Back
              </button>
              <button type="button" className="btn-lime" onClick={generate}>
                Generate 3 recipes
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
                  MVP mock cards from your confirmed ingredients — tune prefs
                  and regenerate anytime.
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
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="btn-violet mt-8"
              onClick={() => {
                setFiles([])
                setPreviews([])
                setPrivacyOk(false)
                setIngredients([])
                setRecipes([])
                setStep('upload')
              }}
            >
              Start another Pantry Lens
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
