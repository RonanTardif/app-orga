import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { ChatMessage } from '@/components/ai/ChatMessage'
import { ConfirmationCard } from '@/components/ai/ConfirmationCard'
import type { ChatMessage as ChatMessageType } from '@/types'
import type { PendingAction } from '@/lib/agent'

interface Props {
  messages: ChatMessageType[]
  loading: boolean
  onSend: (text: string) => void
  pendingAction?: PendingAction | null
  onConfirm?: () => void
  onCancel?: () => void
  confirmLoading?: boolean
}

export function ChatInterface({
  messages,
  loading,
  onSend,
  pendingAction,
  onConfirm,
  onCancel,
  confirmLoading,
}: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, pendingAction])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || pendingAction) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !pendingAction && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center px-6">
              Pose une question sur l'état des tâches, la disponibilité de l'équipe, ou donne une instruction.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-cream-card border border-border-card rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-sage rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        {pendingAction && onConfirm && onCancel && (
          <ConfirmationCard
            action={pendingAction}
            onConfirm={onConfirm}
            onCancel={onCancel}
            loading={confirmLoading}
          />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-border-card bg-cream-card"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pendingAction ? 'Confirme ou annule l\'action ci-dessus…' : 'Ex : Qui est dispo maintenant ?'}
          className="flex-1 rounded-xl border border-border-card bg-cream px-4 py-2.5 text-sm outline-none focus:border-sage transition-colors disabled:opacity-50"
          disabled={loading || !!pendingAction}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || !!pendingAction}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-sage text-white disabled:opacity-40 transition-opacity"
          aria-label="Envoyer"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
