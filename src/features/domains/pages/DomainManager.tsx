import { useEffect, useState, ComponentType  } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  LayoutDashboardIcon,
  UserIcon,
  NetworkIcon,
  ServerIcon,
  BoxIcon,
} from 'lucide-react'
import { useDomainInfo } from '../hooks/useDomainInfo'
import { OverviewSection } from './sections/OverviewSection'
import { ContactDetailsSection } from './sections/ContactDetailsSection'
import { RegisterDomainSection } from './sections/RegisterDomainSection'
import { DnsRecordsSection } from './sections/DnsRecordsSection'
import { NameserversSection } from './sections/NameserversSection'
import { NetworkPulse } from '@/components/NetworkPulse'
import { getErrorMessage } from '@/lib/utils'
type TabKey = 'overview' | 'contact' | 'register' | 'dns' | 'nameservers'
const TABS: {
  key: TabKey
  label: string
  icon: ComponentType<{
    className?: string
  }>
}[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboardIcon,
  },
  {
    key: 'contact',
    label: 'Contact',
    icon: UserIcon,
  },
  {
    key: 'register',
    label: 'Register',
    icon: BoxIcon,
  },
  {
    key: 'dns',
    label: 'DNS',
    icon: NetworkIcon,
  },
  {
    key: 'nameservers',
    label: 'Nameservers',
    icon: ServerIcon,
  },
]
export function DomainManager() {
  const info = useDomainInfo()
  const location = useLocation()
  const navigate = useNavigate()
  const initialTab = (() => {
    const t = new URLSearchParams(location.search).get('tab') as TabKey | null
    if (t && TABS.some((x) => x.key === t)) return t
    return 'overview'
  })()
  const [tab, setTab] = useState<TabKey>(initialTab)
  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab') as TabKey | null
    if (t && TABS.some((x) => x.key === t) && t !== tab) setTab(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])
  const setTabAndUrl = (k: TabKey) => {
    setTab(k)
    const sp = new URLSearchParams(location.search)
    sp.set('tab', k)
    navigate(
      {
        search: sp.toString(),
      },
      {
        replace: true,
      },
    )
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
      transition={{
        duration: 0.2,
      }}
      className="space-y-5"
    >
      <div>
        <Link
          to="/dashboard/domains"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to domains
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Domain manager
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {info.data?.DomainName
            ? `Managing ${info.data.DomainName}`
            : 'Set up your domain in a few steps.'}
        </p>
      </div>

      {info.isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <NetworkPulse state="connecting" label="Connecting to registry" />
        </div>
      ) : info.isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          {getErrorMessage(info.error)}
          <button
            onClick={() => info.refetch()}
            className="ml-2 underline font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = tab === key
                return (
                  <button
                    key={key}
                    onClick={() => setTabAndUrl(key)}
                    className={`relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'text-orange-700 bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            key={tab}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            {tab === 'overview' && <OverviewSection />}
            {tab === 'contact' && <ContactDetailsSection />}
            {tab === 'register' && <RegisterDomainSection />}
            {tab === 'dns' && <DnsRecordsSection />}
            {tab === 'nameservers' && <NameserversSection />}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
