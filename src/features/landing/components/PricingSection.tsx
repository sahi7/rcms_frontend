// src/features/landing/components/PricingSection.tsx
import { useRef } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Plan {
  code: string;
  default_price: string;
  is_active: boolean;
}

interface Feature {
  code: string;
  name: string;
  description: string;
  additional_price: string;
}

// Common features for Essential plan
const essentialFeatures = [
  "Staff & Student Management",
  "Tuition & Finance",
  "Report Card Generation",
  "Transcript Generation",
  "Student & Parent Portal",
];

// Premium exclusive features (added on top of Essential features)
const premiumFeatures = [
  "Classlist Generation",
  "Timetable Builder",
  "AI Studio",
  "Institution Website Integration",
  "Admission Portal"
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch plans
  const { data: plansData = [], isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: async () => {
      const res = await api.get("/plans/");
      return res.data.results || res.data;
    },
    staleTime: Infinity,
  });

  // Fetch features
  const { data: featuresData = [], isLoading: featuresLoading, error: featuresError } = useQuery({
    queryKey: ["pricing-features"],
    queryFn: async () => {
      const res = await api.get("/features/");
      return res.data.results || res.data;
    },
    staleTime: Infinity,
  });

  const plans: Plan[] = plansData.filter((p: any) => p.is_active);
  const addOnFeatures: Feature[] = featuresData;

  // Find plans safely
  const essentialPlan = plans.find(p => p.code === "essential");
  const premiumPlan = plans.find(p => p.code === "ultimate");

  // Check if data failed to load
  const hasDataError = (plansError || featuresError) || (plans.length === 0 && !plansLoading);
  const isLoading = plansLoading || featuresLoading;

  const getPlanPrice = (plan: Plan) => {
    return parseFloat(plan.default_price).toLocaleString("fr-CM");
  };

  // Loading state
  if (isLoading) {
    return (
      <section ref={sectionRef} id="pricing" className="max-w-screen-2xl mx-auto px-6 py-24 bg-white">
        <div className="text-center">
          <div className="inline-flex items-center gap-x-2 bg-gray-100 px-5 py-2 rounded-3xl text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            Loading plans...
          </div>
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (hasDataError || plans.length === 0) {
    return (
      <section ref={sectionRef} id="pricing" className="max-w-screen-2xl mx-auto px-6 py-24 bg-white">
        <div className="text-center">
          <div className="inline-flex items-center gap-x-2 bg-red-50 px-5 py-2 rounded-3xl text-sm font-medium mb-4 text-red-600">
            <X className="w-4 h-4" />
            Unable to load pricing
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900">Pricing unavailable</h2>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            We're having trouble loading our plans and features. Please try again later or contact support.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="pricing" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-x-2 bg-orange-50 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            Pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your institution. All plans are billed annually.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Essential Plan Card */}
          {essentialPlan && (
            <div className="relative rounded-2xl border border-gray-200 shadow-sm bg-white">
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Essential
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Perfect for small to medium institutions
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    CFA {getPlanPrice(essentialPlan)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">/year</span>
                </div>

                <div className="mt-8">
                  <div className="text-sm font-medium text-gray-900 mb-4">What's included:</div>
                  <ul className="space-y-3">
                    {essentialFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FF7A00] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Premium Plan Card */}
          {premiumPlan && (
            <div className="relative rounded-2xl border border-[#FF7A00] shadow-xl ring-2 ring-[#FF7A00]/20 bg-white">
              <div className="absolute -top-3 left-6">
                <span className="bg-[#FF7A00] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Premium
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Advanced features for larger institutions
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    CFA {getPlanPrice(premiumPlan)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">/year</span>
                </div>

                <div className="mt-8">
                  <div className="text-sm font-medium text-gray-900 mb-4">What's included:</div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#FF7A00] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm font-medium">
                        Everything in Essential plus:
                      </span>
                    </li>
                    {premiumFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 pl-2">
                        <Check className="w-5 h-5 text-[#FF7A00] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add-on Features Section */}
        {addOnFeatures.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="border-t border-gray-200 pt-12 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Available Add-ons
              </h3>
              <p className="text-gray-500 text-center">
                Enhance any plan with additional features. Only pay for what you need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addOnFeatures.map((feature) => {
                const price = parseFloat(feature.additional_price).toLocaleString("fr-CM");

                return (
                  <div
                    key={feature.code}
                    className="rounded-xl border border-gray-200 p-6 bg-white hover:border-[#FF7A00] transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.name}</h4>
                    <p className="text-gray-500 text-sm mb-4">{feature.description}</p>
                    <div className="text-lg font-semibold text-[#FF7A00]">
                      CFA {price}
                      <span className="text-sm font-normal text-gray-500">/year</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}