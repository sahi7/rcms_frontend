import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PhoneIcon, CopyIcon, CheckIcon } from 'lucide-react'
interface USSDInstructionsProps {
  ussdCode: string
  operator: string
  phoneNumber: string
}
export function USSDInstructions({
  ussdCode,
  operator,
  phoneNumber,
}: USSDInstructionsProps) {
  const [copied, setCopied] = useState(false)
  const op = operator?.toLowerCase().includes('mtn')
    ? 'MTN'
    : operator?.toLowerCase().includes('orange')
      ? 'Orange'
      : operator
  const accent =
    op === 'MTN'
      ? 'from-yellow-50 to-amber-50 border-yellow-200 text-yellow-900'
      : op === 'Orange'
        ? 'from-orange-50 to-red-50 border-orange-200 text-orange-900'
        : 'from-blue-50 to-indigo-50 border-blue-200 text-blue-900'
  const handleCopy = () => {
    navigator.clipboard.writeText(ussdCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`bg-gradient-to-br ${accent} border rounded-xl p-4 space-y-3`}
    >
      <div className="flex items-center gap-2">
        <PhoneIcon className="w-4 h-4" />
        <p className="text-sm font-semibold">Complete payment on your phone</p>
      </div>
      <ol className="text-xs space-y-1.5 list-decimal list-inside">
        <li>
          You should receive a <b>{op}</b> prompt on{' '}
          <span className="font-mono">{phoneNumber}</span>.
        </li>
        <li>
          If you don't get it within 30 seconds, dial the USSD code below to
          confirm.
        </li>
        <li>Enter your PIN to authorize.</li>
        <li>Return here — we'll detect the payment automatically.</li>
      </ol>
      <div className="bg-white/70 border border-white rounded-lg px-3 py-2.5 flex items-center justify-between">
        <code className="text-sm font-mono font-semibold tracking-wider">
          {ussdCode}
        </code>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-white"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> Copied
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
