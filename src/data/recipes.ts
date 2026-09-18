export type CultureCue = 'australian' | 'filipino' | 'fusion'
export type RecipeIntent = 'everyday' | 'lighter' | 'substantial'

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
  shoppingList: string[]
  tags: string[]
  disclaimer: string
}

const CULTURE_LABELS: Record<CultureCue, string> = {
  australian: 'Australian',
  filipino: 'Filipino',
  fusion: 'AU × Filipino fusion',
}

const DISCLAIMER =
  'Not medical advice. Not allergen-safe or food-safety certified — check labels and your own tolerances.'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function isAvoided(item: string, avoid: string[]): boolean {
  const n = norm(item)
  return avoid.some((a) => {
    const an = norm(a)
    return an.length > 0 && (n.includes(an) || an.includes(n))
  })
}

function filterAvoid(items: string[], avoid: string[]): string[] {
  return items.filter((i) => !isAvoided(i, avoid))
}

function hasAny(pool: string[], needles: string[]): boolean {
  const p = pool.map(norm)
  return needles.some((n) => p.some((x) => x.includes(norm(n)) || norm(n).includes(x)))
}

function pickFromConfirmed(
  confirmed: string[],
  prefer: string[],
  avoid: string[],
  max = 8,
): string[] {
  const clean = filterAvoid(
    confirmed.map((i) => i.trim()).filter(Boolean),
    avoid,
  )
  const preferred = prefer.filter(
    (p) => clean.some((c) => norm(c).includes(norm(p)) || norm(p).includes(norm(c))) &&
      !isAvoided(p, avoid),
  )
  const rest = clean.filter(
    (c) => !preferred.some((p) => norm(p) === norm(c)),
  )
  return [...preferred, ...rest].slice(0, max)
}

function shoppingGaps(
  recipeNeeds: string[],
  confirmed: string[],
  avoid: string[],
): string[] {
  const have = confirmed.map(norm)
  return filterAvoid(recipeNeeds, avoid).filter((need) => {
    const n = norm(need)
    return !have.some((h) => h.includes(n) || n.includes(h))
  }).slice(0, 5)
}

function intentTiming(intent: RecipeIntent, timing: string): number {
  const base =
    timing === '15' ? 15 : timing === '30' ? 30 : timing === '45' ? 45 : 60
  if (intent === 'lighter') return Math.min(base, 25)
  if (intent === 'substantial') return Math.max(base, 40)
  return base
}

function dietarySuffix(dietary: string): string {
  return dietary.trim() ? ` Notes: ${dietary.trim()}.` : ''
}

interface Template {
  id: string
  culture: CultureCue
  title: string
  intents: RecipeIntent[]
  prefer: string[]
  extras: string[]
  summary: (dietary: string, intent: RecipeIntent) => string
  steps: (ings: string[], intent: RecipeIntent) => string[]
}

