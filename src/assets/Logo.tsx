import { Link } from 'react-router-dom'
interface LogoProps {
  className?: string
  size?: number
  variant?: 'dark' | 'light'
  showWordmark?: boolean
  to?: string
}
export function Logo({
  className = '',
  size = 32,
  variant = 'dark',
  showWordmark = true,
  to = '/',
}: LogoProps) {
  const textColor = variant === 'dark' ? 'text-ink-900' : 'text-white'
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 group ${className}`}
      aria-label="kakipi home"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Vertical bar of the k */}
        <rect
          x="6"
          y="6"
          width="10"
          height="36"
          rx="5"
          fill={variant === 'dark' ? '#1c1917' : '#ffffff'}
        />
        {/* Upper orange arm (burnt orange) */}
        <path d="M16 26 L34 10 L42 10 L24 26 Z" fill="#ea580c" />
        {/* Lower amber arm */}
        <path d="M16 22 L42 40 L34 40 L16 28 Z" fill="#f59e0b" />
        {/* Small red accent dot */}
        <circle cx="38" cy="24" r="3.2" fill="#dc2626" />
        {/* Tiny fluid highlight */}
        <circle cx="36.5" cy="22.5" r="0.9" fill="#ffffff" opacity="0.7" />
      </svg>
      {showWordmark && (
        <span
          className={`font-heading font-extrabold tracking-tight lowercase ${textColor} transition-colors`}
          style={{
            fontSize: size * 0.7,
            lineHeight: 1,
          }}
        >
          kakipi
        </span>
      )}
    </Link>
  )
}
