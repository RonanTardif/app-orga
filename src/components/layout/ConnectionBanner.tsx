import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'

interface Props {
  isOnline: boolean
}

export function ConnectionBanner({ isOnline }: Props) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-rose/20 border-b border-rose/30 px-4 py-2 flex items-center gap-2 text-rose-dark text-sm"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Connexion perdue — les modifications seront synchronisees a la reconnexion</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
