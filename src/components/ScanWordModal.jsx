import { useState, useRef, useCallback, useEffect } from 'react'
import { Cropper } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { Loader2, Camera } from 'lucide-react'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/Dialog'

const CROPPER_HEIGHT = 320
const MAGNIFIER_SIZE = 100
const MAGNIFIER_ZOOM = 2.5

export function ScanWordModal({ open, onClose, onWordExtracted }) {
  const [step, setStep] = useState('pick')
  const [imageSrc, setImageSrc] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [magnifier, setMagnifier] = useState(null)
  const [magnifierPreview, setMagnifierPreview] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState(null)
  const cameraInputRef = useRef(null)
  const cropperRef = useRef(null)
  const isResizingRef = useRef(false)

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setError(null)
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    setStep('crop')
    setZoom(1)
    setMagnifier(null)
    setMagnifierPreview(null)
    e.target.value = ''
  }

  const handleZoomChange = useCallback((value) => {
    const num = Number(value)
    setZoom(num)
    if (cropperRef.current) {
      cropperRef.current.zoomImage(num)
    }
  }, [])

  const handleExtract = async () => {
    if (!cropperRef.current) return
    setExtracting(true)
    setError(null)
    try {
      const canvas = cropperRef.current.getCanvas()
      if (!canvas) {
        setError('Could not get crop. Try again.')
        return
      }
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      })
      const Tesseract = (await import('tesseract.js')).default
      const { data: { text } } = await Tesseract.recognize(blob, 'eng', { logger: () => {} })
      const cleaned = text
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)[0]
        ?.replace(/[^a-zA-Z'-]/g, '') || ''
      if (cleaned) {
        onWordExtracted(cleaned)
        handleClose()
      } else {
        setError('No word detected. Try zooming in on a single word.')
      }
    } catch (err) {
      setError(err?.message || 'Text recognition failed. Try again.')
    } finally {
      setExtracting(false)
    }
  }

  const handleClose = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc)
    setStep('pick')
    setImageSrc(null)
    setMagnifier(null)
    setMagnifierPreview(null)
    setError(null)
    setExtracting(false)
    isResizingRef.current = false
    onClose()
  }

  const updateMagnifierPreview = useCallback(() => {
    if (cropperRef.current) {
      try {
        const canvas = cropperRef.current.getCanvas()
        if (canvas) setMagnifierPreview(canvas.toDataURL('image/png'))
      } catch (_) {}
    }
  }, [])

  const onResize = useCallback(() => {
    isResizingRef.current = true
    updateMagnifierPreview()
  }, [updateMagnifierPreview])

  const onResizeEnd = useCallback(() => {
    isResizingRef.current = false
    setMagnifier(null)
    setMagnifierPreview(null)
  }, [])

  const onCropperChange = useCallback((cropper) => {
    if (cropper) cropperRef.current = cropper
    if (isResizingRef.current) updateMagnifierPreview()
  }, [updateMagnifierPreview])

  useEffect(() => {
    if (step !== 'crop' || !imageSrc) return
    const onPointerMove = (e) => {
      if (!isResizingRef.current) return
      const x = e.clientX ?? (e.touches && e.touches[0]?.clientX)
      const y = e.clientY ?? (e.touches && e.touches[0]?.clientY)
      if (x != null && y != null) setMagnifier({ x, y })
    }
    const onPointerUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false
        setMagnifier(null)
        setMagnifierPreview(null)
      }
    }
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('touchend', onPointerUp)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('touchend', onPointerUp)
    }
  }, [step, imageSrc])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-stone-200 px-5 py-4 dark:border-stone-700">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan word
          </DialogTitle>
        </DialogHeader>

        {step === 'pick' && (
          <div className="flex flex-col items-center gap-4 px-5 pb-5 pt-2">
            <p className="text-center text-sm text-stone-600 dark:text-stone-400">
              Take a photo of the word, then crop to it and we will extract the text.
            </p>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="h-4 w-4" />
              Take photo
            </Button>
          </div>
        )}

        {step === 'crop' && imageSrc && (
          <>
            <div className="relative bg-stone-900" style={{ height: CROPPER_HEIGHT }}>
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                className="cropper-scan"
                imageRestriction="none"
                stencilProps={{
                  handlers: true,
                  lines: true,
                  movable: true,
                  resizable: true
                }}
                defaultTransforms={{ scale: 1 }}
                onResize={onResize}
                onResizeEnd={onResizeEnd}
                onChange={onCropperChange}
                onReady={(cropper) => {
                  if (cropper) cropperRef.current = cropper
                }}
              />
              {magnifier && magnifierPreview && (
                <div
                  className="pointer-events-none fixed z-[100] rounded-full border-4 border-stone-300 bg-stone-900 shadow-xl overflow-hidden"
                  style={{
                    width: MAGNIFIER_SIZE,
                    height: MAGNIFIER_SIZE,
                    left: Math.max(8, Math.min(window.innerWidth - MAGNIFIER_SIZE - 8, magnifier.x - MAGNIFIER_SIZE / 2)),
                    top: Math.max(8, magnifier.y - MAGNIFIER_SIZE - 12)
                  }}
                >
                  <img
                    src={magnifierPreview}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      transform: `scale(${MAGNIFIER_ZOOM})`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              )}
            </div>
            <div className="border-t border-stone-200 px-5 py-4 dark:border-stone-700">
              <label className="mb-2 block text-xs font-medium text-stone-600 dark:text-stone-400">
                Zoom image (edges can hide)
              </label>
              <input
                type="range"
                min={1}
                max={4}
                step={0.1}
                value={zoom}
                onChange={(e) => handleZoomChange(e.target.value)}
                className="mb-4 w-full accent-stone-700 dark:accent-stone-400"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex-1"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extracting…
                    </>
                  ) : (
                    'Extract word'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
