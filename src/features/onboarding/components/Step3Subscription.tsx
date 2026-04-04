import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/app/store/onboardingStore';

const schema = z.object({
  plan: z.string().min(1),
  features: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

export default function Step3Subscription({ onNext, onBack, plans, features }: any) {
  const { data, setData } = useOnboardingStore();
  const { handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      plan: data.subscription?.plan || plans[0]?.code || '',
      features: data.subscription?.features || [],
    },
  });

  const selectedPlanCode = watch('plan');
  const selectedAddons = watch('features');

  const selectedPlan = plans.find((p: any) => p.code === selectedPlanCode);
  const basePrice = selectedPlan ? parseFloat(selectedPlan.default_price) : 0;

  const addonPrice = selectedAddons.reduce((sum: number, code: string) => {
    const addon = features.find((f: any) => f.code === code && f.type === 2);
    return sum + (addon ? parseFloat(addon.additional_price) : 0);
  }, 0);

  const total = basePrice + addonPrice;

  const onSubmit = (formData: FormData) => {
    setData({
      subscription: { plan: formData.plan, features: formData.features },
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <h2 className="text-2xl font-bold">Choose your plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div
            key={plan.code}
            onClick={() => setValue('plan', plan.code)}
            className={`border-2 rounded-3xl p-6 cursor-pointer transition-all ${
              selectedPlanCode === plan.code ? 'border-orange-500 shadow-lg' : 'border-gray-200'
            }`}
          >
            <h3 className="font-bold text-xl">{plan.code.charAt(0).toUpperCase() + plan.code.slice(1)}</h3>
            <div className="text-4xl font-bold mt-2">${parseFloat(plan.default_price)}<span className="text-sm font-normal">/year</span></div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-medium mb-4">Add-ons (optional)</h4>
        <div className="grid grid-cols-2 gap-4">
          {features
            .filter((f: any) => f.type === 2)
            .map((addon: any) => (
              <label key={addon.code} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.code)}
                  onChange={(e) => {
                    const newFeatures = e.target.checked
                      ? [...selectedAddons, addon.code]
                      : selectedAddons.filter((c: string) => c !== addon.code);
                    setValue('features', newFeatures);
                  }}
                  className="accent-orange-500"
                />
                <div>
                  <span className="font-medium">{addon.name}</span>
                  <span className="text-orange-600 text-sm ml-2">+${addon.additional_price}</span>
                </div>
              </label>
            ))}
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-3xl">
        <div className="flex justify-between text-xl">
          <span>Total yearly cost</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-orange-600">
          Continue
        </Button>
      </div>
    </form>
  );
}