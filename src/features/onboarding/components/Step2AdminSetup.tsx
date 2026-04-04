// src/features/onboarding/components/Step2AdminSetup.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboardingStore } from '@/app/store/onboardingStore';

const schema = z.object({
  admin_first_name: z.string().min(2),
  admin_last_name: z.string().min(2),
  admin_email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  admin_phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Step2AdminSetup({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, setData } = useOnboardingStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      admin_first_name: data.admin_first_name || '',
      admin_last_name: data.admin_last_name || '',
      admin_email: data.admin_email || '',
      password: data.password || '',
      admin_phone: data.admin_phone || '',
    },
  });

  const onSubmit = (formData: FormData) => {
    setData(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="admin_first_name">First Name</Label>
          <Input id="admin_first_name" {...register('admin_first_name')} />
          {errors.admin_first_name && <p className="text-red-500 text-sm">{errors.admin_first_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="admin_last_name">Last Name</Label>
          <Input id="admin_last_name" {...register('admin_last_name')} />
          {errors.admin_last_name && <p className="text-red-500 text-sm">{errors.admin_last_name.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="admin_email">Admin Email</Label>
        <Input id="admin_email" type="email" {...register('admin_email')} />
        {errors.admin_email && <p className="text-red-500 text-sm">{errors.admin_email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="admin_phone">Admin Phone (optional)</Label>
        <Input id="admin_phone" {...register('admin_phone')} />
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
          Continue to Subscription
        </Button>
      </div>
    </form>
  );
}