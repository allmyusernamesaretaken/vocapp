const FREE_DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'

/**
 * Fetch official IPA phonetic pronunciation for an English word.
 * @param {string} word - English word
 * @returns {Promise<string>} IPA string (e.g. "/həˈloʊ/") or empty string on failure
 */
export async function fetchPhonetic(word) {
  if (!word?.trim()) return ''
  const encoded = encodeURIComponent(word.trim().toLowerCase())
  const url = `${FREE_DICTIONARY_URL}/${encoded}`
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return ''
    const entry = data[0]
    const phonetics = entry?.phonetics
    if (!Array.isArray(phonetics)) return ''
    const withText = phonetics.find((p) => p?.text?.trim())
    return withText?.text?.trim() ?? ''
  } catch {
    return ''
  }
}
