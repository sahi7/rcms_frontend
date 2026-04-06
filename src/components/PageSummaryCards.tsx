// src/components/PageSummaryCards

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface SummaryCard {
  title: string
  value: string | number
  icon: LucideIcon  // Use the LucideIcon type instead of BoxIcon
  color: 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber'
  subtitle?: string
}
const colorMap = {
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
}
interface PageSummaryCardsProps {
  cards: SummaryCard[]
}
export function PageSummaryCards({ cards }: PageSummaryCardsProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(cards.length, 4)} gap-4`}
    >
      {cards.map((card, index) => {
        const colors = colorMap[card.color]
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
            className={`bg-white rounded-xl border ${colors.border} p-5 flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>
              )}
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg}`}
            >
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
