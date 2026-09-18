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

/** True if template title or core prefer terms clash with avoid list. */
function conflictsAvoid(t: Template, avoid: string[]): boolean {
  if (avoid.length === 0) return false
  if (isAvoided(t.title, avoid)) return true
  // Skip when a signature prefer item (appears in title) is avoided
  const titleN = norm(t.title)
  for (const p of t.prefer) {
    const pn = norm(p)
    if (pn.length < 3) continue
    if (titleN.includes(pn) && isAvoided(p, avoid)) return true
  }
  return false
}

/** Strip any avoid-matching tokens from free text fields (defence in depth). */
function scrubText(text: string, avoid: string[]): string {
  if (!avoid.length) return text
  let out = text
  for (const a of avoid) {
    const an = a.trim()
    if (an.length < 2) continue
    const re = new RegExp(an.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    out = out.replace(re, '…')
  }
  return out.replace(/\s{2,}/g, ' ').replace(/\s+([,.])/g, '$1').trim()
}

function cardAvoidFree(card: RecipeCard, avoid: string[]): RecipeCard {
  if (!avoid.length) return card
  return {
    ...card,
    title: scrubText(card.title, avoid),
    summary: scrubText(card.summary, avoid),
    ingredients: filterAvoid(card.ingredients, avoid),
    shoppingList: filterAvoid(card.shoppingList, avoid),
    steps: card.steps.map((s) => scrubText(s, avoid)),
  }
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
  // —— Extra Australian variety ——
  {
    id: 'au-mince',
    culture: 'australian',
    title: 'Aussie mince & veg pasta bake',
    intents: ['everyday', 'substantial'],
    prefer: ['mince', 'beef', 'pasta', 'tomato', 'cheese', 'onion', 'carrot'],
    extras: ['beef mince', 'pasta', 'tinned tomatoes', 'onion', 'carrot', 'cheese'],
    summary: (d, intent) =>
      `Family-style mince pasta bake from fridge and cupboard staples.${intent === 'lighter' ? ' Stretch with extra veg.' : ''}${dietarySuffix(d)}`,
    steps: () => [
      'Brown mince with onion and grated carrot. Add tomatoes; simmer.',
      'Boil pasta; combine with sauce in a baking dish. Top with cheese.',
      'Bake until bubbling. Rest a few minutes before serving.',
    ],
  },
  {
    id: 'au-fritters',
    culture: 'australian',
    title: 'Corn & zucchini fritters',
    intents: ['lighter', 'everyday'],
    prefer: ['corn', 'zucchini', 'egg', 'flour', 'onion', 'yoghurt'],
    extras: ['corn kernels', 'zucchini', 'eggs', 'self-raising flour', 'yoghurt or relish'],
    summary: (d) =>
      `Quick skillet fritters — great for leftover veg and a light plate.${dietarySuffix(d)}`,
    steps: () => [
      'Grate zucchini; squeeze out moisture. Mix with corn, egg, flour, and seasoning.',
      'Spoon into a hot oiled pan; flatten and cook until golden both sides.',
      'Serve with yoghurt, relish, or a simple salad.',
    ],
  },
  // —— Extra Filipino variety ——
  {
    id: 'ph-torta',
    culture: 'filipino',
    title: 'Tortang gulay (veg omelette)',
    intents: ['lighter', 'everyday'],
    prefer: ['egg', 'onion', 'carrot', 'potato', 'beans', 'cabbage', 'garlic'],
    extras: ['eggs', 'onion', 'garlic', 'mixed leftover veg', 'oil', 'rice'],
    summary: (d) =>
      `Vegetable omelette energy — stretch eggs with whatever greens or root veg you confirmed.${dietarySuffix(d)}`,
    steps: () => [
      'Sauté onion, garlic, and chopped veg until soft.',
      'Beat eggs with a pinch of salt; pour over veg and cook gently.',
      'Flip or finish under a lid. Serve with rice and a splash of soy if you like.',
    ],
  },
  {
    id: 'ph-lugaw',
    culture: 'filipino',
    title: 'Lugaw-style ginger rice porridge',
    intents: ['lighter', 'everyday'],
    prefer: ['rice', 'ginger', 'garlic', 'onion', 'chicken', 'egg', 'spring onion'],
    extras: ['rice', 'ginger', 'garlic', 'onion', 'stock or water', 'egg', 'spring onion'],
    summary: (d) =>
      `Gentle rice porridge with ginger — lighter comfort when you want something soft.${dietarySuffix(d)}`,
    steps: () => [
      'Sauté ginger, garlic, and onion. Add rice and plenty of water or stock.',
      'Simmer, stirring, until porridge-soft. Shred in leftover protein if you have it.',
      'Finish with spring onion and a soft egg if available.',
    ],
  },
  // —— Extra fusion variety ——
  {
    id: 'fx-pancit',
    culture: 'fusion',
    title: 'Pancit-style noodle toss',
    intents: ['everyday', 'substantial'],
    prefer: ['noodles', 'cabbage', 'carrot', 'chicken', 'soy', 'garlic', 'onion'],
    extras: ['noodles', 'cabbage', 'carrot', 'garlic', 'soy sauce', 'lemon or calamansi', 'oil'],
    summary: (d, intent) =>
      `Filipino pancit vibes with Aussie fridge veg — fast noodle toss.${intent === 'lighter' ? ' Extra cabbage, lighter protein.' : ''}${dietarySuffix(d)}`,
    steps: () => [
      'Cook noodles; drain. Sauté garlic and onion; add shredded veg and protein.',
      'Toss noodles through with soy and a squeeze of lemon or calamansi.',
      'Serve hot with extra citrus on the side.',
    ],
  },
  {
    id: 'fx-sisig',
    culture: 'fusion',
    title: 'Sisig-inspired chop salad',
    intents: ['everyday', 'lighter'],
    prefer: ['pork', 'chicken', 'onion', 'lemon', 'chilli', 'egg', 'lettuce'],
    extras: ['leftover chopped protein', 'onion', 'lemon or calamansi', 'chilli', 'lettuce or cabbage', 'egg'],
    summary: (d) =>
      `Chopped savoury protein salad with citrus heat — Aussie grill leftovers, Filipino punch.${dietarySuffix(d)}`,
    steps: () => [
      'Chop leftover protein small. Mix with onion, chilli, and lots of lemon.',
      'Warm briefly in a pan if you like; season with soy or salt.',
      'Pile onto lettuce or cabbage. Top with a fried egg if you have one.',
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
  if (conflictsAvoid(t, opts.avoid)) score -= 100
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
    .filter((t) => !conflictsAvoid(t, avoid))
    .map((t) => ({
      t,
      score: scoreTemplate(t, {
        culture: opts.culture,
        recipeIntent: opts.recipeIntent,
        confirmed,
        avoid,
      }),
    }))
    .filter((r) => r.score > -50)
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

    let displayIngs = filterAvoid(withExtras, avoid)
    const diet = opts.dietary.toLowerCase()
    if (diet.includes('no pork') || isAvoided('pork', avoid)) {
      displayIngs = displayIngs.filter((i) => !/pork|bacon|ham/i.test(i))
    }
    if (diet.includes('vegetarian') || diet.includes('vegan')) {
      const veg = displayIngs.filter(
        (i) => !/chicken|pork|beef|fish|tuna|mince|sausage|snag|meat|bacon|ham/i.test(i),
      )
      if (veg.length >= 3) displayIngs = veg
    }

    const shop = shoppingGaps(t.extras, confirmed, avoid)
    const safeExtras = filterAvoid(t.extras, avoid)

    const card: RecipeCard = {
      id: `${t.id}-${idx}`,
      title: t.title,
      culture: t.culture,
      cultureLabel: CULTURE_LABELS[t.culture],
      timeMins: time,
      servings: opts.recipeIntent === 'substantial' ? 4 : 2,
      summary: t.summary(opts.dietary, opts.recipeIntent),
      ingredients: displayIngs.length >= 2 ? displayIngs : safeExtras.slice(0, 6),
      steps: t.steps(displayIngs, opts.recipeIntent),
      shoppingList: shop,
      tags: [opts.recipeIntent, t.culture, opts.timing + 'min'],
      disclaimer: DISCLAIMER,
    }
    return cardAvoidFree(card, avoid)
  })
}

export { CULTURE_LABELS, DISCLAIMER }