const TEMPLATES: Template[] = [
  // —— Australian ——
  {
    id: 'au-tray',
    culture: 'australian',
    title: 'Snag & veg tray bake',
    intents: ['everyday', 'substantial'],
    prefer: ['sausage', 'snag', 'potato', 'onion', 'capsicum', 'carrot', 'zucchini'],
    extras: ['beef sausages', 'potatoes', 'capsicum', 'onion', 'olive oil', 'mustard'],
    summary: (d, intent) =>
      `One-pan Aussie tray bake around what you confirmed.${intent === 'lighter' ? ' Go easy on oil and load the veg.' : ''} Practical weeknight energy.${dietarySuffix(d)}`,
    steps: () => [
      'Heat oven to 200°C. Toss chopped veg with a little oil, salt, and pepper on a tray.',
      'Nestle sausages (or leftover protein) among the veg. Roast 25–35 minutes, turning once.',
      'Finish with mustard or barbecue sauce. Serve hot with a green side if you have it.',
    ],
  },
  {
    id: 'au-wrap',
    culture: 'australian',
    title: 'Leftover protein & crunch wrap',
    intents: ['everyday', 'lighter'],
    prefer: ['chicken', 'lettuce', 'tomato', 'cheese', 'wrap', 'bread', 'yoghurt'],
    extras: ['wraps or bread', 'leftover protein', 'lettuce', 'tomato', 'yoghurt or mayo', 'lemon'],
    summary: (d) =>
      `Fast wrap using fridge leftovers and a squeeze of lemon.${dietarySuffix(d)}`,
    steps: () => [
      'Warm wraps or toast bread. Slice leftover protein and any roast veg.',
      'Add greens, tomato, and a spoon of yoghurt or mayo.',
      'Roll tight. Eat now or pack for tomorrow.',
    ],
  },
  {
    id: 'au-pasta',
    culture: 'australian',
    title: 'Pantry tomato pasta',
    intents: ['everyday', 'substantial'],
    prefer: ['pasta', 'tomato', 'garlic', 'onion', 'olive oil', 'cheese', 'basil'],
    extras: ['pasta', 'tinned tomatoes', 'garlic', 'onion', 'olive oil', 'parmesan'],
    summary: (d, intent) =>
      `Reliable pasta from cupboard staples.${intent === 'lighter' ? ' Extra veg, lighter cheese.' : ''}${dietarySuffix(d)}`,
    steps: () => [
      'Boil pasta in salted water. Soften onion and garlic in oil.',
      'Add tomatoes; simmer 8–10 minutes. Season well.',
      'Toss pasta through sauce. Finish with cheese or herbs if you have them.',
    ],
  },
  {
    id: 'au-bbq',
    culture: 'australian',
    title: 'Grill plate with lemon veg',
    intents: ['substantial', 'everyday'],
    prefer: ['chicken', 'fish', 'steak', 'zucchini', 'capsicum', 'lemon', 'corn'],
    extras: ['chicken thighs or fish', 'zucchini', 'capsicum', 'lemon', 'olive oil'],
    summary: (d) =>
      `Aussie grill energy — protein + charred veg, lemon to finish.${dietarySuffix(d)}`,
    steps: () => [
      'Season protein and veg with oil, salt, pepper, and lemon zest.',
      'Grill or pan-sear until cooked through; rest meat briefly.',
      'Squeeze lemon over everything. Serve with salad or rice.',
    ],
  },
  {
    id: 'au-salad',
    culture: 'australian',
    title: 'Crunchy fridge salad bowl',
    intents: ['lighter'],
    prefer: ['lettuce', 'tomato', 'cucumber', 'carrot', 'egg', 'chickpea', 'tuna'],
    extras: ['mixed leaves', 'tomato', 'cucumber', 'carrot', 'eggs or tuna', 'olive oil'],
    summary: (d) =>
      `Lighter bowl from fridge crunch — build, don’t overthink.${dietarySuffix(d)}`,
    steps: () => [
      'Chop leaves and crunchy veg into a wide bowl.',
      'Add protein (egg, tuna, chickpeas, leftover chicken).',
      'Dress with oil, lemon or vinegar, salt, and pepper.',
    ],
  },
  // —— Filipino ——
  {
    id: 'ph-sinangag',
    culture: 'filipino',
    title: 'Garlic rice bowl with soft egg',
    intents: ['everyday', 'lighter'],
    prefer: ['rice', 'garlic', 'egg', 'soy', 'spring onion', 'onion'],
    extras: ['day-old rice', 'garlic', 'eggs', 'soy sauce', 'spring onion', 'oil'],
    summary: (d) =>
      `Sinangag-style garlic rice using what you already have. Comforting and quick.${dietarySuffix(d)}`,
    steps: () => [
      'Fry minced garlic in oil until golden and fragrant.',
      'Add cold rice; break up clumps and toss until hot and lightly toasted.',
      'Season with soy. Top with a soft fried egg and chopped spring onion.',
    ],
  },
  {
    id: 'ph-ginisang',
    culture: 'filipino',
    title: 'Ginisang gulay (sautéed greens)',
    intents: ['lighter', 'everyday'],
    prefer: ['cabbage', 'spinach', 'beans', 'carrot', 'onion', 'garlic', 'tofu'],
    extras: ['mixed greens or cabbage', 'onion', 'garlic', 'soy or fish sauce', 'rice'],
    summary: (d) =>
      `Quick vegetable sauté with garlic and onion. Pair with rice.${dietarySuffix(d)}`,
    steps: () => [
      'Sauté onion and garlic until soft.',
      'Add chopped veg and a splash of water; cover briefly.',
      'Season with fish sauce or soy. Serve with rice and egg if you have it.',
    ],
  },
  {
    id: 'ph-adobo',
    culture: 'filipino',
    title: 'Weeknight chicken adobo',
    intents: ['substantial', 'everyday'],
    prefer: ['chicken', 'soy', 'vinegar', 'garlic', 'bay', 'pepper', 'rice'],
    extras: ['chicken thighs', 'soy sauce', 'vinegar', 'garlic', 'bay leaf', 'black pepper', 'rice'],
    summary: (d) =>
      `Classic adobo flavours — soy, vinegar, garlic — from pantry staples.${dietarySuffix(d)}`,
    steps: () => [
      'Brown chicken in a pan. Add soy, vinegar, smashed garlic, bay, and pepper.',
      'Simmer covered until tender (20–30 min). Reduce sauce uncovered.',
      'Serve over rice. Sauce should be glossy and sharp-savoury.',
    ],
  },
  {
    id: 'ph-tocino',
    culture: 'filipino',
    title: 'Sweet-savoury tocino-style skillet',
    intents: ['everyday', 'substantial'],
    prefer: ['pork', 'chicken', 'garlic', 'soy', 'sugar', 'rice', 'egg'],
    extras: ['thin pork or chicken', 'garlic', 'soy sauce', 'a little sugar', 'rice', 'egg'],
    summary: (d) =>
      `Breakfast-for-dinner energy: sweet-savoury skillet with rice and egg.${dietarySuffix(d)}`,
    steps: () => [
      'Marinate thin meat briefly in soy, garlic, and a pinch of sugar.',
      'Pan-fry until caramelised at the edges.',
      'Serve with garlic rice and a fried egg.',
    ],
  },
  {
    id: 'ph-tinola',
    culture: 'filipino',
    title: 'Light tinola-inspired broth',
    intents: ['lighter'],
    prefer: ['chicken', 'ginger', 'papaya', 'choko', 'spinach', 'garlic', 'onion'],
    extras: ['chicken pieces', 'ginger', 'garlic', 'onion', 'green leaves', 'fish sauce'],
    summary: (d) =>
      `Gentle ginger-garlic broth — lighter Filipino comfort.${dietarySuffix(d)}`,
    steps: () => [
      'Sauté ginger, garlic, and onion. Add chicken and water or stock.',
      'Simmer until chicken is tender; add soft veg or choko if you have it.',
      'Finish with greens and a splash of fish sauce. Serve with rice.',
    ],
  },
  // —— Fusion ——
  {
    id: 'fx-adobo-chop',
    culture: 'fusion',
    title: 'Adobo-inspired chop plate',
    intents: ['substantial', 'everyday'],
    prefer: ['chicken', 'pork', 'soy', 'vinegar', 'garlic', 'potato', 'rice'],
    extras: ['chicken thighs or chops', 'soy sauce', 'vinegar', 'garlic', 'bay leaf', 'rice or roast veg'],
    summary: (d) =>
      `Filipino adobo flavours meet an Aussie chop plate.${dietarySuffix(d)}`,
    steps: () => [
      'Brown meat. Add soy, vinegar, smashed garlic, bay, and pepper.',
      'Simmer until tender; reduce sauce. Roast potatoes or veg alongside if you like.',
      'Plate meat with sauce over rice or next to roast veg.',
    ],
  },
  {
    id: 'fx-stir',
    culture: 'fusion',
    title: 'Soy-garlic stir-fry with Aussie veg',
    intents: ['everyday', 'lighter'],
    prefer: ['broccoli', 'capsicum', 'carrot', 'chicken', 'beef', 'noodles', 'soy', 'garlic'],
    extras: ['mixed veg', 'protein of choice', 'soy sauce', 'garlic', 'noodles or rice', 'oil'],
    summary: (d, intent) =>
      `Fast wok energy — soy-garlic base, whatever veg you confirmed.${intent === 'substantial' ? ' Add noodles or extra protein.' : ''}${dietarySuffix(d)}`,
    steps: () => [
      'Hot pan, oil, garlic. Stir-fry protein until nearly done; set aside.',
      'Flash-cook veg. Return protein; splash soy and a pinch of sugar or honey.',
      'Serve over rice or noodles.',
    ],
  },
  {
    id: 'fx-bowl',
    culture: 'fusion',
    title: 'Rice bowl with pickle punch',
    intents: ['everyday', 'lighter', 'substantial'],
    prefer: ['rice', 'egg', 'cucumber', 'carrot', 'chicken', 'soy', 'mayo'],
    extras: ['rice', 'protein', 'cucumber or carrot', 'soy sauce', 'mayo or yoghurt', 'sesame or spring onion'],
    summary: (d) =>
      `Build-your-own bowl — Aussie fridge bits, Filipino-friendly seasoning.${dietarySuffix(d)}`,
    steps: () => [
      'Warm rice. Prep a quick pickle: thin cucumber/carrot + vinegar + pinch of sugar.',
      'Cook or reheat protein; fry an egg if you have one.',
      'Assemble: rice, protein, pickle, drizzle of soy-mayo. Eat immediately.',
    ],
  },
]

