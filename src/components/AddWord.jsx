import { useState, useEffect, useRef } from 'react'
import { Loader2, Save, Camera } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { translateEnToDe } from '../utils/translate'
import { fetchPhonetic } from '../utils/phonetic'
import { suggestWords } from '../utils/suggestWords'
import { ScanWordModal } from './ScanWordModal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

const SUGGEST_DEBOUNCE_MS = 300
const MIN_LENGTH_FOR_SUGGEST = 2

export function AddWord() {
  const { addWord } = useWords()
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [offlineMessage, setOfflineMessage] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const suggestRef = useRef(null)

  useEffect(() => {
    if (confirming || word.trim().length < MIN_LENGTH_FOR_SUGGEST) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    const t = setTimeout(() => {
      suggestWords(word.trim(), { max: 8 }).then((list) => {
        setSuggestions(list)
        setSuggestionsOpen(list.length > 0)
      })
    }, SUGGEST_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [word, confirming])

  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = word.trim()
    if (!trimmed) return
    setLoading(true)
    setOfflineMessage('')
    try {
      const [trans, phon] = await Promise.all([
        translateEnToDe(trimmed),
        fetchPhonetic(trimmed)
      ])
      const isOffline = !navigator.onLine
      if (isOffline || (!trans && !phon)) {
        setOfflineMessage(
          isOffline
            ? 'Translation unavailable offline — please enter manually'
            : trans ? '' : 'Translation unavailable offline — please enter manually'
        )
      }
      if (!trans && !isOffline) {
        setOfflineMessage('Translation not found — please enter manually')
      }
      setTranslation(trans)
      setPhonetic(phon || '')
      setConfirming(true)
    } catch {
      setOfflineMessage('Translation unavailable offline — please enter manually')
      setTranslation('')
      setPhonetic('')
      setConfirming(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!word.trim() || !translation.trim()) return
    await addWord({
      word: word.trim(),
      translation: translation.trim(),
      phonetic: phonetic.trim(),
      source: source.trim()
    })
    setWord('')
    setTranslation('')
    setPhonetic('')
    setSource('')
    setConfirming(false)
    setOfflineMessage('')
  }

  const handleCancelConfirm = () => {
    setConfirming(false)
    setOfflineMessage('')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] safe-bottom pb-24">
      <div className="mx-auto max-w-lg px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Add a word</CardTitle>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Type an English word to translate and save with its German meaning.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2" ref={suggestRef}>
                <Label htmlFor="word">English word</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                    id="word"
                    placeholder="Type a word"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {suggestionsOpen && suggestions.length > 0 && (
                    <ul
                      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-52 overflow-auto rounded-xl border-2 border-stone-200 bg-white py-1.5 shadow-xl shadow-stone-300/50 dark:border-stone-700 dark:bg-stone-900 dark:shadow-stone-950/50"
                      role="listbox"
                    >
                      {suggestions.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            role="option"
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                            onClick={() => {
                              setWord(s)
                              setSuggestionsOpen(false)
                            }}
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScanOpen(true)}
                  disabled={loading}
                  className="shrink-0"
                  title="Scan word from camera"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {!confirming ? (
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Looking up…
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              ) : null}
            </form>

            {confirming && (
              <form onSubmit={handleSave} className="space-y-5 border-t-2 border-stone-200 pt-5 dark:border-stone-700">
                {offlineMessage && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    {offlineMessage}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="translation">German translation</Label>
                  <Input
                    id="translation"
                    placeholder="Translation"
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonetic">Pronunciation (IPA)</Label>
                  <Input
                    id="phonetic"
                    placeholder="e.g. /həˈloʊ/"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source (book or context)</Label>
                  <Input
                    id="source"
                    placeholder="Optional"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancelConfirm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!translation.trim()} className="flex-1">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <ScanWordModal
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onWordExtracted={(w) => setWord(w)}
        />
      </div>
    </div>
  )
}
