export const PANTRY_LENS_API = 'https://forkward-pantry-lens.damienmueller.workers.dev'

export interface AiRecipe {
  title: string
  time: string
  ingredients: string[]
  steps: string[]
}
export interface AiResult {
  ingredients: string[]
  recipes: AiRecipe[]
}

/** Downscale to a JPEG data URL (~1280px max side) so uploads stay well under 4 MB. */
export async function fileToJpegDataUrl(file: File, maxSide = 1280): Promise<string> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

export async function analysePantryPhoto(
  file: File,
  opts: { ingredients?: string[]; avoid?: string[]; prefs?: string } = {},
): Promise<AiResult> {
  const image = await fileToJpegDataUrl(file)
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 45000)
  try {
    const res = await fetch(PANTRY_LENS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, ...opts }),
      signal: ctrl.signal,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
    if (!Array.isArray(data.ingredients)) throw new Error('Unexpected response')
    return data as AiResult
  } finally {
    clearTimeout(t)
  }
}
