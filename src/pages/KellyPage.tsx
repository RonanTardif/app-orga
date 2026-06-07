import { useState } from 'react'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { useAllTasks } from '@/hooks/useTasks'
import { useKellyMemory } from '@/hooks/useKellyMemory'
import { runAgent, type PendingAction } from '@/lib/agent'
import { executeWriteTool, executeReschedulerCascade } from '@/lib/toolExecutor'
import type { ChatMessage } from '@/types'
import type { Message as AgentMessage } from '@/lib/claude'
import type { CascadePreview } from '@/lib/utils'

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: `Bonjour ! Je suis **Kelly**, votre wedding planner IA pour le mariage de Ronan & Lorie ! 💍

Je suis là pour vous aider à coordonner toute l'organisation du grand jour. Voici ce que vous pouvez me demander :

- **"Qui est disponible en ce moment ?"** — je consulte les statuts en temps réel
- **"Quel est le statut de la décoration chapelle ?"** — je trouve la tâche et son avancement
- **"Affecte Marie sur la tâche accueil invités"** — je réassigne avec confirmation
- **"Marque la tâche fleurs comme terminée"** — je mets à jour le statut
- **"Est-ce que la charge est bien répartie ?"** — j'analyse l'organisation

Qu'est-ce que je peux faire pour vous aujourd'hui ? 🌸`,
  timestamp: new Date(),
}

export function KellyPage() {
  const { allTasks } = useAllTasks()
  const { kellyMemory } = useKellyMemory()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  const [agentHistory, setAgentHistory] = useState<AgentMessage[]>([])
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  function addMessage(role: 'user' | 'assistant', content: string) {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date() }])
  }

  async function handleSend(text: string) {
    addMessage('user', text)
    setLoading(true)

    try {
      const result = await runAgent(text, agentHistory, allTasks, kellyMemory)

      if (result.type === 'response') {
        addMessage('assistant', result.content)
        setAgentHistory((prev) => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content: result.content },
        ])
      } else {
        setPendingAction(result.action)
        setAgentHistory((prev) => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content: `[Action proposée : ${result.action.summary}]` },
        ])
      }
    } catch {
      addMessage('assistant', "Une erreur s'est produite. Réessaie dans un moment.")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!pendingAction) return
    setConfirmLoading(true)

    try {
      let confirmMsg: string

      if (pendingAction.toolName === 'rescheduler_cascade') {
        const previews = pendingAction.toolInput.previews as CascadePreview[]
        confirmMsg = await executeReschedulerCascade(previews)
      } else {
        confirmMsg = await executeWriteTool(pendingAction.toolName, pendingAction.toolInput)
      }

      setPendingAction(null)
      addMessage('assistant', `✅ ${confirmMsg}`)
      setAgentHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `Action confirmée : ${confirmMsg}` },
      ])
    } catch (err) {
      console.error('[Kelly] executeWriteTool error:', err)
      setPendingAction(null)
      const msg = err instanceof Error ? err.message : String(err)
      addMessage('assistant', `Erreur : ${msg}`)
    } finally {
      setConfirmLoading(false)
    }
  }

  function handleCancel() {
    const summary = pendingAction?.summary ?? 'action'
    setPendingAction(null)
    addMessage('assistant', 'Action annulée. Aucune modification effectuée.')
    setAgentHistory((prev) => [
      ...prev,
      { role: 'assistant', content: `Action annulée : ${summary}` },
    ])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 border-b border-border-card bg-cream-card">
        <h1 className="text-lg font-semibold text-sage-dark">Kelly ✨</h1>
        <p className="text-xs text-gray-400 mt-0.5">Votre wedding planner IA</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          pendingAction={pendingAction}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmLoading={confirmLoading}
        />
      </div>
    </div>
  )
}
