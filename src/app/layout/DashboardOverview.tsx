import { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Quote,
  Settings,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/app/store/authStore'
import { useBrandingSettings } from '@/features/settings/hooks/useSettings'
import { PipeBackground } from '../components/PipeBackground'
function getGreeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}
function formatToday(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
interface InfoItem {
  icon: ComponentType<{
    size?: number
    className?: string
  }>
  label: string
  value: string
  href?: string
}
export function DashboardOverview() {
  const { user } = useAuthStore()
  const { data: branding, isLoading, isError, error } = useBrandingSettings()
  const greeting = getGreeting()
  const displayName =
    user?.first_name?.trim() ||
    user?.full_name?.trim()?.split(' ')[0] ||
    user?.username ||
    'there'
  // Build contact items only from filled fields
  const contactItems: InfoItem[] = []
  if (branding?.email) {
    contactItems.push({
      icon: Mail,
      label: 'Email',
      value: branding.email,
      href: `mailto:${branding.email}`,
    })
  }
  if (branding?.phone) {
    contactItems.push({
      icon: Phone,
      label: 'Phone',
      value: branding.phone,
      href: `tel:${branding.phone}`,
    })
  }
  if (branding?.phone2) {
    contactItems.push({
      icon: Phone,
      label: 'Alt. Phone',
      value: branding.phone2,
      href: `tel:${branding.phone2}`,
    })
  }
  if (branding?.address) {
    contactItems.push({
      icon: MapPin,
      label: 'Address',
      value: branding.address,
    })
  }
  const hasSchoolName = !!branding?.school_name
  const hasMotto = !!branding?.motto
  const hasLogo = !!(branding?.logo || branding?.logo_dark)
  const brandingFieldsFilled =
    (hasSchoolName ? 1 : 0) +
    (hasMotto ? 1 : 0) +
    (branding?.address ? 1 : 0) +
    (branding?.phone ? 1 : 0) +
    (branding?.email ? 1 : 0) +
    (hasLogo ? 1 : 0)
  const totalBrandingFields = 6
  const brandingComplete = brandingFieldsFilled === totalBrandingFields
  return (
    <div className="relative min-h-[calc(100vh-8rem)] -mx-4 -my-4 md:-mx-8 md:-my-8 px-4 py-4 md:px-8 md:py-8 overflow-hidden">
      {/* Fluid pipe background */}
      <div className="absolute inset-0 pointer-events-none">
        <PipeBackground variant="light" density="normal" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative space-y-8 max-w-6xl mx-auto pb-12"
      >
        {/* Greeting */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <p className="text-sm font-medium text-orange-600 uppercase tracking-wider mb-2">
              {formatToday()}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">
              {greeting}, {displayName}
            </h1>
            <p className="text-gray-500 mt-2">
              Welcome back to your dashboard. More insights are on the way.
            </p>
          </div>
        </div>

        {/* Branding / Institution error */}
        {isError && (
          <Card className="p-5 border-red-200 bg-red-50/80 backdrop-blur-sm flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="font-semibold text-red-900">
                Couldn't load institution details
              </p>
              <p className="text-sm text-red-700 mt-0.5">
                {(error as any)?.message ||
                  'Please check your connection and try again.'}
              </p>
            </div>
          </Card>
        )}

        {/* Institution Card */}
        <Card className="relative overflow-hidden bg-white/85 backdrop-blur-sm border-gray-200">
          {isLoading ? (
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !branding ||
            (!hasSchoolName && !hasMotto && contactItems.length === 0) ? (
            // Empty state — nothing configured
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Set up your institution
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-lg">
                    Add your institution name, logo, and contact details to
                    personalize the dashboard for everyone on your team.
                  </p>
                  <Button
                    asChild
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    <Link to="/dashboard/settings">
                      Go to Branding settings
                      <ArrowRight size={16} className="ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              {/* Header row */}
              <div className="flex items-start gap-4 flex-wrap">
                {hasLogo ? (
                  <img
                    src={branding.logo || branding.logo_dark || undefined}
                    alt={branding.school_name || 'Institution logo'}
                    className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100 p-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Building2 size={28} className="text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {hasSchoolName ? (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-heading truncate">
                        {branding!.school_name}
                      </h2>
                      {branding?.short_name && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {branding.short_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/dashboard/settings"
                      className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Add institution name
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Motto */}
              {hasMotto && (
                <div className="mt-5 flex gap-3 pl-1">
                  <Quote
                    size={18}
                    className="text-orange-500 flex-shrink-0 mt-1"
                  />
                  <p className="text-gray-700 italic leading-relaxed">
                    {branding!.motto}
                  </p>
                </div>
              )}

              {/* Contact grid — only filled items */}
              {contactItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactItems.map((item) => {
                    const Icon = item.icon
                    const content = (
                      <div className="flex items-start gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-50 transition-colors">
                          <Icon
                            size={16}
                            className="text-gray-500 group-hover:text-orange-600 transition-colors"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    )
                    return item.href ? (
                      <a key={item.label} href={item.href} className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={item.label}>{content}</div>
                    )
                  })}
                </div>
              )}

              {/* Complete profile nudge */}
              {!brandingComplete && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-[200px]">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{
                            width: `${(brandingFieldsFilled / totalBrandingFields) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {brandingFieldsFilled}/{totalBrandingFields} complete
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                  >
                    <Link to="/dashboard/settings">
                      <Settings size={14} className="mr-1.5" />
                      Finish branding setup
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats placeholder note */}
        <div className="text-center pt-8">
          <p className="text-sm text-gray-400">
            Statistics and activity insights are coming soon.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
