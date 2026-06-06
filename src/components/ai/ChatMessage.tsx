import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-sage text-white rounded-br-sm'
            : 'bg-cream-card border border-border-card text-gray-800 rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-xs opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {message.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
