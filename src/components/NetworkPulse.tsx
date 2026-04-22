// src/components/NetworkPulse.tsx
import { motion } from 'framer-motion'
import { ServerIcon, GlobeIcon, ActivityIcon } from 'lucide-react'
type PulseState = 'idle' | 'connecting' | 'success' | 'error'
interface NetworkPulseProps {
  state: PulseState
  label?: string
  sublabel?: string
  compact?: boolean
}
const stateConfig = {
  idle: {
    ring: 'border-slate-200',
    dot: 'bg-slate-300',
    text: 'text-slate-500',
    msg: 'Idle',
  },
  connecting: {
    ring: 'border-blue-300',
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    msg: 'Connecting...',
  },
  success: {
    ring: 'border-emerald-300',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    msg: 'Connected',
  },
  error: {
    ring: 'border-rose-300',
    dot: 'bg-rose-500',
    text: 'text-rose-600',
    msg: 'Error',
  },
}
/**
 * Live server/network pulse animation.
 * Shows an animated ping ring around a server icon while `connecting`.
 */
export function NetworkPulse({
  state,
  label,
  sublabel,
  compact = false,
}: NetworkPulseProps) {
  const cfg = stateConfig[state]
  const size = compact ? 'w-10 h-10' : 'w-14 h-14'
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <div className={`relative ${size} flex items-center justify-center`}>
        {state === 'connecting' && (
          <>
            <motion.span
              className={`absolute inset-0 rounded-full border-2 ${cfg.ring}`}
              initial={{
                scale: 0.6,
                opacity: 0.8,
              }}
              animate={{
                scale: 1.6,
                opacity: 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeOut',
              }}
            />
            <motion.span
              className={`absolute inset-0 rounded-full border-2 ${cfg.ring}`}
              initial={{
                scale: 0.6,
                opacity: 0.8,
              }}
              animate={{
                scale: 1.6,
                opacity: 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeOut',
                delay: 0.7,
              }}
            />
          </>
        )}
        <div
          className={`relative ${compact ? 'w-8 h-8' : 'w-11 h-11'} rounded-full border-2 ${cfg.ring} bg-white flex items-center justify-center`}
        >
          <ServerIcon
            className={`${compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} ${cfg.text}`}
          />
          <motion.span
            className={`absolute -top-0.5 -right-0.5 ${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full ${cfg.dot}`}
            animate={
              state === 'connecting'
                ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7],
                  }
                : {
                    scale: 1,
                    opacity: 1,
                  }
            }
            transition={{
              repeat: state === 'connecting' ? Infinity : 0,
              duration: 1,
            }}
          />
        </div>
      </div>
      {(label || sublabel) && (
        <div className="min-w-0">
          {label && (
            <p className={`text-sm font-medium ${cfg.text} truncate`}>
              {label}
            </p>
          )}
          <p className="text-xs text-slate-500 truncate">
            {sublabel || cfg.msg}
          </p>
        </div>
      )}
    </div>
  )
}
/**
 * Animated packet-flow line between two nodes.
 */
export function PacketFlow({
  active,
  from = 'Client',
  to = 'Registry',
}: {
  active: boolean
  from?: string
  to?: string
}) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2 shrink-0">
        <GlobeIcon className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-medium text-slate-600">{from}</span>
      </div>
      <div className="relative flex-1 h-[2px] bg-slate-200 rounded-full overflow-hidden">
        {active && (
          <>
            <motion.span
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              initial={{
                left: '-5%',
              }}
              animate={{
                left: '105%',
              }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: 'easeInOut',
              }}
            />
            <motion.span
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400"
              initial={{
                left: '-5%',
              }}
              animate={{
                left: '105%',
              }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: 'easeInOut',
                delay: 0.6,
              }}
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-medium text-slate-600">{to}</span>
        <ServerIcon className="w-4 h-4 text-slate-500" />
      </div>
    </div>
  )
}
/**
 * Inline activity indicator — subtle heartbeat for "live" sections.
 */
export function LiveIndicator({ label = 'Live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
        }}
      />
      {label}
      <ActivityIcon className="w-3 h-3" />
    </span>
  )
}
