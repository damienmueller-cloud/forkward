export interface SwapItem {
  id: string
  habit: string
  category: 'alcohol' | 'carbs' | 'snacks'
  typicalWeekly: string
  swapFor: string
  roughImpact: string
  howMuch: string
  tip: string
  alcoholDisclaimer?: boolean
}

export interface ProductSuggestion {
  id: string
  label: string
  why: string
  pairsWith: string
}

/** Generic comparable suggestions — no real company brand names. */
export const productSuggestions: ProductSuggestion[] = [
  {
    id: 'creatine-gummies',
    label: 'Creatine gummies (sugar-conscious)',
    why: 'Convenient daily creatine for training consistency without mixing powder.',
    pairsWith: 'Strength routine + protein-forward meals',
  },
  {
    id: 'liver-support',
    label: 'Liver-support style detox program (supplement course)',
    why: 'A structured 2–4 week course some people use alongside cutting back on alcohol and fried foods. Not a cure.',
    pairsWith: 'Alcohol reduction swaps',
  },
  {
    id: 'electrolyte-drink',
    label: 'Sugar-free electrolyte drink (G-up style energy)',
    why: 'Hydration + electrolytes without the beer kilojoule load. Useful after training or as an evening alternative.',
    pairsWith: 'Beer / spirits cutbacks',
  },
]

export const swapCatalogue: SwapItem[] = [
  {
    id: 'beer',
    habit: 'Beer (mid-strength / full-strength)',
    category: 'alcohol',
    typicalWeekly: '7–14 standard drinks (common for AU men 40–50)',
    swapFor: 'Sugar-free electrolyte drink, soda water + lime, or alcohol-free beer',
    roughImpact:
      'Cutting ~7 middies/week can remove roughly 3,500–5,000+ kJ/week depending on brand — often cited as ~0.4–0.7 kg/month of energy surplus if not replaced with other kilojoules.',
    howMuch:
      'If you swapped 1 mid-strength beer (~450 mL) for a sugar-free electrolyte drink: you drop ~500–700 kJ that sitting, keep fluid intake, and avoid the late-night snack trigger for many people.',
    tip: 'Start with weeknights only. Keep one social beer if that helps you stick.',
    alcoholDisclaimer: true,
  },
  {
    id: 'spirits',
    habit: 'Spirits / vodka mixers',
    category: 'alcohol',
    typicalWeekly: '4–10 standard drinks',
    swapFor: 'Soda water, diet mixer, or herbal tea after dinner',
    roughImpact:
      'Mixers often add more sugar than the spirit. Switching to soda water can cut hundreds of kJ per night without changing the social glass in your hand.',
    howMuch:
      'Swap 2 vodka-sodas with sugary mixer for vodka + soda/lime (or skip entirely): save ~400–800 kJ per session from mixer sugar alone.',
    tip: 'If cutting alcohol, plan a non-drink ritual (walk, gym, series) for the first 2 weeks.',
    alcoholDisclaimer: true,
  },
  {
    id: 'potatoes',
    habit: 'Potatoes (roast / mash / chips at home)',
    category: 'carbs',
    typicalWeekly: '4–7 serves',
    swapFor: 'Half potato + half cauliflower mash, or roasted pumpkin / zucchini',
    roughImpact:
      'Replacing one large potato serve (~150–200 g cooked) with non-starchy veg most nights can trim ~400–700 kJ per meal.',
    howMuch:
      'If you swapped potatoes 5 nights/week for mixed roast veg: rough ballpark 2,000–3,500 kJ/week less — meaningful over a month if calories are not added back elsewhere.',
    tip: 'Keep crispy roast potatoes for Friday — scarcity makes them taste better.',
  },
  {
    id: 'chips',
    habit: 'Potato chips / crisps',
    category: 'snacks',
    typicalWeekly: '2–5 snack packs',
    swapFor: 'Air-popped popcorn, roasted chickpeas, or portioned nuts',
    roughImpact:
      'A 50 g chip pack is often ~1,000–1,200 kJ. Two packs/week less ≈ 2,000+ kJ/week.',
    howMuch:
      'Swap one nightly chip pack for popcorn: similar crunch habit, usually half the kilojoules if you measure the bowl.',
    tip: 'Buy single-serve only. Open bags on the couch are the real enemy.',
  },
  {
    id: 'rice',
    habit: 'White rice (large bowls)',
    category: 'carbs',
    typicalWeekly: '5–10 cups cooked',
    swapFor: 'Half rice + half veg, cauliflower rice mix, or smaller cup measure',
    roughImpact:
      'One packed cup of cooked white rice ≈ 800–1,000 kJ. Halving the rice and filling with veg is the highest-ROI swap for many Filipino–Aussie households.',
    howMuch:
      'If you ate 1 cup less rice per day for a week: ~5,600–7,000 kJ less — before any other changes.',
    tip: 'Use a measuring cup once. Muscle memory beats willpower.',
  },
  {
    id: 'pasta',
    habit: 'Pasta dinners',
    category: 'carbs',
    typicalWeekly: '2–4 meals',
    swapFor: 'Zucchini noodles mix, lentil pasta, or ¾ portion + big salad',
    roughImpact:
      'Restaurant-style pasta plates often run 3,000–4,500 kJ. Home portions with veg can cut that by a third.',
    howMuch:
      'Swap one creamy pasta night for tomato + lean protein + salad: often 1,000–2,000 kJ saved that meal.',
    tip: 'Cook pasta, plate once, put the pot away before sitting down.',
  },
]

export const alcoholDisclaimer = `Alcohol disclaimer: Forkward is not medical, addiction, or alcohol-treatment advice. Reducing alcohol can affect medication, mental health, sleep, and relationships. If you drink heavily or feel dependent, speak with a GP or call the Australian Alcohol & Drug Information Service / Lifeline before making abrupt changes. Standard drink guidance is general education only — individual needs vary. Never drive after drinking.`
