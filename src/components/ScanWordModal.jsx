import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { Loader2, Camera } from 'lucide-react'
import { getCroppedImageBlob } from '../utils/cropImage'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/Dialog'

export function ScanWordModal({ open, onClose, onWordExtracted }) {
  const [step, setStep] = useState('pick')
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState(null)
  const cameraInputRef = useRef(null)

  const onCropComplete = useCallback((_croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx)
  }, [])

  const onCropAreaChange = useCallback((_croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx)
  }, [])

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setError(null)
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    setStep('crop')
    setCrop({ x: 0, y: 0 })
    setCroppedAreaPixels(null)
    e.target.value = ''
  }

  const handleExtract = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setExtracting(true)
    setError(null)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels)
      const Tesseract = (await import('tesseract.js')).default
      const { data: { text } } = await Tesseract.recognize(blob, 'eng', {
        logger: () => {}
      })
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
    setCroppedAreaPixels(null)
    setError(null)
    setExtracting(false)
    onClose()
  }

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
            <div className="relative h-[280px] w-full bg-stone-900 touch-none" style={{ touchAction: 'pan-x pan-y' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={1}
                minZoom={1}
                maxZoom={1}
                zoomWithScroll={false}
                aspect={undefined}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onCropAreaChange={onCropAreaChange}
                objectFit="contain"
                style={{ containerStyle: { backgroundColor: '#1c1917' } }}
              />
            </div>
            <div className="border-t border-stone-200 px-5 py-4 dark:border-stone-700">
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
