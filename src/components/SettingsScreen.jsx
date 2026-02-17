import { useRef } from 'react'
import { Upload, FileText, List, Braces, Sun, Moon } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { useTheme } from '../context/ThemeContext'
import { db } from '../db/db'
import {
  exportCSV,
  exportAnkiTSV,
  exportJSON,
  importJSON,
  downloadBlob
} from '../utils/exportUtils'
import { Button } from './ui/Button'
import { Label } from './ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

export function SettingsScreen() {
  const { words } = useWords()
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef(null)

  const count = words.length

  const handleExport = (format) => {
    if (format === 'csv') {
      downloadBlob(exportCSV(words), `vocapp-export-${dateSuffix()}.csv`, 'text/csv;charset=utf-8')
    } else if (format === 'anki') {
      downloadBlob(exportAnkiTSV(words), `vocapp-anki-${dateSuffix()}.txt`, 'text/tab-separated-values;charset=utf-8')
    } else {
      downloadBlob(exportJSON(words), `vocapp-backup-${dateSuffix()}.json`, 'application/json')
    }
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return
      const list = importJSON(text)
      if (list.length === 0) {
        alert('No valid entries in file.')
        return
      }
      for (const w of list) {
        await db.words.add({
          word: w.word,
          translation: w.translation,
          phonetic: w.phonetic ?? '',
          source: w.source ?? '',
          dateAdded: w.dateAdded || new Date().toISOString()
        })
      }
      alert(`Imported ${list.length} word(s).`)
      window.location.reload()
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] safe-bottom pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {count} word{count !== 1 ? 's' : ''} in your collection. Download in your preferred format.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('anki')}>
                <List className="h-4 w-4" />
                Anki TSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Braces className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import</CardTitle>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Restore your vocabulary from a previously exported JSON backup.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Choose JSON file
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Choose light, dark, or follow your device setting.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function dateSuffix() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
