import { Check, X } from 'lucide-react'
import type { PendingAction } from '@/lib/agent'

interface Props {
  action: PendingAction
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmationCard({ action, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-cream-card border border-border-card px-4 py-3 space-y-3">
        <p className="text-xs font-semibold text-sage-dark uppercase tracking-wide">
          Action à confirmer
        </p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {action.summary}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage text-white text-sm font-medium disabled:opacity-40 transition-opacity"
          >
            <Check size={15} />
            Confirmer
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-card text-gray-600 text-sm font-medium disabled:opacity-40 transition-opacity"
          >
            <X size={15} />
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
