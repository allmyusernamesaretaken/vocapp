/**
 * Create a blob of the cropped region of an image.
 * @param {string} imageSrc - Data URL or object URL of the image
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Crop area in pixels
 * @returns {Promise<Blob>}
 */
export async function getCroppedImageBlob(imageSrc, pixelCrop) {
  const image = await createImageBitmap(
    await (await fetch(imageSrc)).blob()
  )
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d not available')
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )
  image.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}
