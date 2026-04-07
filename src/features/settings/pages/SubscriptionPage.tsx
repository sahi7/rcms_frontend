import React, { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Loader2Icon,
  CheckCircle2Icon,
  CrownIcon,
  SparklesIcon,
  ZapIcon,
  CalendarIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useSubscription,
  useUpdateSubscription,
} from '../hooks/useSubscription'
import { PlanOption } from '@/types/settings'
const PLANS: PlanOption[] = [
  {
    code: 'basic',
    name: 'Basic',
    price: '0',
    features: ['Student Management', 'Basic Reports', 'Up to 100 Students'],
  },
  {
    code: 'essential',
    name: 'Essential',
    price: '900',
    features: [
      'Student Management',
      'Report Card Generation',
      'Up to 500 Students',
      'Email Notifications',
    ],
  },
  {
    code: 'premium',
    name: 'Premium',
    price: '2,500',
    recommended: true,
    features: [
      'Everything in Essential',
      'Advanced Analytics',
      'Unlimited Students',
      'Priority Support',
      'Custom Branding',
      'API Access',
    ],
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    price: '5,000',
    features: [
      'Everything in Premium',
      'Multi-campus Support',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Option',
    ],
  },
]
const planIcons: Record<string, React.ReactNode> = {
  basic: <ZapIcon className="w-5 h-5" />,
  essential: <SparklesIcon className="w-5 h-5" />,
  premium: <CrownIcon className="w-5 h-5" />,
  enterprise: <CrownIcon className="w-5 h-5" />,
}
export function SubscriptionPage() {
  const { data, isLoading } = useSubscription()
  const updateMutation = useUpdateSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const currentPlan = data?.subscription?.plan_code
  const isActive = data?.subscription?.is_active
  const handleChangePlan = async (planCode: string) => {
    if (planCode === currentPlan) return
    setSelectedPlan(planCode)
    try {
      await updateMutation.mutateAsync({
        plan_code: planCode,
      })
      toast.success(`Subscription updated to ${planCode}`)
      setSelectedPlan(null)
    } catch {
      toast.error('Failed to update subscription')
      setSelectedPlan(null)
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Your active plan and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  {planIcons[currentPlan] || <ZapIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 capitalize">
                    {currentPlan} Plan
                  </p>
                  <p className="text-sm text-slate-500">
                    {data?.subscription?.plan_price
                      ? `${data.subscription.plan_price} XAF/month`
                      : 'Free'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={isActive ? 'default' : 'destructive'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                {data?.subscription?.end_date && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarIcon className="w-4 h-4" />
                    Expires{' '}
                    {new Date(data.subscription.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">
                  No Active Subscription
                </p>
                <p className="text-sm text-amber-600">
                  Choose a plan below to get started
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Features */}
      {data?.features && data.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Features</CardTitle>
            <CardDescription>
              Features included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.features.map((feature) => (
                <div
                  key={feature.code}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-lg"
                >
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-emerald-800">
                    {feature.name}
                  </span>
                  {feature.type === 'core' && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      Core
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Available Plans
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Choose the plan that best fits your institution
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, index) => {
            const isCurrent = plan.code === currentPlan
            const isChanging =
              selectedPlan === plan.code && updateMutation.isPending
            return (
              <motion.div
                key={plan.code}
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.4,
                }}
              >
                <Card
                  className={`relative h-full flex flex-col ${plan.recommended ? 'border-blue-300 shadow-md shadow-blue-100/50' : isCurrent ? 'border-emerald-300' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white border-0 shadow-sm">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.recommended ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {planIcons[plan.code]}
                      </div>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 bg-emerald-50"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-slate-800">
                        {plan.price === '0' ? 'Free' : `${plan.price}`}
                      </span>
                      {plan.price !== '0' && (
                        <span className="text-sm text-slate-500 ml-1">
                          XAF/mo
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1 mb-4">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={
                        isCurrent
                          ? 'outline'
                          : plan.recommended
                            ? 'default'
                            : 'outline'
                      }
                      className="w-full"
                      disabled={isCurrent || updateMutation.isPending}
                      onClick={() => handleChangePlan(plan.code)}
                    >
                      {isChanging ? (
                        <>
                          <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (
                        'Select Plan'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
