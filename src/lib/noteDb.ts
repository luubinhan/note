const DB_NAME = 'note-app'
const DB_VERSION = 1
const STORE_NAME = 'notes'
const DRAFT_ID = 'draft' as const

export type NoteRecord = {
  id: typeof DRAFT_ID
  text: string
  updatedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function getNote(): Promise<NoteRecord | null> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(DRAFT_ID)

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to get note'))
      }

      request.onsuccess = () => {
        resolve((request.result as NoteRecord | undefined) ?? null)
      }
    })
  } finally {
    db.close()
  }
}

export async function saveNote(text: string): Promise<void> {
  const record: NoteRecord = {
    id: DRAFT_ID,
    text,
    updatedAt: Date.now(),
  }

  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(record)

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to save note'))
      }

      tx.oncomplete = () => {
        resolve()
      }

      tx.onerror = () => {
        reject(tx.error ?? new Error('Failed to save note'))
      }
    })
  } finally {
    db.close()
  }
}
