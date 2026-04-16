import React from 'react'
import { FormField } from '@/types/admissions'
interface FieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}
/**
 * Renders a single dynamic form field. Used both in the admin preview
 * and in the public applicant form. 100% driven by field_type + config.
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRendererProps) {
  const baseCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-50'
  const renderInput = () => {
    const c = field.config || {}
    switch (field.field_type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            minLength={c.min_length}
            maxLength={c.max_length}
            pattern={c.pattern}
            disabled={disabled}
            className={baseCls}
          />
        )
      case 'TEXTAREA':
        return (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            minLength={c.min_length}
            maxLength={c.max_length}
            rows={5}
            disabled={disabled}
            className={baseCls}
          />
        )
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            min={c.min}
            max={c.max}
            step={c.step}
            disabled={disabled}
            className={baseCls}
          />
        )
      case 'DATE':
        return (
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            min={c.min_date}
            max={c.max_date}
            disabled={disabled}
            className={baseCls}
          />
        )
      case 'FILE':
      case 'IMAGE':
        return (
          <input
            type="file"
            accept={
              field.field_type === 'IMAGE'
                ? c.allowed_extensions?.join(',') || 'image/*'
                : c.allowed_extensions?.join(',')
            }
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            disabled={disabled}
            className={`${baseCls} file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded file:bg-orange-50 file:text-orange-700 file:text-sm`}
          />
        )
      case 'SELECT':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseCls}
          >
            <option value="">Select...</option>
            {(c.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case 'RADIO':
        return (
          <div className="space-y-2">
            {(c.options ?? []).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  disabled={disabled}
                  className="text-orange-500 focus:ring-orange-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        )
      case 'CHECKBOX': {
        const arr: string[] = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {(c.options ?? []).map((opt) => {
              const checked = arr.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onChange(
                        checked
                          ? arr.filter((v) => v !== opt.value)
                          : [...arr, opt.value],
                      )
                    }
                    disabled={disabled}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        )
      }
      default:
        return <div className="text-xs text-slate-400">Unsupported field</div>
    }
  }
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {field.label}
        {field.is_required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {renderInput()}
      {field.detail && (
        <p className="text-xs text-slate-500 mt-1">{field.detail}</p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
