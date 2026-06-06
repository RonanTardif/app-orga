interface DispoInfo {
  aFaire: number
  enCours: number
}

interface Props {
  membre: string
  dispo: DispoInfo
  onMemberClick: (membre: string) => void
}

function dispoColor(actives: number): string {
  if (actives === 0) return 'bg-green-100 text-green-700 border-green-200'
  if (actives <= 2) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-rose/20 text-rose-dark border-rose/30'
}

export function MemberAvailability({ membre, dispo, onMemberClick }: Props) {
  const actives = dispo.aFaire + dispo.enCours

  return (
    <button
      onClick={() => onMemberClick(membre)}
      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[80px]
        transition-colors ${dispoColor(actives)}`}
    >
      <span className="font-medium text-sm truncate max-w-[72px]">{membre}</span>
      <span className="text-xs opacity-80">
        {actives === 0 ? 'Dispo' : `${actives} actif${actives > 1 ? 's' : ''}`}
      </span>
    </button>
  )
}
