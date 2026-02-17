import { useState, useEffect } from 'react'
import { Save, Trash2 } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/Dialog'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

export function WordDetail({ wordId, open, onClose }) {
  const { getWord, updateWord, deleteWord } = useWords()
  const [word, setWord] = useState(null)
  const [wordText, setWordText] = useState('')
  const [translation, setTranslation] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [source, setSource] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !wordId) {
      setWord(null)
      return
    }
    let cancelled = false
    getWord(wordId).then((w) => {
      if (!cancelled && w) {
        setWord(w)
        setWordText(w.word ?? '')
        setTranslation(w.translation ?? '')
        setPhonetic(w.phonetic ?? '')
        setSource(w.source ?? '')
      }
    })
    return () => { cancelled = true }
  }, [open, wordId, getWord])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!word || !wordText.trim() || !translation.trim()) return
    setSaving(true)
    try {
      await updateWord(word.id, {
        word: wordText.trim(),
        translation: translation.trim(),
        phonetic: phonetic.trim(),
        source: source.trim(),
        dateAdded: word.dateAdded
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!word || !window.confirm('Delete this word?')) return
    setDeleting(true)
    try {
      await deleteWord(word.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit word</DialogTitle>
        </DialogHeader>
        {word && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detail-word">English word</Label>
              <Input
                id="detail-word"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-translation">German translation</Label>
              <Input
                id="detail-translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-phonetic">Pronunciation (IPA)</Label>
              <Input
                id="detail-phonetic"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-source">Source</Label>
              <Input
                id="detail-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
