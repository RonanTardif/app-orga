import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface Props {
  onSuccess: () => void
  authenticate: (pin: string) => boolean
}

export function PinEntry({ onSuccess, authenticate }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(value: string) {
    if (authenticate(value)) {
      onSuccess()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => {
        setError(false)
        inputRef.current?.focus()
      }, 600)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(val)
    if (val.length === 4) handleSubmit(val)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-sage/20 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="w-7 h-7 text-sage-dark" />
          </div>
          <h1 className="text-xl font-semibold text-sage-dark">Mode Chef d'orga</h1>
          <p className="text-gray-400 text-sm mt-1">Entrez votre PIN</p>
        </div>

        <motion.div
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={handleChange}
            placeholder="••••"
            className="w-full text-center text-3xl tracking-[0.5em] bg-cream-card border-2 rounded-2xl px-4 py-4
              outline-none transition-colors font-mono
              border-border-card focus:border-sage placeholder:text-gray-300"
          />
        </motion.div>

        {error && (
          <p className="text-center text-rose-dark text-sm mt-3 font-medium">PIN incorrect</p>
        )}

        <button
          onClick={() => pin.length === 4 && handleSubmit(pin)}
          disabled={pin.length < 4}
          className="mt-4 w-full min-h-[44px] bg-sage text-white font-semibold rounded-xl
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider
        </button>
      </div>
    </div>
  )
}
