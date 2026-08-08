import { useRef, type ClipboardEvent } from 'react'
import { Toaster } from 'react-hot-toast'
import { CopyNoteButton } from './components/CopyNoteButton'
import { DeleteNoteButton } from './components/DeleteNoteButton'
import { usePersistedNote } from './hooks/usePersistedNote'

function App() {
  const editorRef = useRef<HTMLDivElement>(null)
  usePersistedNote(editorRef)

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <main className="min-h-screen text-slate-50 flex items-center justify-center p-10 sm:p-8">
      <Toaster />
      <DeleteNoteButton editorRef={editorRef} />
      <CopyNoteButton editorRef={editorRef} />
      <div className="w-full max-w-2xl min-h-[90vh] text-center space-y-4">
        <div
          ref={editorRef}
          contentEditable
          onPaste={handlePaste}
          className="text-left w-full min-h-[90vh] resize-none text-2xl/9 sm:text-4xl/12 focus:outline-none whitespace-pre-wrap break-words"
        />
      </div>
    </main>
  )
}

export default App
