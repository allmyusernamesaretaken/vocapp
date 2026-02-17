const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

/**
 * Fetch all German translations for an English word via MyMemory API.
 * Returns a comma-separated string of all unique translations from the API matches.
 * @param {string} word - English word
 * @returns {Promise<string>} Comma-separated translations or empty string on failure
 */
export async function translateEnToDe(word) {
  if (!word?.trim()) return ''
  const encoded = encodeURIComponent(word.trim())
  const url = `${MYMEMORY_URL}?q=${encoded}&langpair=en|de`
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const data = await res.json()
    const main = data?.responseData?.translatedText?.trim() ?? ''
    const matches = data?.matches ?? []
    const all = new Set()
    if (main) all.add(main)
    for (const m of matches) {
      const t = m?.translation?.trim()
      if (t) all.add(t)
    }
    return Array.from(all).join(', ')
  } catch {
    return ''
  }
}
