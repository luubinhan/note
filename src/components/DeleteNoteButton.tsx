import type { RefObject } from 'react'
import { saveNote } from '../lib/noteDb'

type DeleteNoteButtonProps = {
  editorRef: RefObject<HTMLDivElement | null>
}

export function DeleteNoteButton({ editorRef }: DeleteNoteButtonProps) {
  const handleDelete = () => {
    const el = editorRef.current
    if (!el) return

    el.textContent = ''
    el.focus()
    void saveNote('')
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      aria-label="Delete note"
      className="cursor-pointer fixed top-6 right-6 z-50 flex size-11 items-center justify-center rounded-full bg-slate-800/80 text-xl backdrop-blur hover:bg-slate-700/90"
    >
      🗑️
    </button>
  )
}
