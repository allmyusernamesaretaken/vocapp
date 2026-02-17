import { useState, useMemo } from 'react'
import { Search, ArrowDownAZ, Calendar, BookOpen } from 'lucide-react'
import { useWords } from '../hooks/useWords'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/Select'
import { WordDetail } from './WordDetail'

const SORT_DATE = 'date'
const SORT_ALPHA = 'alpha'
const SORT_SOURCE = 'source'

export function WordList() {
  const { words, loading } = useWords()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SORT_DATE)
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      (w) =>
        (w.word && w.word.toLowerCase().includes(q)) ||
        (w.source && w.source.toLowerCase().includes(q))
    )
  }, [words, search])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === SORT_DATE) {
      list.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
    } else if (sort === SORT_ALPHA) {
      list.sort((a, b) => (a.word || '').localeCompare(b.word || ''))
    } else {
      list.sort((a, b) => {
        const sa = (a.source || '').toLowerCase()
        const sb = (b.source || '').toLowerCase()
        if (sa !== sb) return sa.localeCompare(sb)
        return (a.dateAdded || '').localeCompare(b.dateAdded || '')
      })
    }
    return list
  }, [filtered, sort])

  const groupedBySource = useMemo(() => {
    if (sort !== SORT_SOURCE) return null
    const groups = new Map()
    for (const w of sorted) {
      const key = (w.source || '').trim() || '(No source)'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(w)
    }
    return Array.from(groups.entries()).map(([source, items]) => ({ source, items }))
  }, [sort, sorted])

  return (
    <div className="min-h-[calc(100vh-4rem)] safe-bottom pb-24">
      <div className="mx-auto max-w-lg px-4 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <Input
              placeholder="Search by word or source"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border-stone-200 bg-stone-50/80 pl-10 dark:border-stone-700 dark:bg-stone-800/80"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SORT_DATE}>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date added
                </span>
              </SelectItem>
              <SelectItem value={SORT_ALPHA}>
                <span className="flex items-center gap-2">
                  <ArrowDownAZ className="h-4 w-4" />
                  A–Z
                </span>
              </SelectItem>
              <SelectItem value={SORT_SOURCE}>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  By source
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-stone-500 dark:text-stone-400">Loading…</p>
        ) : groupedBySource ? (
          <div className="mt-5 space-y-6">
            {groupedBySource.map(({ source, items }) => (
              <div key={source}>
                <h2 className="sticky top-0 z-10 border-l-4 border-stone-400 bg-stone-100/95 px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-stone-700 dark:border-stone-600 dark:bg-stone-900/95 dark:text-stone-300">
                  {source}
                </h2>
                <ul className="divide-y divide-stone-200 dark:divide-stone-700">
                  {items.map((w) => (
                    <li key={w.id}>
                      <WordRow word={w} onSelect={() => setSelectedId(w.id)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-stone-200 dark:divide-stone-700">
            {sorted.map((w) => (
              <li key={w.id}>
                <WordRow word={w} onSelect={() => setSelectedId(w.id)} />
              </li>
            ))}
          </ul>
        )}

        {!loading && sorted.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {search.trim() ? 'No words match your search.' : 'No words yet. Add one from the Add tab.'}
            </p>
          </div>
        )}
      </div>

      <WordDetail
        wordId={selectedId}
        open={selectedId != null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

function WordRow({ word, onSelect }) {
  const dateStr = word.dateAdded
    ? new Date(word.dateAdded).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : ''
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/80"
    >
      <span className="font-semibold text-stone-900 dark:text-stone-100">{word.word}</span>
      <span className="text-sm text-stone-600 dark:text-stone-400">{word.translation}</span>
      {(word.source || dateStr) && (
        <span className="text-xs text-stone-500 dark:text-stone-500">
          {[word.source, dateStr].filter(Boolean).join(' · ')}
        </span>
      )}
    </button>
  )
}
