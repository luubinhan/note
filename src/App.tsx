import { useRef, type ClipboardEvent } from 'react'
import { Toaster } from 'react-hot-toast'
import { CopyNoteButton } from './components/CopyNoteButton'
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
    <main className="min-h-screen text-slate-50 flex items-center justify-center p-8">
      <Toaster />
      <CopyNoteButton editorRef={editorRef} />
      <div className="min-w-2xl min-h-[90vh] max-w-2xl text-center space-y-4 ">
        <div
          ref={editorRef}
          contentEditable
          onPaste={handlePaste}
          className="text-left w-full min-h-[90vh] resize-none text-4xl/12 focus:outline-none"
        />
      </div>
    </main>
  )
}

export default App
