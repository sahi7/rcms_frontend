// src/features/landing/components/Pricing.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePricing } from '../hooks/usePricing';

export function Pricing() {
  const { plans, features, isLoading, error, getPlanName } = usePricing();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const getCardState = (index: number) => {
    if (hoveredCard === null) return index === 1 ? 'spotlight' : 'recessed';
    return hoveredCard === index ? 'spotlight' : 'recessed';
  };

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg text-gray-500">Loading plans...</p>
        </div>
      </section>
    );
  }

  if (error || plans.length === 0) {
    return (
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-red-500">{error ? 'Failed to load pricing' : 'No plans available'}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-6"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <p className="text-gray-500">All prices are billed yearly</p>
        </div>

        {/* Dynamic Plan Cards – with increased gap */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto perspective-1000">
          {plans.map((plan, index) => {
            const state = getCardState(index);
            const isSpotlight = state === 'spotlight';
            const price = parseFloat(plan.default_price);

            return (
              <motion.div
                key={plan.code}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                animate={{
                  scale: isSpotlight ? 1.05 : 0.95,
                  zIndex: isSpotlight ? 10 : 0,
                  opacity: isSpotlight ? 1 : 0.85,
                  y: isSpotlight ? -12 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`relative w-full lg:w-1/3 rounded-3xl bg-white transition-all duration-300 ${isSpotlight
                    ? 'shadow-2xl shadow-orange-500/20 border-t-4 border-t-orange-500'
                    : 'shadow-lg border border-gray-100'
                  }`}
              >
                {index === 1 && isSpotlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-4 right-6"
                  >
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">Most Popular</Badge>
                  </motion.div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {getPlanName(plan.code)}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-gray-900">CFA</span>
                    <span className="text-5xl font-bold text-gray-900 tracking-tighter">
                      {price}
                    </span>
                    <span className="text-gray-500 text-xl font-medium">/year</span>
                  </div>

                  {/* ALL FEATURES listed with check / X */}
                  <div className="space-y-4 mb-10">
                    {features.map((feature) => {
                      const included = plan.features.includes(feature.code);
                      return (
                        <div key={feature.code} className="flex items-start gap-3 text-sm">
                          {included ? (
                            <Check className="h-5 w-5 text-green-500 mt-px flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mt-px flex-shrink-0" />
                          )}
                          <span className={included ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant={isSpotlight ? 'default' : 'outline'}
                    className={`w-full h-12 text-base font-medium ${isSpotlight ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''
                      }`}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add-ons Section with Tooltip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h4 className="text-xl font-semibold text-gray-900 mb-8">Available Add-ons</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features
              .filter((f) => f.type === 2)
              .map((addon) => (
                <div
                  key={addon.code}
                  className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-orange-200 rounded-3xl p-6 transition-all relative"
                  title={`${addon.description}\n\n+$${addon.additional_price}`}
                >
                  <div className="flex flex-col justify-between items-center">
                      <h5 className="font-medium text-gray-900">{addon.name}</h5>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 group-hover:line-clamp-none">
                        {addon.description}
                      </p>
                      <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <Info className="h-4 w-4" />
                        <span>+CFA{addon.additional_price}</span>
                      </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}