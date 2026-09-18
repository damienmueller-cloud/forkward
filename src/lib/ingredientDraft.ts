/**
 * Offline starter ingredient chips from location labels + AU pantry heuristics.
 * NEVER claim this is AI vision — UI must say "starter list — confirm what you see".
 */

export type KitchenLocation =
  | 'fridge'
  | 'freezer'
  | 'pantry'
  | 'cupboard'
  | 'bench'
  | 'unspecified'

const BY_LOCATION: Record<KitchenLocation, string[]> = {
  fridge: [
    'eggs',
    'milk',
    'butter',
    'cheese',
    'yoghurt',
    'leftover chicken',
    'tomatoes',
    'lettuce',
    'carrot',
    'onion',
    'garlic',
    'lemon',
  ],
  freezer: [
    'frozen peas',
    'frozen mixed veg',
    'frozen fish fillets',
    'chicken thighs',
    'mince',
    'bread',
  ],
  pantry: [
    'rice',
    'pasta',
    'tinned tomatoes',
    'tinned tuna',
    'chickpeas',
    'olive oil',
    'soy sauce',
    'vinegar',
    'stock cubes',
    'oats',
  ],
  cupboard: [
    'flour',
    'sugar',
    'salt',
    'pepper',
    'curry powder',
    'tinned coconut milk',
    'noodles',
    'peanut butter',
  ],
  bench: ['bananas', 'apples', 'onion', 'garlic', 'potatoes', 'bread'],
  unspecified: [
    'eggs',
    'onion',
    'garlic',
    'rice',
    'tomatoes',
    'chicken thighs',
    'soy sauce',
    'olive oil',
  ],
}

/** Common AU household staples always worth offering as optional chips. */
const AU_STAPLES = ['onion', 'garlic', 'eggs', 'rice', 'olive oil']

export function draftIngredientsFromLocations(
  locations: KitchenLocation[],
): string[] {
  const locs =
    locations.length > 0
      ? locations
      : (['unspecified'] as KitchenLocation[])

  const seen = new Set<string>()
  const out: string[] = []

  for (const loc of locs) {
    for (const item of BY_LOCATION[loc] ?? BY_LOCATION.unspecified) {
      const key = item.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(item)
      if (out.length >= 10) break
    }
    if (out.length >= 10) break
  }

  for (const staple of AU_STAPLES) {
    if (out.length >= 12) break
    const key = staple.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(staple)
  }

  return out.slice(0, 12)
}

export const LOCATION_LABELS: { value: KitchenLocation; label: string }[] = [
  { value: 'fridge', label: 'Fridge' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'pantry', label: 'Pantry' },
  { value: 'cupboard', label: 'Cupboard' },
  { value: 'bench', label: 'Bench' },
  { value: 'unspecified', label: 'Unspecified' },
]