function scoreTemplate(
  t: Template,
  opts: {
    culture: CultureCue
    recipeIntent: RecipeIntent
    confirmed: string[]
    avoid: string[]
  },
): number {
  let score = 0
  if (t.culture === opts.culture) score += 10
  else if (opts.culture === 'fusion' || t.culture === 'fusion') score += 4
  if (t.intents.includes(opts.recipeIntent)) score += 6
  for (const p of t.prefer) {
    if (hasAny(opts.confirmed, [p]) && !isAvoided(p, opts.avoid)) score += 2
  }
  // Penalise templates whose core extras are all avoided
  const usableExtras = filterAvoid(t.extras, opts.avoid)
  if (usableExtras.length < 2) score -= 8
  return score
}

/** @deprecated Use generateRecipes — kept as alias for any old imports. */
export function generateMockRecipes(opts: {
  ingredients: string[]
  culture: CultureCue
  mealStyle?: string
  recipeIntent?: RecipeIntent
  dietary: string
  timing: string
  avoidIngredients?: string[]
}): RecipeCard[] {
  return generateRecipes({
    ingredients: opts.ingredients,
    culture: opts.culture,
    recipeIntent: opts.recipeIntent ?? 'everyday',
    dietary: opts.dietary,
    timing: opts.timing,
    avoidIngredients: opts.avoidIngredients ?? [],
  })
}

