// src/features/onboarding/components/Step1SchoolInfo.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboardingStore } from '@/app/store/onboardingStore';

const schema = z.object({
  institution_type: z.enum(['primary', 'primary', 'secondary', 'university']),
  school_name: z.string().min(3, 'School name is required'),
  short_name: z.string().min(2, 'Short name is required'),
  motto: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email'),
  website: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function Step1SchoolInfo({ onNext }: { onNext: () => void }) {
  const { data, setData } = useOnboardingStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      institution_type: (data.institution_type as 'primary' | 'secondary' | 'university') || 'secondary',
      school_name: data.school_name || '',
      short_name: data.short_name || '',
      motto: data.motto || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
    },
  });

  const onSubmit = (formData: FormData) => {
    setData(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Tell us about your school</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Institution Type</Label>
          <select
            {...register('institution_type')}
            className="w-full h-11 rounded-lg border border-gray-300 px-4 focus:ring-orange-500"
          >
            <option value="primary">K-12 School</option>
            <option value="primary">Primary / Junior</option>
            <option value="secondary">Secondary / High School</option>
            <option value="university">Unversity / Institute</option>
          </select>
        </div>

        <div>
          <Label htmlFor="school_name">School Name</Label>
          <Input id="school_name" {...register('school_name')} placeholder="Greenfield International School" />
          {errors.school_name && <p className="text-red-500 text-sm mt-1">{errors.school_name.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="short_name">Short Name / Abbreviation</Label>
        <Input id="short_name" {...register('short_name')} placeholder="GIS" />
        {errors.short_name && <p className="text-red-500 text-sm mt-1">{errors.short_name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">School Email Address</Label>
        <Input id="email" type="email" {...register('email')} placeholder="info@greenfield.edu" />
        <p className="text-amber-600 text-xs mt-1">
          ⚠️ A verification email will be sent to this address. Please use a valid email.
        </p>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register('phone')} placeholder="+1234567890" />
        </div>
        <div>
          <Label htmlFor="website">Website (optional)</Label>
          <Input id="website" {...register('website')} placeholder="https://greenfield.edu" />
        </div>
      </div>

      <div>
        <Label htmlFor="motto">School Motto (optional)</Label>
        <Input id="motto" {...register('motto')} placeholder="Excellence and Integrity" />
      </div>

      <div>
        <Label htmlFor="address">Address (optional)</Label>
        <Input id="address" {...register('address')} placeholder="123 Education Lane" />
      </div>

      <Button type="submit" className="w-full h-12 bg-orange-600 hover:bg-orange-700">
        Continue to Admin Setup
      </Button>
    </form>
  );
}