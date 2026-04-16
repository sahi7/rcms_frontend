import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'
interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  size = 'md',
}: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
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
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-900/50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            transition={{
              duration: 0.15,
            }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-xl shadow-xl w-full ${sizes[size]} my-4`}
          >
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 ml-3"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
