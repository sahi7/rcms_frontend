import React, { useState } from 'react'
import {
  PaletteIcon,
  BuildingIcon,
  SlidersHorizontalIcon,
  UserIcon,
  CreditCardIcon,
  SettingsIcon,
} from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { BrandingSettings } from './BrandingSettings'
import { InstitutionSettings } from './InstitutionSettings'
import { PreferencesSettings } from './PreferencesSettings'
import { ProfilePage } from './ProfilePage'
import { SubscriptionPage } from './SubscriptionPage'
interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  description: string
}
const NAV_ITEMS: NavItem[] = [
  {
    id: 'branding',
    label: 'Branding',
    icon: PaletteIcon,
    description: 'Logos, colors & contact info',
  },
  {
    id: 'institution',
    label: 'Institution',
    icon: BuildingIcon,
    description: 'Core institution settings',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: SlidersHorizontalIcon,
    description: 'Academic configuration',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserIcon,
    description: 'Your personal information',
  },
  {
    id: 'subscription',
    label: 'Subscription',
    icon: CreditCardIcon,
    description: 'Plan & billing',
  },
]
const SECTION_MAP: Record<string, React.ComponentType> = {
  branding: BrandingSettings,
  institution: InstitutionSettings,
  preferences: PreferencesSettings,
  profile: ProfilePage,
  subscription: SubscriptionPage,
}
export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('branding')
  const ActiveComponent = SECTION_MAP[activeSection]
  return (
    <div className="min-h-screen bg-slate-50/50 w-full">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-sm text-slate-500">
                Manage your institution and account settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:sticky lg:top-8">
              <div className="p-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-xs truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </div>
  )
}
