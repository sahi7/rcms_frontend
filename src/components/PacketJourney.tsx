import { Fragment, ComponentType  } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  CreditCardIcon,
  ServerIcon,
  GlobeIcon,
  CheckCircle2Icon,
  XCircleIcon,
  LoaderIcon,
} from 'lucide-react'
export type NodeState = 'idle' | 'active' | 'done' | 'error'
export interface JourneyNode {
  id: string
  label: string
  sublabel?: string
  icon?: ComponentType<{
    className?: string
  }>
  state: NodeState
}
interface PacketJourneyProps {
  nodes: JourneyNode[]
  /** The edge (0..nodes.length-2) currently carrying packets. null = none */
  activeEdge: number | null
  /** Optional: render an error on an edge instead of an active packet */
  erroredEdge?: number | null
}
const nodeColors: Record<
  NodeState,
  {
    ring: string
    icon: string
    bg: string
    halo: string
  }
> = {
  idle: {
    ring: 'border-slate-200',
    icon: 'text-slate-400',
    bg: 'bg-white',
    halo: '',
  },
  active: {
    ring: 'border-blue-400',
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    halo: 'shadow-[0_0_0_4px_rgba(59,130,246,0.15)]',
  },
  done: {
    ring: 'border-emerald-400',
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50',
    halo: 'shadow-[0_0_0_4px_rgba(16,185,129,0.15)]',
  },
  error: {
    ring: 'border-rose-400',
    icon: 'text-rose-600',
    bg: 'bg-rose-50',
    halo: 'shadow-[0_0_0_4px_rgba(244,63,94,0.15)]',
  },
}
/**
 * A multi-node animated packet journey with flowing dots along active edges.
 * Ideal for depicting: User → Gateway → Registry → Done, with status per hop.
 */
export function PacketJourney({
  nodes,
  activeEdge,
  erroredEdge = null,
}: PacketJourneyProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max py-2 px-1">
        {nodes.map((node, i) => {
          const Icon = node.icon || ServerIcon
          const c = nodeColors[node.state]
          const isEdge = i < nodes.length - 1
          const edgeActive = activeEdge === i
          const edgeErrored = erroredEdge === i
          const edgeDone =
            nodes[i]?.state === 'done' && nodes[i + 1]?.state !== 'idle'
          return (
            <Fragment key={node.id}>
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
                <motion.div
                  className={`relative w-11 h-11 rounded-full border-2 ${c.ring} ${c.bg} ${c.halo} flex items-center justify-center transition-all`}
                  animate={
                    node.state === 'active'
                      ? {
                          scale: [1, 1.06, 1],
                        }
                      : {
                          scale: 1,
                        }
                  }
                  transition={{
                    repeat: node.state === 'active' ? Infinity : 0,
                    duration: 1.2,
                  }}
                >
                  {node.state === 'active' && (
                    <>
                      <motion.span
                        className={`absolute inset-0 rounded-full border-2 ${c.ring}`}
                        initial={{
                          scale: 0.8,
                          opacity: 0.7,
                        }}
                        animate={{
                          scale: 1.9,
                          opacity: 0,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.6,
                          ease: 'easeOut',
                        }}
                      />
                      <motion.span
                        className={`absolute inset-0 rounded-full border-2 ${c.ring}`}
                        initial={{
                          scale: 0.8,
                          opacity: 0.7,
                        }}
                        animate={{
                          scale: 1.9,
                          opacity: 0,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.6,
                          ease: 'easeOut',
                          delay: 0.8,
                        }}
                      />
                    </>
                  )}
                  {node.state === 'active' ? (
                    <LoaderIcon className={`w-5 h-5 ${c.icon} animate-spin`} />
                  ) : node.state === 'done' ? (
                    <CheckCircle2Icon className={`w-5 h-5 ${c.icon}`} />
                  ) : node.state === 'error' ? (
                    <XCircleIcon className={`w-5 h-5 ${c.icon}`} />
                  ) : (
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  )}
                </motion.div>
                <p className="text-[11px] font-semibold text-slate-700 leading-tight text-center">
                  {node.label}
                </p>
                {node.sublabel && (
                  <p className="text-[10px] text-slate-500 leading-tight text-center max-w-full truncate">
                    {node.sublabel}
                  </p>
                )}
              </div>

              {/* Edge */}
              {isEdge && (
                <div className="relative flex-1 min-w-[40px] sm:min-w-[64px] h-[2px] self-start mt-[22px]">
                  <div
                    className={`absolute inset-0 rounded-full ${edgeErrored ? 'bg-rose-200' : edgeDone ? 'bg-emerald-300' : 'bg-slate-200'}`}
                  />
                  {edgeActive && !edgeErrored && (
                    <>
                      <motion.span
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]"
                        initial={{
                          left: '-5%',
                        }}
                        animate={{
                          left: '105%',
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.4,
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
                          duration: 1.4,
                          ease: 'easeInOut',
                          delay: 0.5,
                        }}
                      />
                      <motion.span
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-300"
                        initial={{
                          left: '-5%',
                        }}
                        animate={{
                          left: '105%',
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.4,
                          ease: 'easeInOut',
                          delay: 0.9,
                        }}
                      />
                    </>
                  )}
                  {edgeErrored && (
                    <motion.span
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-600"
                      initial={{
                        scale: 0.6,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </motion.span>
                  )}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
export const JourneyIcons = {
  UserIcon,
  CreditCardIcon,
  ServerIcon,
  GlobeIcon,
}
