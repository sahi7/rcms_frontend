// src/components/MultiSelect.tsx
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SearchIcon,
  ChevronDownIcon,
  XIcon,
  LoaderIcon,
  CheckIcon,
} from 'lucide-react'
interface Option {
  value: number | string
  label: string
}
interface MultiSelectProps {
  options: Option[]
  value: (number | string)[]
  onChange: (value: (number | string)[]) => void
  onSearch?: (term: string) => void
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
  label?: string
  required?: boolean
}
export function MultiSelect({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Select...',
  isLoading = false,
  disabled = false,
  label,
  required = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedOptions = options.filter((o) => value.includes(o.value))
  const filteredOptions = onSearch
    ? options
    : options.filter((o) =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])
  useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => onSearch(searchTerm), 300)
      return () => clearTimeout(timer)
    }
  }, [searchTerm, onSearch])
  const toggleOption = (optionValue: number | string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }
  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[38px] disabled:opacity-50"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selectedOptions.slice(0, 3).map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium"
              >
                {opt.label}
                <XIcon
                  className="w-3 h-3 cursor-pointer hover:text-orange-900"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(opt.value)
                  }}
                />
              </span>
            ))
          )}
          {selectedOptions.length > 3 && (
            <span className="text-xs text-slate-500 py-0.5">
              +{selectedOptions.length - 3} more
            </span>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
            transition={{
              duration: 0.15,
            }}
            className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-slate-400">
                  <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-colors ${value.includes(option.value) ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {option.label}
                    {value.includes(option.value) && (
                      <CheckIcon className="w-4 h-4 text-orange-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
