import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { MEMBRES, ZONES } from '@/lib/constants'
import type { Tache } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Tache, 'id'>) => Promise<string | void>
}

const JOUR_OPTIONS: { value: Tache['jour']; label: string }[] = [
  { value: 'avant', label: 'Avant le 12' },
  { value: 'vendredi', label: 'Vendredi 12 juin' },
  { value: 'samedi', label: 'Samedi 13 juin' },
  { value: 'dimanche', label: 'Dimanche 14 juin' },
]

const EMPTY_FORM = {
  titre: '',
  assignes: [] as string[],
  zone: '',
  heure_debut: '',
  heure_fin: '',
  parente: '',
  note: '',
  jour: 'avant' as Tache['jour'],
}

export function TaskForm({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleClose() {
    setForm(EMPTY_FORM)
    setError('')
    onClose()
  }

  async function handleSubmit() {
    if (!form.titre.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        titre: form.titre.trim(),
        heure_debut: form.heure_debut || null,
        heure_fin: form.heure_fin || null,
        zone: form.zone || null,
        assignes: form.assignes,
        statut: 'À faire',
        note: form.note || null,
        jour: form.jour,
        parente: form.parente || null,
      })
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMembre(m: string) {
    setForm((f) => ({
      ...f,
      assignes: f.assignes.includes(m)
        ? f.assignes.filter((x) => x !== m)
        : [...f.assignes, m],
    }))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-3xl z-50 px-4 pt-4 pb-8 max-h-[90vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-sage-dark">Nouvelle tache</h2>
              <button onClick={handleClose} className="p-2 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              {/* Titre */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nom *</label>
                <input
                  value={form.titre}
                  onChange={(e) => { setForm((f) => ({ ...f, titre: e.target.value })); setError('') }}
                  placeholder="Nom de la tache"
                  className="mt-1 w-full bg-cream-card border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                />
                {error && <p className="text-rose-dark text-xs mt-1">{error}</p>}
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
                        ${form.jour === opt.value
                          ? 'bg-sage text-white border-sage-dark'
                          : 'bg-cream-card border-border-card'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignes */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigne a</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {MEMBRES.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMembre(m)}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
                        ${form.assignes.includes(m)
                          ? 'bg-sage text-white border-sage-dark'
                          : 'bg-cream-card border-border-card'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Zone</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {ZONES.map((z) => (
                    <button
                      key={z}
                      onClick={() => setForm((f) => ({ ...f, zone: f.zone === z ? '' : z }))}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-colors
                        ${form.zone === z
                          ? 'bg-sage text-white border-sage-dark'
                          : 'bg-cream-card border-border-card'}`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Debut</label>
                  <input
                    type="time"
                    value={form.heure_debut}
                    onChange={(e) => setForm((f) => ({ ...f, heure_debut: e.target.value }))}
                    className="mt-1 w-full bg-cream-card border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fin</label>
                  <input
                    type="time"
                    value={form.heure_fin}
                    onChange={(e) => setForm((f) => ({ ...f, heure_fin: e.target.value }))}
                    className="mt-1 w-full bg-cream-card border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Note</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Note optionnelle..."
                  rows={2}
                  className="mt-1 w-full bg-cream-card border border-border-card rounded-xl px-4 py-3 outline-none focus:border-sage resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.titre.trim() || submitting}
              className="mt-4 w-full min-h-[44px] bg-sage text-white font-semibold rounded-xl
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enregistrement...' : 'Creer la tache'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
