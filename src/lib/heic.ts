/** HEIC/HEIF detect + optional client-side convert via heic2any. */

export function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  )
}

export async function tryConvertHeicToJpeg(
  file: File,
): Promise<{ ok: true; file: File; previewUrl: string } | { ok: false; guidance: string }> {
  const guidance =
    'HEIC/HEIF needs converting for this browser. On iPhone: Settings → Camera → Formats → Most Compatible, or Share → Save as JPEG / Export as JPG, then re-upload.'

  try {
    const heic2any = (await import('heic2any')).default
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    const blob = Array.isArray(result) ? result[0] : result
    if (!blob) return { ok: false, guidance }
    const name = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const jpeg = new File([blob], name, { type: 'image/jpeg' })
    return { ok: true, file: jpeg, previewUrl: URL.createObjectURL(jpeg) }
  } catch {
    return { ok: false, guidance }
  }
}

export const HEIC_ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif'

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024
