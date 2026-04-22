// src/components/ConfirmDialog.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangleIcon, XIcon, LoaderIcon } from 'lucide-react'
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            transition={{
              duration: 0.15,
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex items-start gap-3 p-5 border-b border-slate-100">
              <div
                className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}
              >
                <AlertTriangleIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-600">{message}</div>
            <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 rounded-b-xl">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {loading && <LoaderIcon className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
