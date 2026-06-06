import type { Statut } from '@/types'

const BADGE_STYLES: Record<Statut, string> = {
  'À faire': 'bg-gray-100 text-gray-600',
  'En cours': 'bg-sage/20 text-sage-dark',
  'Fait': 'bg-rose/20 text-rose-dark',
}

interface Props {
  statut: Statut
  onClick?: (e: React.MouseEvent) => void
}

export function TaskStatusBadge({ statut, onClick }: Props) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[statut]}
        ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      {statut}
    </span>
  )
}
