import { createContext, useCallback, useContext, useState } from 'react'

// Permet à n'importe quel écran (ex: DocumentReaderScreen) de pré-scoper le
// widget flottant Chatbot (monté une seule fois, globalement, dans
// RootNavigator) à un document précis — équivalent mobile du AskAiPanel
// web, mais en réutilisant le même composant plutôt qu'un panneau séparé.
const AiChatContext = createContext(null)

export function AiChatProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [document, setDocument] = useState(null) // { id, title } | null

  const openForDocument = useCallback((id, title) => {
    setDocument({ id, title })
    setOpen(true)
  }, [])

  const openGeneral = useCallback(() => {
    setDocument(null)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return (
    <AiChatContext.Provider value={{ open, document, openForDocument, openGeneral, close }}>
      {children}
    </AiChatContext.Provider>
  )
}

export function useAiChat() {
  const ctx = useContext(AiChatContext)
  if (!ctx) throw new Error('useAiChat doit être utilisé à l’intérieur de AiChatProvider')
  return ctx
}
