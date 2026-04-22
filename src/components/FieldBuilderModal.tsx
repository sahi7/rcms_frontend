// src/components/FieldBuilderModal.tsx
import React, { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { Modal } from './AdModal'
import {
  FieldConfig,
  FieldOption,
  FieldType,
  FormField,
  FormFieldPayload,
} from '@/types/admissions'
const FIELD_TYPES: {
  value: FieldType
  label: string
  desc: string
}[] = [
  {
    value: 'TEXT',
    label: 'Short text',
    desc: 'Single-line input',
  },
  {
    value: 'TEXTAREA',
    label: 'Long text',
    desc: 'Paragraph / rich text',
  },
  {
    value: 'NUMBER',
    label: 'Number',
    desc: 'Numeric input',
  },
  {
    value: 'DATE',
    label: 'Date',
    desc: 'Date picker',
  },
  {
    value: 'FILE',
    label: 'File upload',
    desc: 'Any file',
  },
  {
    value: 'IMAGE',
    label: 'Image upload',
    desc: 'Picture upload',
  },
  {
    value: 'SELECT',
    label: 'Dropdown',
    desc: 'Pick one from list',
  },
  {
    value: 'RADIO',
    label: 'Radio',
    desc: 'Pick one (visible)',
  },
  {
    value: 'CHECKBOX',
    label: 'Checkboxes',
    desc: 'Pick many',
  },
]
interface Props {
  open: boolean
  applicationTypeId: string
  initial?: FormField
  nextOrder: number
  onClose: () => void
  onSubmit: (payload: FormFieldPayload) => Promise<void> | void
  submitting?: boolean
}
export function FieldBuilderModal({
  open,
  applicationTypeId,
  initial,
  nextOrder,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('TEXT')
  const [isRequired, setIsRequired] = useState(false)
  const [order, setOrder] = useState(10)
  const [detail, setDetail] = useState('')
  const [config, setConfig] = useState<FieldConfig>({})
  const [options, setOptions] = useState<FieldOption[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (open) {
      if (initial) {
        setName(initial.name)
        setLabel(initial.label)
        setFieldType(initial.field_type)
        setIsRequired(initial.is_required)
        setOrder(initial.order)
        setDetail(initial.detail || '')
        setConfig(initial.config || {})
        setOptions(initial.config?.options || [])
      } else {
        setName('')
        setLabel('')
        setFieldType('TEXT')
        setIsRequired(false)
        setOrder(nextOrder)
        setDetail('')
        setConfig({})
        setOptions([])
      }
      setErrors({})
    }
  }, [open, initial, nextOrder])
  const needsOptions =
    fieldType === 'SELECT' || fieldType === 'RADIO' || fieldType === 'CHECKBOX'
  const updateConfig = (patch: Partial<FieldConfig>) =>
    setConfig((c) => ({
      ...c,
      ...patch,
    }))
  const addOption = () =>
    setOptions((o) => [
      ...o,
      {
        value: '',
        label: '',
      },
    ])
  const updateOption = (i: number, patch: Partial<FieldOption>) =>
    setOptions((o) =>
      o.map((op, idx) =>
        idx === i
          ? {
              ...op,
              ...patch,
            }
          : op,
      ),
    )
  const removeOption = (i: number) =>
    setOptions((o) => o.filter((_, idx) => idx !== i))
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Machine name is required'
    else if (!/^[a-z][a-z0-9_]*$/.test(name))
      e.name =
        'Use lowercase letters, numbers and underscores (start with a letter)'
    if (!label.trim()) e.label = 'Label is required'
    if (needsOptions) {
      if (options.length === 0) e.options = 'Add at least one option'
      if (options.some((o) => !o.value.trim() || !o.label.trim()))
        e.options = 'All options need value and label'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSubmit = async () => {
    if (!validate()) return
    const finalConfig: FieldConfig = {
      ...config,
    }
    if (needsOptions) finalConfig.options = options
    const payload: FormFieldPayload = {
      application_type_id: applicationTypeId,
      name: name.trim(),
      label: label.trim(),
      field_type: fieldType,
      is_required: isRequired,
      order,
      config: finalConfig,
      detail: detail.trim(),
    }
    await onSubmit(payload)
  }
  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
  return (
    <Modal
      open={open}
      title={initial ? 'Edit field' : 'Add form field'}
      subtitle="Configure how applicants fill out this question"
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Field type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIELD_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFieldType(t.value)}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${fieldType === t.value ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="font-medium text-slate-800">{t.label}</div>
                <div className="text-slate-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Emergency contact name"
              className={inputCls}
            />
            {errors.label && (
              <p className="text-xs text-red-600 mt-1">{errors.label}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Machine name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="emergency_contact_name"
              className={inputCls}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Helper text
          </label>
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Shown under the field"
            className={inputCls}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            Required field
          </label>
        </div>

        {/* Type-specific config */}
        {(fieldType === 'TEXT' || fieldType === 'TEXTAREA') && (
          <div className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min length
              </label>
              <input
                type="number"
                value={config.min_length ?? ''}
                onChange={(e) =>
                  updateConfig({
                    min_length: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Max length
              </label>
              <input
                type="number"
                value={config.max_length ?? ''}
                onChange={(e) =>
                  updateConfig({
                    max_length: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            {fieldType === 'TEXT' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pattern (regex)
                </label>
                <input
                  value={config.pattern ?? ''}
                  onChange={(e) =>
                    updateConfig({
                      pattern: e.target.value || undefined,
                    })
                  }
                  className={inputCls}
                />
              </div>
            )}
            {fieldType === 'TEXTAREA' && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={!!config.rich_text}
                  onChange={(e) =>
                    updateConfig({
                      rich_text: e.target.checked,
                    })
                  }
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                Allow rich text formatting
              </label>
            )}
          </div>
        )}

        {fieldType === 'NUMBER' && (
          <div className="grid sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min
              </label>
              <input
                type="number"
                value={config.min ?? ''}
                onChange={(e) =>
                  updateConfig({
                    min: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Max
              </label>
              <input
                type="number"
                value={config.max ?? ''}
                onChange={(e) =>
                  updateConfig({
                    max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Step
              </label>
              <input
                type="number"
                value={config.step ?? ''}
                onChange={(e) =>
                  updateConfig({
                    step: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
          </div>
        )}

        {fieldType === 'DATE' && (
          <div className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Earliest date
              </label>
              <input
                type="date"
                value={config.min_date ?? ''}
                onChange={(e) =>
                  updateConfig({
                    min_date: e.target.value || undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Latest date
              </label>
              <input
                type="date"
                value={config.max_date ?? ''}
                onChange={(e) =>
                  updateConfig({
                    max_date: e.target.value || undefined,
                  })
                }
                className={inputCls}
              />
            </div>
          </div>
        )}

        {(fieldType === 'FILE' || fieldType === 'IMAGE') && (
          <div className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Allowed extensions (comma separated)
              </label>
              <input
                value={(config.allowed_extensions ?? []).join(',')}
                onChange={(e) =>
                  updateConfig({
                    allowed_extensions: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder=".pdf,.jpg,.png"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Max size (MB)
              </label>
              <input
                type="number"
                value={config.max_size_mb ?? ''}
                onChange={(e) =>
                  updateConfig({
                    max_size_mb: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className={inputCls}
              />
            </div>
            {fieldType === 'IMAGE' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Max width / height (px)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="w"
                    value={config.max_width ?? ''}
                    onChange={(e) =>
                      updateConfig({
                        max_width: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className={inputCls}
                  />
                  <input
                    type="number"
                    placeholder="h"
                    value={config.max_height ?? ''}
                    onChange={(e) =>
                      updateConfig({
                        max_height: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {needsOptions && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Options
              </span>
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                <PlusIcon className="w-3.5 h-3.5" /> Add option
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={opt.value}
                    onChange={(e) =>
                      updateOption(i, {
                        value: e.target.value,
                      })
                    }
                    placeholder="value"
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    value={opt.label}
                    onChange={(e) =>
                      updateOption(i, {
                        label: e.target.value,
                      })
                    }
                    placeholder="Label"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    aria-label="Remove"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {options.length === 0 && (
                <p className="text-xs text-slate-500">No options yet.</p>
              )}
            </div>
            {errors.options && (
              <p className="text-xs text-red-600 mt-1">{errors.options}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add field'}
        </button>
      </div>
    </Modal>
  )
}
