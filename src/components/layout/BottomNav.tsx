import { NavLink } from 'react-router-dom'
import { CheckSquare, Shield, Settings, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', icon: CheckSquare, label: 'Mes taches' },
  { to: '/chef', icon: Shield, label: 'Chef orga' },
  { to: '/planner', icon: MessageCircle, label: 'Planner' },
  { to: '/settings', icon: Settings, label: 'Parametres' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream-card border-t border-border-card safe-area-bottom">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
                isActive ? 'text-sage' : 'text-gray-400'
              )
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
