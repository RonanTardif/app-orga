import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'

export interface ToastData {
  id: number
  message: string
  variant: 'error' | 'success'
}

interface Props {
  toasts: ToastData[]
  onDismiss: (id: number) => void
}

export function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  const isError = toast.variant === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md text-sm font-medium pointer-events-auto
        ${isError ? 'bg-rose/20 text-rose-dark border border-rose/30' : 'bg-sage/20 text-sage-dark border border-sage/30'}`}
    >
      {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
      {toast.message}
    </motion.div>
  )
}