export function generateRecipes(opts: {
  ingredients: string[]
  culture: CultureCue
  recipeIntent: RecipeIntent
  dietary: string
  timing: string
  avoidIngredients: string[]
}): RecipeCard[] {
  const avoid = opts.avoidIngredients.map((a) => a.trim()).filter(Boolean)
  const confirmed = filterAvoid(
    opts.ingredients.map((i) => i.trim()).filter(Boolean),
    avoid,
  )
  const time = intentTiming(opts.recipeIntent, opts.timing)

  const ranked = [...TEMPLATES]
    .map((t) => ({
      t,
      score: scoreTemplate(t, {
        culture: opts.culture,
        recipeIntent: opts.recipeIntent,
        confirmed,
        avoid,
      }),
    }))
    .sort((a, b) => b.score - a.score)

  const picked: Template[] = []
  const usedCultures = new Set<CultureCue>()
  for (const { t } of ranked) {
    if (picked.length >= 3) break
    // Prefer diversity when culture is fusion
    if (
      opts.culture === 'fusion' &&
      picked.length < 3 &&
      usedCultures.has(t.culture) &&
      ranked.some(
        (r) =>
          !picked.includes(r.t) &&
          !usedCultures.has(r.t.culture) &&
          r.score > 0,
      )
    ) {
      continue
    }
    picked.push(t)
    usedCultures.add(t.culture)
  }
  while (picked.length < 3 && ranked.length > picked.length) {
    const next = ranked.find((r) => !picked.includes(r.t))
    if (!next) break
    picked.push(next.t)
  }

  return picked.map((t, idx) => {
    const ings = pickFromConfirmed(
      confirmed,
      t.prefer,
      avoid,
      8,
    )
    const withExtras = [
      ...ings,
      ...filterAvoid(t.extras, avoid).filter(
        (e) => !ings.some((i) => norm(i) === norm(e)),
      ),
    ].slice(0, 8)

    let displayIngs = withExtras
    const diet = opts.dietary.toLowerCase()
    if (diet.includes('no pork')) {
      displayIngs = displayIngs.filter((i) => !/pork|bacon|ham/i.test(i))
    }
    if (diet.includes('vegetarian') || diet.includes('vegan')) {
      const veg = displayIngs.filter(
        (i) => !/chicken|pork|beef|fish|tuna|mince|sausage|snag|meat|bacon|ham/i.test(i),
      )
      if (veg.length >= 3) displayIngs = veg
    }

    const shop = shoppingGaps(t.extras, confirmed, avoid)

    return {
      id: `${t.id}-${idx}`,
      title: t.title,
      culture: t.culture,
      cultureLabel: CULTURE_LABELS[t.culture],
      timeMins: time,
      servings: opts.recipeIntent === 'substantial' ? 4 : 2,
      summary: t.summary(opts.dietary, opts.recipeIntent),
      ingredients: displayIngs.length >= 2 ? displayIngs : filterAvoid(t.extras, avoid).slice(0, 6),
      steps: t.steps(displayIngs, opts.recipeIntent),
      shoppingList: shop,
      tags: [opts.recipeIntent, t.culture, opts.timing + 'min'],
      disclaimer: DISCLAIMER,
    }
  })
}

export { CULTURE_LABELS, DISCLAIMER }
