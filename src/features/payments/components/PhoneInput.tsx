import { SearchableSelect } from '@/components/SearchableSelect'
interface PhoneInputProps {
  countryCode: string
  number: string
  onCountryCodeChange: (v: string) => void
  onNumberChange: (v: string) => void
  error?: string
  disabled?: boolean
}
// Keep focused on supported mobile-money markets (extendable).
const COUNTRY_OPTIONS = [
  {
    value: '237',
    label: '🇨🇲 Cameroon (+237)',
  },
  {
    value: '225',
    label: "🇨🇮 Côte d'Ivoire (+225)",
  },
  {
    value: '221',
    label: '🇸🇳 Senegal (+221)',
  },
  {
    value: '233',
    label: '🇬🇭 Ghana (+233)',
  },
  {
    value: '234',
    label: '🇳🇬 Nigeria (+234)',
  },
  {
    value: '254',
    label: '🇰🇪 Kenya (+254)',
  },
]
export function PhoneInput({
  countryCode,
  number,
  onCountryCodeChange,
  onNumberChange,
  error,
  disabled,
}: PhoneInputProps) {
  const sanitized = number.replace(/\D/g, '')
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Mobile money number <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-[140px_1fr] gap-2">
        <SearchableSelect
          options={COUNTRY_OPTIONS}
          value={countryCode}
          onChange={(v) => onCountryCodeChange(String(v || '237'))}
          placeholder="Country"
          disabled={disabled}
        />
        <input
          type="tel"
          inputMode="tel"
          value={sanitized}
          onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, ''))}
          placeholder="677777777"
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
        />
      </div>
      <p className="text-[11px] text-slate-500 mt-1">
        We'll send the prompt to{' '}
        <span className="font-mono">
          {countryCode}
          {sanitized || '…'}
        </span>
      </p>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  )
}
