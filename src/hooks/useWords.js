import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/db'

export function useWords() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await db.words.orderBy('dateAdded').reverse().toArray()
      setWords(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addWord = useCallback(async (entry) => {
    const now = new Date().toISOString()
    const id = await db.words.add({
      word: entry.word.trim(),
      translation: entry.translation.trim(),
      phonetic: entry.phonetic?.trim() ?? '',
      source: entry.source?.trim() ?? '',
      dateAdded: now
    })
    await refresh()
    return id
  }, [refresh])

  const updateWord = useCallback(async (id, entry) => {
    await db.words.update(id, {
      word: entry.word.trim(),
      translation: entry.translation.trim(),
      phonetic: entry.phonetic?.trim() ?? '',
      source: entry.source?.trim() ?? '',
      dateAdded: entry.dateAdded
    })
    await refresh()
  }, [refresh])

  const deleteWord = useCallback(async (id) => {
    await db.words.delete(id)
    await refresh()
  }, [refresh])

  const getWord = useCallback(async (id) => {
    return db.words.get(id)
  }, [])

  return { words, loading, refresh, addWord, updateWord, deleteWord, getWord }
}
