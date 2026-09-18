/** Browser prefs persistence for Pantry Lens. Photos are never stored. */

export const PANTRY_CONTEXT_KEY = 'forkward.pantry-context.v1'

export type CultureCue = 'australian' | 'filipino' | 'fusion'
export type RecipeIntent = 'everyday' | 'lighter' | 'substantial'

export interface PantryContextV1 {
  version: 1
  culture: CultureCue
  recipeIntent: RecipeIntent
  dietary: string
  timing: string
  avoidIngredients: string[]
  /** Optional restore of last confirmed ingredient chips — never photos. */
  confirmedIngredients?: string[]
  savedAt: string
}

export function loadPantryContext(): PantryContextV1 | null {
  try {
    const raw = localStorage.getItem(PANTRY_CONTEXT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PantryContextV1>
    if (parsed.version !== 1) return null
    return {
      version: 1,
      culture: (['australian', 'filipino', 'fusion'] as const).includes(
        parsed.culture as CultureCue,
      )
        ? (parsed.culture as CultureCue)
        : 'fusion',
      recipeIntent: (['everyday', 'lighter', 'substantial'] as const).includes(
        parsed.recipeIntent as RecipeIntent,
      )
        ? (parsed.recipeIntent as RecipeIntent)
        : 'everyday',
      dietary: typeof parsed.dietary === 'string' ? parsed.dietary : '',
      timing: typeof parsed.timing === 'string' ? parsed.timing : '30',
      avoidIngredients: Array.isArray(parsed.avoidIngredients)
        ? parsed.avoidIngredients
            .filter((x): x is string => typeof x === 'string')
            .slice(0, 12)
        : [],
      confirmedIngredients: Array.isArray(parsed.confirmedIngredients)
        ? parsed.confirmedIngredients
            .filter((x): x is string => typeof x === 'string')
            .slice(0, 24)
        : undefined,
      savedAt:
        typeof parsed.savedAt === 'string'
          ? parsed.savedAt
          : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function savePantryContext(
  ctx: Omit<PantryContextV1, 'version' | 'savedAt'>,
): void {
  const payload: PantryContextV1 = {
    version: 1,
    ...ctx,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(PANTRY_CONTEXT_KEY, JSON.stringify(payload))
}

export function forgetPantryContext(): void {
  localStorage.removeItem(PANTRY_CONTEXT_KEY)
}
