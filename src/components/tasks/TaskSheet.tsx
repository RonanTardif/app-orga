import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2, MapPin, Clock, GitBranch, FileText, Users, Calendar } from 'lucide-react'
import { MEMBRES, ZONES } from '@/lib/constants'
import type { Tache, Statut } from '@/types'

interface Props {
  tache: Tache | null
  onClose: () => void
  onSave: (id: string, data: Partial<Omit<Tache, 'id'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const STATUTS: Statut[] = ['À faire', 'En cours', 'Fait']

const JOUR_OPTIONS: { value: Tache['jour']; label: string }[] = [
  { value: 'avant', label: 'Avant le 12' },
  { value: 'vendredi', label: 'Vendredi 12 juin' },
  { value: 'samedi', label: 'Samedi 13 juin' },
  { value: 'dimanche', label: 'Dimanche 14 juin' },
]

const JOUR_LABELS: Record<Tache['jour'], string> = {
  avant: 'Avant le 12',
  vendredi: 'Vendredi 12 juin',
  samedi: 'Samedi 13 juin',
  dimanche: 'Dimanche 14 juin',
}

export function TaskSheet({ tache, onClose, onSave, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<Partial<Omit<Tache, 'id'>>>({})
  const [localStatut, setLocalStatut] = useState<Statut>(tache?.statut ?? 'À faire')

  useEffect(() => {
    if (tache) setLocalStatut(tache.statut)
  }, [tache?.id, tache?.statut])

  function handleClose() {
    setIsEditing(false)
    setConfirmDelete(false)
    setForm({})
    onClose()
  }

  function openEdit() {
    if (!tache) return
    setForm({
      titre: tache.titre,
      assignes: [...tache.assignes],
      zone: tache.zone ?? '',
      heure_debut: tache.heure_debut ?? '',
      heure_fin: tache.heure_fin ?? '',
      parente: tache.parente ?? '',
      note: tache.note ?? '',
      jour: tache.jour ?? 'avant',
    })
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setForm({})
  }

  async function handleStatusChange(statut: Statut) {
    if (!tache || saving) return
    setLocalStatut(statut)
    setSaving(true)
    try {
      await onSave(tache.id, { statut })
    } catch {
      setLocalStatut(tache.statut)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!tache || saving) return
    const titre = (form.titre as string)?.trim()
    if (!titre) return
    setSaving(true)
    try {
      await onSave(tache.id, {
        titre,
        assignes: (form.assignes as string[]) ?? tache.assignes,
        zone: (form.zone as string) || null,
        heure_debut: (form.heure_debut as string) || null,
        heure_fin: (form.heure_fin as string) || null,
        parente: (form.parente as string) || null,
        note: (form.note as string) || null,
        jour: (form.jour as Tache['jour']) ?? tache.jour,
      })
      setIsEditing(false)
      setForm({})
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!tache) return
    setDeleting(true)
    try {
      await onDelete(tache.id)
      handleClose()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function toggleMembre(m: string) {
    const current = (form.assignes as string[]) ?? []
    setForm((f) => ({
      ...f,
      assignes: current.includes(m) ? current.filter((x) => x !== m) : [...current, m],
    }))
  }

  return (
    <AnimatePresence>
      {tache && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-cream-card rounded-t-3xl z-50 px-4 pt-4 pb-8 max-h-[90vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex-1 pr-2">{tache.titre}</h2>
              <button onClick={handleClose} className="p-2 text-gray-400 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-20">
              {/* Segmented control statut */}
              <div className="flex gap-2 mb-4">
                {STATUTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={saving}
                    className={`flex-1 min-h-[44px] rounded-xl text-sm font-medium border transition-colors disabled:opacity-40
                      ${localStatut === s
                        ? 'bg-sage text-white border-sage-dark'
                        : 'bg-cream-card border-border-card text-gray-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {!isEditing ? (
                /* Mode lecture */
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {tache.assignes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{tache.assignes.join(', ')}</span>
                    </div>
                  )}
                  {tache.zone && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{tache.zone}</span>
                    </div>
                  )}
                  {(tache.heure_debut || tache.heure_fin) && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>
                        {tache.heure_debut && tache.heure_fin
                          ? `${tache.heure_debut} → ${tache.heure_fin}`
                          : tache.heure_debut ?? tache.heure_fin}
                      </span>
                    </div>
                  )}
                  {tache.parente && (
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{tache.parente}</span>
                    </div>
                  )}
                  {tache.note && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="italic">{tache.note}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 text-sm">
                      {tache.jour ? JOUR_LABELS[tache.jour] : 'Avant le 12'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Mode édition */
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nom *</label>
                    <input
                      value={(form.titre as string) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                      className="mt-1 w-full bg-cream border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                    />
                  </div>

                  {/* Jour */}
                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jour</label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {JOUR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, jour: opt.value }))}
                          className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
                            ${(form.jour as Tache['jour']) === opt.value
                              ? 'bg-sage text-white border-sage-dark'
                              : 'bg-cream border-border-card'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigné à</label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {MEMBRES.map((m) => (
                        <button
                          key={m}
                          onClick={() => toggleMembre(m)}
                          className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
                            ${((form.assignes as string[]) ?? []).includes(m)
                              ? 'bg-sage text-white border-sage-dark'
                              : 'bg-cream border-border-card'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Zone</label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {ZONES.map((z) => (
                        <button
                          key={z}
                          onClick={() => setForm((f) => ({ ...f, zone: (f.zone as string) === z ? '' : z }))}
                          className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
                            ${(form.zone as string) === z
                              ? 'bg-sage text-white border-sage-dark'
                              : 'bg-cream border-border-card'}`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Début</label>
                      <input
                        type="time"
                        value={(form.heure_debut as string) ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, heure_debut: e.target.value }))}
                        className="mt-1 w-full bg-cream border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fin</label>
                      <input
                        type="time"
                        value={(form.heure_fin as string) ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, heure_fin: e.target.value }))}
                        className="mt-1 w-full bg-cream border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tâche parente</label>
                    <input
                      value={(form.parente as string) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, parente: e.target.value }))}
                      placeholder="Nom de la tâche parente..."
                      className="mt-1 w-full bg-cream border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Note</label>
                    <textarea
                      value={(form.note as string) ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      placeholder="Note optionnelle..."
                      rows={2}
                      className="mt-1 w-full bg-cream border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || !(form.titre as string)?.trim()}
                    className="flex-1 min-h-[44px] bg-sage text-white font-semibold rounded-xl disabled:opacity-40"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 min-h-[44px] bg-cream border border-border-card rounded-xl font-medium text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={openEdit}
                    className="flex items-center gap-2 text-sage-dark text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </button>

                  {confirmDelete ? (
                    <div className="space-y-2">
                      <p className="text-center text-gray-700 font-medium text-sm">Supprimer cette tâche ?</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex-1 min-h-[44px] bg-rose text-white font-semibold rounded-xl disabled:opacity-40"
                        >
                          {deleting ? 'Suppression...' : 'Oui, supprimer'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 min-h-[44px] bg-cream border border-border-card rounded-xl font-medium text-gray-700"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 text-rose-dark text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer cette tâche
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
