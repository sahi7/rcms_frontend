import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NetworkIcon,
  PlusIcon,
  Trash2Icon,
  LoaderIcon,
  SaveIcon,
  RefreshCwIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useDnsRecords,
  useSaveDnsRecords,
  useDeleteDnsRecords,
} from '../../hooks/useDnsRecords'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import type { DnsRecord, DnsRecordType } from '@/types/domains'
import { Modal } from '@/components/Modal'
import { SearchableSelect } from '@/components/SearchableSelect'
import { getErrorMessage } from '@/lib/utils'
import { NetworkPulse, LiveIndicator } from '@/components/NetworkPulse'
const RECORD_TYPES: {
  value: DnsRecordType
  label: string
}[] = [
  {
    value: 'A',
    label: 'A — IPv4 address',
  },
  {
    value: 'AAAA',
    label: 'AAAA — IPv6 address',
  },
  {
    value: 'CNAME',
    label: 'CNAME — Alias',
  },
  {
    value: 'MX',
    label: 'MX — Mail exchange',
  },
  {
    value: 'TXT',
    label: 'TXT — Text',
  },
  {
    value: 'NS',
    label: 'NS — Nameserver',
  },
  {
    value: 'SRV',
    label: 'SRV — Service',
  },
]
const TTL_OPTIONS = [
  {
    value: 300,
    label: '5 minutes',
  },
  {
    value: 3600,
    label: '1 hour',
  },
  {
    value: 14400,
    label: '4 hours',
  },
  {
    value: 86400,
    label: '1 day',
  },
]
function typeBadge(t: DnsRecordType) {
  const map: Record<string, string> = {
    A: 'bg-blue-50 text-blue-700 border-blue-200',
    AAAA: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CNAME: 'bg-purple-50 text-purple-700 border-purple-200',
    MX: 'bg-orange-50 text-orange-700 border-orange-200',
    TXT: 'bg-slate-50 text-slate-700 border-slate-200',
    NS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SRV: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return map[t] || 'bg-slate-50 text-slate-700 border-slate-200'
}


export function DnsRecordsSection() {
  const info = useDomainInfo()
  const domainName = info.data?.DomainName || null
  const records = useDnsRecords(domainName)
  const save = useSaveDnsRecords()
  const del = useDeleteDnsRecords()
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<DnsRecord>({
    type: 'A',
    name: '@',
    address: '',
    ttl: 3600,
  })
  const [pendingDelete, setPendingDelete] = useState<DnsRecord | null>(null)
  if (!domainName) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Register a domain first
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            DNS records can only be managed once you have a registered domain.
          </p>
        </div>
      </div>
    )
  }
  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (
      (draft.type === 'A' || draft.type === 'AAAA') &&
      !draft.address?.trim()
    ) {
      toast.error('Address is required')
      return
    }
    try {
      await save.mutateAsync({
        force: true,
        items: [
          {
            type: draft.type,
            name: draft.name.trim(),
            address: draft.address?.trim() || undefined,
            ttl: draft.ttl,
          },
        ],
      })
      toast.success('Record saved')
      setAddOpen(false)
      setDraft({
        type: 'A',
        name: '@',
        address: '',
        ttl: 3600,
      })
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to save record'))
    }
  }
  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await del.mutateAsync([
        {
          type: pendingDelete.type,
          name: pendingDelete.name,
        },
      ])
      toast.success('Record deleted')
      setPendingDelete(null)
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to delete record'))
    }
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
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              DNS records
            </h3>
            <LiveIndicator />
          </div>
          <p className="text-sm text-slate-500">
            {records.data?.total ?? 0} record
            {(records.data?.total ?? 0) === 1 ? '' : 's'} for{' '}
            <span className="font-mono">{domainName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => records.refetch()}
            disabled={records.isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 disabled:opacity-60"
          >
            <RefreshCwIcon
              className={`w-4 h-4 ${records.isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
          >
            <PlusIcon className="w-4 h-4" /> Add record
          </button>
        </div>
      </div>

      {records.isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <NetworkPulse
            state="connecting"
            label="Syncing DNS records"
            sublabel="Querying nameservers…"
          />
        </div>
      ) : records.isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          {getErrorMessage(records.error)}
          <button
            onClick={() => records.refetch()}
            className="ml-2 underline font-medium"
          >
            Retry
          </button>
        </div>
      ) : !records.data || records.data.items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
          <NetworkIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-800">
            No DNS records yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add an A record pointing <code>@</code> to your server to get
            started.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Value</div>
            <div className="col-span-2">TTL</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <AnimatePresence initial={false}>
            {records.data.items.map((r, i) => (
              <motion.div
                key={`${r.type}-${r.name}-${i}`}
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -12,
                }}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 text-sm"
              >
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${typeBadge(r.type)}`}
                  >
                    {r.type}
                  </span>
                </div>
                <div className="sm:col-span-3 font-mono text-slate-800 truncate">
                  {r.name}
                </div>
                <div className="sm:col-span-4 font-mono text-slate-600 truncate">
                  {r.address || r.value || '—'}
                </div>
                <div className="sm:col-span-2 text-slate-500">
                  {r.ttl ?? '—'}s
                </div>
                <div className="sm:col-span-1 flex sm:justify-end">
                  <button
                    onClick={() => setPendingDelete(r)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    aria-label="Delete record"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add record modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => !save.isPending && setAddOpen(false)}
        title="Add DNS record"
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Type"
            required
            options={RECORD_TYPES}
            value={draft.type}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                type: v as DnsRecordType,
              }))
            }
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  name: e.target.value,
                }))
              }
              placeholder="@ or www"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use <code>@</code> for the root domain.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {draft.type === 'AAAA' ? 'IPv6 address' : 'Value'}
              <span className="text-red-400"> *</span>
            </label>
            <input
              value={draft.address || ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  address: e.target.value,
                }))
              }
              placeholder={draft.type === 'AAAA' ? '::1' : '192.0.2.1'}
              className="w-full px-3 py-2 font-mono border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <SearchableSelect
            label="TTL"
            options={TTL_OPTIONS}
            value={draft.ttl ?? 3600}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                ttl: Number(v),
              }))
            }
          />

          {save.isPending && (
            <NetworkPulse
              state="connecting"
              label="Propagating record"
              sublabel="Writing to authoritative nameservers"
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setAddOpen(false)}
              disabled={save.isPending}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={save.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
            >
              {save.isPending ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" /> Save record
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!pendingDelete}
        onClose={() => !del.isPending && setPendingDelete(null)}
        title="Delete DNS record?"
      >
        {pendingDelete && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Remove the <b>{pendingDelete.type}</b> record for{' '}
              <span className="font-mono">{pendingDelete.name}</span>? This may
              affect traffic routed through this record.
            </p>
            {del.isPending && (
              <NetworkPulse state="connecting" label="Removing record…" />
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={del.isPending}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={del.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-60"
              >
                {del.isPending ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2Icon className="w-4 h-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
