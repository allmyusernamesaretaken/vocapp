/**
 * Create a blob of the cropped region of an image.
 * pixelCrop should be in natural image coordinates (as returned by react-easy-crop).
 * @param {string} imageSrc - Data URL or object URL of the image
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Crop area in pixels (natural image coords)
 * @returns {Promise<Blob>}
 */
export async function getCroppedImageBlob(imageSrc, pixelCrop) {
  const img = await new Promise((resolve, reject) => {
    const image = new Image()
    if (!imageSrc.startsWith('blob:')) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = imageSrc
  })

  const { naturalWidth, naturalHeight } = img
  const x = Math.max(0, Math.round(pixelCrop.x))
  const y = Math.max(0, Math.round(pixelCrop.y))
  const w = Math.min(naturalWidth - x, Math.round(pixelCrop.width))
  const h = Math.min(naturalHeight - y, Math.round(pixelCrop.height))

  if (w <= 0 || h <= 0) {
    throw new Error('Invalid crop area')
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d not available')
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}
