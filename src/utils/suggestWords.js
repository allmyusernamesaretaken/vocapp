const DATAMUSE_SUG_URL = 'https://api.datamuse.com/sug'

/**
 * Fetch word suggestions for autocomplete (prefix match).
 * @param {string} query - Text the user has typed
 * @param {{ max?: number }} options - max number of suggestions (default 8)
 * @returns {Promise<string[]>} List of suggested words
 */
export async function suggestWords(query, { max = 8 } = {}) {
  const q = (query || '').trim().toLowerCase()
  if (q.length < 2) return []
  const url = `${DATAMUSE_SUG_URL}?s=${encodeURIComponent(q)}&max=${max}`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((item) => (item && item.word ? String(item.word).trim() : '')).filter(Boolean)
  } catch {
    return []
  }
}
