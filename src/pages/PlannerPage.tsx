import { useState } from 'react'
import { ChatInterface } from '@/components/ai/ChatInterface'
import { useAllTasks } from '@/hooks/useTasks'
import { runAgent, type PendingAction } from '@/lib/agent'
import { executeWriteTool, executeReschedulerCascade } from '@/lib/toolExecutor'
import type { ChatMessage } from '@/types'
import type { Message as AgentMessage } from '@/lib/claude'
import type { CascadePreview } from '@/lib/utils'

export function PlannerPage() {
  const { allTasks } = useAllTasks()
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
      const result = await runAgent(text, agentHistory, allTasks)

      if (result.type === 'response') {
        addMessage('assistant', result.content)
        setAgentHistory((prev) => [
          ...prev,
          { role: 'user', content: text },
          { role: 'assistant', content: result.content },
        ])
      } else {
        setPendingAction(result.action)
        // P-01 : conserver l'intention de l'agent dans l'historique pour les tours suivants
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
    } catch {
      setPendingAction(null)
      addMessage('assistant', "Erreur lors de l'exécution de l'action.")
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
        <h1 className="text-lg font-semibold text-sage-dark">Planner IA</h1>
        <p className="text-xs text-gray-400 mt-0.5">Pose une question ou donne une instruction</p>
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
