import { useEffect, useRef } from 'react'

function App() {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    el.focus()

    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(true)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-8">
      <div className="min-w-2xl min-h-[90vh] max-w-2xl text-center space-y-4 ">
        <div
          ref={editorRef}
          contentEditable
          className="text-left w-full min-h-[90vh] resize-none text-4xl/12 focus:outline-none"
        />
      </div>
    </main>
  )
}

export default App
