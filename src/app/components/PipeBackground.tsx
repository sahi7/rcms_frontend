import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from 'framer-motion'
/**
 * PipeBackground
 * Renders a layered system of thin SVG paths that feel like clear piping.
 * As the user scrolls, an orange fluid "fills" through the pipes —
 * implemented as a pathLength reveal on duplicated orange stroke paths.
 *
 * Background layer moves faster than foreground (parallax).
 */
interface PipeBackgroundProps {
  variant?: 'light' | 'dark'
  density?: 'low' | 'normal' | 'high'
}
export function PipeBackground({
  variant = 'light',
  density = 'normal',
}: PipeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  // Smoothed scroll for buttery animation
  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 0.4,
  })
  // Layers: background moves more, foreground moves less (parallax)
  const yBg = useTransform(smooth, [0, 1], [0, -180])
  const yMid = useTransform(smooth, [0, 1], [0, -100])
  const yFg = useTransform(smooth, [0, 1], [0, -40])
  const pipeStroke =
    variant === 'light' ? 'rgba(28,25,23,0.08)' : 'rgba(255,255,255,0.08)'
  const pipeStrokeStrong =
    variant === 'light' ? 'rgba(28,25,23,0.12)' : 'rgba(255,255,255,0.12)'
  const count = density === 'low' ? 3 : density === 'high' ? 8 : 5
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Background pipes (fastest parallax) */}
      <motion.svg
        style={{
          y: yBg,
        }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 2400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <PipeLayer
          scrollYProgress={smooth}
          stroke={pipeStroke}
          pathDefinitions={BG_PATHS.slice(0, count)}
          fluidDelay={0}
          strokeWidth={1.2}
        />
      </motion.svg>

      {/* Mid layer */}
      <motion.svg
        style={{
          y: yMid,
        }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 2400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <PipeLayer
          scrollYProgress={smooth}
          stroke={pipeStrokeStrong}
          pathDefinitions={MID_PATHS.slice(0, count)}
          fluidDelay={0.05}
          strokeWidth={0.4}
        />
      </motion.svg>

      {/* Foreground (slowest) */}
      <motion.svg
        style={{
          y: yFg,
        }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 2400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <PipeLayer
          scrollYProgress={smooth}
          stroke={pipeStrokeStrong}
          pathDefinitions={FG_PATHS.slice(0, Math.max(2, count - 1))}
          fluidDelay={0.1}
          strokeWidth={0.8}
          showJoints
          variant={variant}
        />
      </motion.svg>
    </div>
  )
}
interface PipeLayerProps {
  scrollYProgress: MotionValue<number>
  stroke: string
  pathDefinitions: PipePath[]
  fluidDelay: number
  strokeWidth: number
  showJoints?: boolean
  variant?: 'light' | 'dark'
}
function PipeLayer({
  scrollYProgress,
  stroke,
  pathDefinitions,
  fluidDelay,
  strokeWidth,
  showJoints,
  variant = 'light',
}: PipeLayerProps) {
  return (
    <g>
      {pathDefinitions.map((p, i) => (
        <PipeSegment
          key={i}
          d={p.d}
          morphTo={p.morphTo}
          joints={p.joints}
          scrollYProgress={scrollYProgress}
          stroke={stroke}
          strokeWidth={strokeWidth}
          index={i}
          total={pathDefinitions.length}
          fluidDelay={fluidDelay}
          showJoints={showJoints}
          variant={variant}
        />
      ))}
    </g>
  )
}
interface PipeSegment {
  d: string
  morphTo?: string
  joints?: {
    cx: number
    cy: number
  }[]
  scrollYProgress: MotionValue<number>
  stroke: string
  strokeWidth: number
  index: number
  total: number
  fluidDelay: number
  showJoints?: boolean
  variant?: 'light' | 'dark'
}
function PipeSegment({
  d,
  morphTo,
  joints,
  scrollYProgress,
  stroke,
  strokeWidth,
  index,
  total,
  fluidDelay,
  showJoints,
  variant,
}: PipeSegment) {
  // Each pipe starts filling at a slightly different progress point
  const start = fluidDelay + (index / total) * 0.3
  const end = start + 0.6
  const pathLength = useTransform(scrollYProgress, [start, end], [0, 1])
  const fluidOpacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 1],
  )
  // Path morphing via d interpolation using a useTransform that switches between two paths.
  // We implement a crossfade: base path is always visible, morphed path fades in.
  const morphOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1])
  const jointFill = variant === 'dark' ? '#ffffff' : '#1c1917'
  return (
    <g>
      {/* Base pipe (empty / clear) */}
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Morph target pipe (fades in as user scrolls) */}
      {morphTo && (
        <motion.path
          d={morphTo}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: morphOpacity,
          }}
        />
      )}

      {/* Orange fluid filling the pipe — reveals via pathLength as you scroll */}
      <motion.path
        d={d}
        stroke="#ea580c"
        strokeWidth={strokeWidth + 0.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          pathLength,
          opacity: fluidOpacity,
        }}
      />

      {/* A thinner amber "highlight" fluid trailing slightly behind */}
      <motion.path
        d={d}
        stroke="#f59e0b"
        strokeWidth={Math.max(0.6, strokeWidth - 0.4)}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          pathLength,
          opacity: useTransform(fluidOpacity, (v) => v * 0.6),
        }}
      />

      {/* Joints (tiny circles at bends — like pipe connectors) */}
      {showJoints &&
        joints?.map((j, ji) => {
          const jointStart =
            start + (ji / Math.max(1, joints.length)) * (end - start)
          return (
            <JointDot
              key={ji}
              cx={j.cx}
              cy={j.cy}
              scrollYProgress={scrollYProgress}
              start={jointStart}
              fill={jointFill}
            />
          )
        })}
    </g>
  )
}
function JointDot({
  cx,
  cy,
  scrollYProgress,
  start,
  fill,
}: {
  cx: number
  cy: number
  scrollYProgress: MotionValue<number>
  start: number
  fill: string
}) {
  const scale = useTransform(
    scrollYProgress,
    [start - 0.02, start, start + 0.05],
    [0, 1.2, 1],
  )
  const opacity = useTransform(scrollYProgress, [start - 0.02, start], [0, 0.4])
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={2.5}
      fill={fill}
      style={{
        scale,
        opacity,
        transformOrigin: `${cx}px ${cy}px`,
      }}
    />
  )
}
// ============ PATH LIBRARY ============
// Each path has a morphTo variant for interpolation (very different shape)
// and joint points for pipe-connector dots.
interface PipePath {
  d: string
  morphTo?: string
  joints?: {
    cx: number
    cy: number
  }[]
}
const BG_PATHS: PipePath[] = [
  {
    d: 'M-50,200 C200,180 300,400 600,380 S1000,200 1500,280',
    morphTo: 'M-50,260 C240,120 360,520 640,340 S1040,280 1500,200',
    joints: [
      {
        cx: 300,
        cy: 340,
      },
      {
        cx: 800,
        cy: 310,
      },
    ],
  },
  {
    d: 'M1500,700 C1200,720 900,500 600,540 S200,720 -50,680',
    morphTo: 'M1500,620 C1160,820 880,420 620,580 S240,640 -50,740',
    joints: [
      {
        cx: 1100,
        cy: 640,
      },
      {
        cx: 400,
        cy: 620,
      },
    ],
  },
  {
    d: 'M-50,1100 C300,1080 500,1300 900,1260 S1300,1080 1500,1140',
    morphTo: 'M-50,1180 C340,960 540,1360 920,1160 S1340,1180 1500,1060',
    joints: [
      {
        cx: 500,
        cy: 1260,
      },
      {
        cx: 1100,
        cy: 1180,
      },
    ],
  },
  {
    d: 'M1500,1600 C1200,1580 900,1800 600,1760 S200,1580 -50,1640',
    morphTo: 'M1500,1520 C1160,1740 820,1560 600,1820 S160,1680 -50,1580',
    joints: [
      {
        cx: 1100,
        cy: 1700,
      },
      {
        cx: 400,
        cy: 1700,
      },
    ],
  },
  {
    d: 'M-50,2100 C300,2080 500,2300 900,2260 S1300,2080 1500,2140',
    morphTo: 'M-50,2200 C320,2040 560,2260 880,2200 S1260,2100 1500,2180',
    joints: [
      {
        cx: 500,
        cy: 2240,
      },
      {
        cx: 1100,
        cy: 2180,
      },
    ],
  },
  {
    d: 'M200,-50 C220,300 100,600 240,900 S180,1500 300,2400',
    morphTo: 'M180,-50 C260,280 140,640 220,920 S200,1480 280,2400',
    joints: [
      {
        cx: 220,
        cy: 300,
      },
      {
        cx: 240,
        cy: 900,
      },
      {
        cx: 280,
        cy: 1800,
      },
    ],
  },
  {
    d: 'M1240,-50 C1200,400 1320,800 1240,1200 S1280,1800 1220,2400',
    joints: [
      {
        cx: 1260,
        cy: 600,
      },
      {
        cx: 1240,
        cy: 1400,
      },
    ],
  },
  {
    d: 'M700,-50 C720,300 600,600 720,900 S680,1500 740,2400',
    joints: [
      {
        cx: 700,
        cy: 400,
      },
      {
        cx: 720,
        cy: 1200,
      },
    ],
  },
]
const MID_PATHS: PipePath[] = [
  {
    d: 'M-50,450 C250,460 450,300 700,320 S1100,460 1500,420',
    morphTo: 'M-50,380 C280,540 500,280 720,400 S1120,380 1500,480',
    joints: [
      {
        cx: 400,
        cy: 320,
      },
      {
        cx: 900,
        cy: 400,
      },
    ],
  },
  {
    d: 'M1500,950 C1200,960 900,800 600,840 S200,960 -50,900',
    joints: [
      {
        cx: 1000,
        cy: 880,
      },
      {
        cx: 400,
        cy: 900,
      },
    ],
  },
  {
    d: 'M-50,1400 C300,1400 500,1220 800,1260 S1200,1400 1500,1360',
    morphTo: 'M-50,1320 C340,1460 560,1180 820,1340 S1220,1280 1500,1440',
    joints: [
      {
        cx: 500,
        cy: 1260,
      },
      {
        cx: 1100,
        cy: 1340,
      },
    ],
  },
  {
    d: 'M1500,1900 C1200,1900 900,1740 600,1780 S200,1900 -50,1860',
    joints: [
      {
        cx: 1000,
        cy: 1820,
      },
      {
        cx: 400,
        cy: 1840,
      },
    ],
  },
  {
    d: 'M-50,2300 C350,2280 550,2120 850,2160 S1250,2280 1500,2240',
    joints: [
      {
        cx: 500,
        cy: 2180,
      },
      {
        cx: 1100,
        cy: 2220,
      },
    ],
  },
  {
    d: 'M520,-50 C560,400 460,800 560,1200 S520,1800 580,2400',
    joints: [
      {
        cx: 540,
        cy: 600,
      },
      {
        cx: 560,
        cy: 1400,
      },
    ],
  },
  {
    d: 'M960,-50 C940,400 1040,800 960,1200 S1000,1800 940,2400',
    joints: [
      {
        cx: 980,
        cy: 600,
      },
      {
        cx: 960,
        cy: 1400,
      },
    ],
  },
  {
    d: 'M-50,150 C200,220 400,80 620,140 S1000,220 1500,120',
    joints: [
      {
        cx: 400,
        cy: 140,
      },
      {
        cx: 900,
        cy: 180,
      },
    ],
  },
]
const FG_PATHS: PipePath[] = [
  {
    d: 'M-50,600 C300,580 500,750 800,720 S1200,580 1500,640',
    morphTo: 'M-50,680 C320,520 540,780 820,620 S1240,680 1500,560',
    joints: [
      {
        cx: 400,
        cy: 720,
      },
      {
        cx: 900,
        cy: 660,
      },
      {
        cx: 1200,
        cy: 620,
      },
    ],
  },
  {
    d: 'M1500,1200 C1200,1220 900,1080 600,1100 S200,1220 -50,1160',
    morphTo: 'M1500,1120 C1160,1320 860,1020 600,1200 S160,1160 -50,1260',
    joints: [
      {
        cx: 1000,
        cy: 1160,
      },
      {
        cx: 400,
        cy: 1180,
      },
      {
        cx: 200,
        cy: 1200,
      },
    ],
  },
  {
    d: 'M-50,1700 C300,1720 500,1560 800,1600 S1200,1720 1500,1680',
    joints: [
      {
        cx: 400,
        cy: 1600,
      },
      {
        cx: 900,
        cy: 1680,
      },
    ],
  },
  {
    d: 'M1500,2100 C1200,2120 900,1980 600,2000 S200,2120 -50,2080',
    joints: [
      {
        cx: 1000,
        cy: 2060,
      },
      {
        cx: 400,
        cy: 2080,
      },
    ],
  },
  {
    d: 'M380,-50 C420,300 320,600 440,900 S380,1500 460,2400',
    joints: [
      {
        cx: 400,
        cy: 500,
      },
      {
        cx: 420,
        cy: 1300,
      },
      {
        cx: 460,
        cy: 2000,
      },
    ],
  },
  {
    d: 'M1080,-50 C1040,300 1140,600 1060,900 S1100,1500 1040,2400',
    joints: [
      {
        cx: 1060,
        cy: 500,
      },
      {
        cx: 1080,
        cy: 1300,
      },
    ],
  },
  {
    d: 'M-50,900 C200,930 400,870 620,900 S1000,930 1500,870',
    joints: [
      {
        cx: 400,
        cy: 900,
      },
      {
        cx: 900,
        cy: 910,
      },
    ],
  },
]
