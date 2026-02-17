import Dexie from 'dexie'

export const db = new Dexie('vocapp-db')

db.version(1).stores({
  words: '++id, word, translation, phonetic, source, dateAdded'
})
