/**
 * MVP visual transform for Reflect "after" previews.
 * Applies canvas filters + a soft "tighter midsection" warp illusion so the
 * after image is visibly different from the before (fixes Manus bug).
 */
export async function createAfterPreview(
  source: HTMLImageElement | ImageBitmap,
  opts: {
    kgLoss: number
    pushups: number
    situps: number
  },
): Promise<string> {
  const w = 'naturalWidth' in source ? source.naturalWidth : source.width
  const h = 'naturalHeight' in source ? source.naturalHeight : source.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')

  // Intensity scales with kg target and routine effort
  const intensity = Math.min(
    1,
    opts.kgLoss / 50 + opts.pushups / 200 + opts.situps / 200,
  )

  // Slight "sculpt" via vertical squeeze in mid band + sharpen/contrast
  ctx.filter = `contrast(${1 + intensity * 0.28}) saturate(${1 + intensity * 0.15}) brightness(${1 + intensity * 0.04})`
  ctx.drawImage(source, 0, 0, w, h)
  ctx.filter = 'none'

  // Soften midsection silhouette: redraw a slightly narrower waist band
  const bandTop = Math.floor(h * 0.38)
  const bandH = Math.floor(h * 0.28)
  const squeeze = 1 - intensity * 0.08
  const srcW = w
  const destW = Math.floor(w * squeeze)
  const offsetX = Math.floor((w - destW) / 2)

  const slice = ctx.getImageData(0, bandTop, srcW, bandH)
  const tmp = document.createElement('canvas')
  tmp.width = srcW
  tmp.height = bandH
  const tctx = tmp.getContext('2d')
  if (tctx) {
    tctx.putImageData(slice, 0, 0)
    ctx.fillStyle = '#101223'
    // Clear band then draw squeezed
    ctx.clearRect(0, bandTop, w, bandH)
    // Fill sides with edge colours approximated from nearby pixels
    ctx.drawImage(tmp, 0, 0, srcW, bandH, offsetX, bandTop, destW, bandH)
  }

  // Warm "progress" vignette + lime accent corner badge baked into pixels
  const grad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.45,
    w * 0.2,
    w * 0.5,
    h * 0.5,
    w * 0.75,
  )
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(16,18,35,${0.15 + intensity * 0.2})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Label strip so difference is unmistakable even on subtle transforms
  ctx.fillStyle = 'rgba(95,59,255,0.92)'
  ctx.fillRect(0, h - 48, w, 48)
  ctx.fillStyle = '#dcff48'
  ctx.font = `bold ${Math.max(14, Math.floor(w / 28))}px sans-serif`
  ctx.fillText(
    `CONCEPTUAL AFTER · −${opts.kgLoss} kg study`,
    16,
    h - 18,
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image. Try JPG, PNG, or WebP.'))
    }
    img.src = url
  })
}
