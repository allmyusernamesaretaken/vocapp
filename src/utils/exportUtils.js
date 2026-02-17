/**
 * Export words to CSV (UTF-8). Columns: word, translation, phonetic, source, dateAdded
 */
export function exportCSV(words) {
  const header = 'word,translation,phonetic,source,dateAdded'
  const rows = words.map((w) => {
    const escape = (s) => {
      const str = String(s ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    return [w.word, w.translation, w.phonetic ?? '', w.source ?? '', w.dateAdded ?? ''].map(escape).join(',')
  })
  return [header, ...rows].join('\n')
}

/**
 * Export words to Anki TSV: front (word + phonetic if present), back (translation)
 */
export function exportAnkiTSV(words) {
  const rows = words.map((w) => {
    const front = w.phonetic?.trim() ? `${w.word} ${w.phonetic}` : w.word
    const back = w.translation ?? ''
    return [front, back].join('\t')
  })
  return rows.join('\n')
}

/**
 * Full JSON export for backup/restore
 */
export function exportJSON(words) {
  return JSON.stringify(words, null, 2)
}

/**
 * Parse JSON import; returns array of word objects or empty on error
 */
export function importJSON(text) {
  try {
    const data = JSON.parse(text)
    const list = Array.isArray(data) ? data : [data]
    return list.map((w) => ({
      word: w.word ?? '',
      translation: w.translation ?? '',
      phonetic: w.phonetic ?? '',
      source: w.source ?? '',
      dateAdded: w.dateAdded ?? new Date().toISOString(),
      id: w.id
    }))
  } catch {
    return []
  }
}

/**
 * Trigger browser download of a string as a file
 */
export function downloadBlob(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
