import { useEffect, useState, type RefObject } from 'react'
import { getNote, saveNote } from '../lib/noteDb'

const DEBOUNCE_MS = 400

function focusEditor(el: HTMLDivElement, collapseToEnd: boolean) {
  el.focus()

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(!collapseToEnd)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

export function usePersistedNote(editorRef: RefObject<HTMLDivElement | null>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const persist = () => {
      void saveNote(el.innerText).catch((error: unknown) => {
        console.error('Failed to save note', error)
      })
    }

    const flush = () => {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      persist()
    }

    const onInput = () => {
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        persist()
      }, DEBOUNCE_MS)
    }

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    const boot = async () => {
      try {
        const note = await getNote()
        if (cancelled) return

        const text = note?.text ?? ''
        if (text) {
          el.textContent = text
        }
        focusEditor(el, Boolean(text))
      } catch (error) {
        console.error('Failed to load note', error)
        if (!cancelled) focusEditor(el, false)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void boot()

    el.addEventListener('input', onInput)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)

    return () => {
      cancelled = true
      el.removeEventListener('input', onInput)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      void saveNote(el.innerText).catch((error: unknown) => {
        console.error('Failed to save note', error)
      })
    }
  }, [editorRef])

  return { ready }
}
