import type { RefObject } from 'react'
import toast from 'react-hot-toast'

type CopyNoteButtonProps = {
  editorRef: RefObject<HTMLDivElement | null>
}

export function CopyNoteButton({ editorRef }: CopyNoteButtonProps) {
  async function handleCopy() {
    const text = editorRef.current?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      toast.success('copied!')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy note"
      className="fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-lg bg-slate-800/80 text-xl backdrop-blur hover:bg-slate-700/90"
    >
      📋
    </button>
  )
}
