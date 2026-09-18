export type CultureCue = 'australian' | 'filipino' | 'fusion'

export type MealStyle = 'weeknight' | 'batch' | 'grill' | 'comfort'

export interface RecipeCard {
  id: string
  title: string
  culture: CultureCue
  cultureLabel: string
  timeMins: number
  servings: number
  summary: string
  ingredients: string[]
  steps: string[]
  tags: string[]
}

const CULTURE_LABELS: Record<CultureCue, string> = {
  australian: 'Australian',
  filipino: 'Filipino',
  fusion: 'AU × Filipino fusion',
}

function pickIngredients(confirmed: string[], fallbacks: string[]): string[] {
  const cleaned = confirmed.map((i) => i.trim()).filter(Boolean)
  if (cleaned.length >= 3) return cleaned.slice(0, 8)
  return [...cleaned, ...fallbacks].slice(0, 8)
}

export function generateMockRecipes(opts: {
  ingredients: string[]
  culture: CultureCue
  mealStyle: MealStyle
  dietary: string
  timing: string
}): RecipeCard[] {
  const base = pickIngredients(opts.ingredients, [
    'eggs',
    'onion',
    'garlic',
    'rice',
    'olive oil',
    'tomatoes',
  ])
  const time =
    opts.timing === '15'
      ? 15
      : opts.timing === '30'
        ? 30
        : opts.timing === '45'
          ? 45
          : 60

  const dietaryNote = opts.dietary ? ` (${opts.dietary})` : ''

  const australian: RecipeCard = {
    id: 'au-1',
    title: 'Snag & veg tray bake',
    culture: 'australian',
    cultureLabel: CULTURE_LABELS.australian,
    timeMins: Math.min(time + 10, 55),
    servings: 2,
    summary: `Practical Aussie tray bake built around your pantry${dietaryNote}. One pan, minimal washing up.`,
    ingredients: pickIngredients(base, [
      'beef sausages',
      'potatoes',
      'capsicum',
      'onion',
      'mustard',
    ]),
    steps: [
      'Heat oven to 200°C. Toss chopped veg with oil, salt, and pepper on a tray.',
      'Nestle sausages among the veg. Roast 25–35 minutes, turning once.',
      'Finish with a spoon of mustard or barbecue sauce. Serve hot.',
    ],
    tags: ['weeknight', 'one-pan', opts.mealStyle],
  }

  const filipino: RecipeCard = {
    id: 'ph-1',
    title: 'Garlic rice bowl with soft egg',
    culture: 'filipino',
    cultureLabel: CULTURE_LABELS.filipino,
    timeMins: Math.min(time, 35),
    servings: 2,
    summary: `Sinangag-style garlic rice using what you already have${dietaryNote}. Comforting, quick, and shareable.`,
    ingredients: pickIngredients(base, [
      'day-old rice',
      'garlic',
      'eggs',
      'soy sauce',
      'spring onion',
    ]),
    steps: [
      'Fry minced garlic in oil until golden and fragrant.',
      'Add cold rice; break up clumps and toss until hot and lightly toasted.',
      'Season with soy. Top with a soft fried egg and chopped spring onion.',
    ],
    tags: ['comfort', 'rice', opts.mealStyle],
  }

  const fusion: RecipeCard = {
    id: 'fx-1',
    title: 'Adobo-inspired chop plate',
    culture: 'fusion',
    cultureLabel: CULTURE_LABELS.fusion,
    timeMins: Math.max(time, 35),
    servings: 3,
    summary: `Filipino adobo flavours meet an Aussie chop plate${dietaryNote}. Soy, vinegar, garlic — pantry staples doing the work.`,
    ingredients: pickIngredients(base, [
      'chicken thighs or pork chops',
      'soy sauce',
      'vinegar',
      'bay leaf',
      'black pepper',
      'rice',
    ]),
    steps: [
      'Brown meat in a pan. Add soy, vinegar, smashed garlic, bay, and pepper.',
      'Simmer covered until tender (20–30 min). Reduce sauce uncovered.',
      'Serve over rice or with roasted veg from your tray.',
    ],
    tags: ['batch', 'family', opts.mealStyle],
  }

  if (opts.culture === 'australian') {
    return [
      australian,
      {
        ...australian,
        id: 'au-2',
        title: 'Barbecue veg & leftover protein wrap',
        timeMins: Math.min(time, 25),
        summary: `Fast wrap using fridge leftovers and a squeeze of lemon${dietaryNote}.`,
        steps: [
          'Warm wraps. Slice leftover protein and roast veg.',
          'Add greens, lemon, and a spoon of yoghurt or mayo.',
          'Roll tight. Eat now or pack for tomorrow.',
        ],
      },
      {
        ...fusion,
        id: 'au-3',
        title: 'Quick tomato pasta with pantry heroes',
        culture: 'australian',
        cultureLabel: CULTURE_LABELS.australian,
        timeMins: Math.min(time, 30),
      },
    ]
  }

  if (opts.culture === 'filipino') {
    return [
      filipino,
      {
        ...filipino,
        id: 'ph-2',
        title: 'Ginisang gulay (sautéed greens)',
        timeMins: Math.min(time, 25),
        summary: `Quick vegetable sauté with garlic and onion${dietaryNote}. Pair with rice.`,
        steps: [
          'Sauté onion and garlic until soft.',
          'Add chopped veg and a splash of water; cover briefly.',
          'Season with fish sauce or soy. Serve with rice and egg if you have it.',
        ],
      },
      {
        ...fusion,
        id: 'ph-3',
        title: 'Tocino-style sweet-savoury skillet',
        culture: 'filipino',
        cultureLabel: CULTURE_LABELS.filipino,
      },
    ]
  }

  return [fusion, australian, filipino]
}
