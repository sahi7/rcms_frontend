// src/features/onboarding/components/Step4Review.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/app/store/onboardingStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function Step4Review({ onBack }: { onBack: () => void }) {
  const { data, reset } = useOnboardingStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend cooldown (3 minutes = 180 seconds)
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async () => {
    // VALIDATION: Avoid POST if necessary fields are missing
    if (
      !data.school_name?.trim() ||
      !data.short_name?.trim() ||
      !data.email?.trim() ||
      !data.admin_email?.trim() ||
      !data.admin_first_name?.trim() ||
      !data.admin_last_name?.trim() ||
      !data.password?.trim() ||
      !data.subscription?.plan
    ) {
      toast.error('Please ensure all required fields are filled before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        institution_type: data.institution_type,
        school_name: data.school_name,
        short_name: data.short_name,
        motto: data.motto,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        admin_email: data.admin_email,
        admin_first_name: data.admin_first_name,
        admin_last_name: data.admin_last_name,
        password: data.password,
        admin_phone: data.admin_phone,
        subscription: data.subscription,
      };

      await api.post('/onboarding/register/', payload);

      toast.success('Registration successful! Verification email sent.');

      // Capture email before the data is reset
      setAdminEmail(data.admin_email ?? '');

      setIsSubmitted(true);
      reset(); // clear stored data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail;
      toast.error(errorMsg || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!adminEmail || cooldown > 0) return;

    setIsResending(true);
    try {
      await api.post('/onboarding/resend-verification/', { email: adminEmail });
      toast.success('Verification email resent successfully!');

      // Start 3-minute cooldown
      setCooldown(180);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          ✅
        </div>
        <h2 className="text-2xl font-bold">Almost there!</h2>
        <p className="mt-4 text-gray-600">
          We have sent a verification link to <strong>{adminEmail}</strong>.<br />
          Please check your inbox (and spam folder).
        </p>

        <div className="mt-10 space-y-4">
          <Button
            onClick={handleResendVerification}
            disabled={isResending || cooldown > 0}
            variant="outline"
            className="w-full"
          >
            {isResending
              ? 'Resending...'
              : cooldown > 0
                ? `Resend in ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, '0')}`
                : 'Resend Verification Email'}
          </Button>

          <Button onClick={() => navigate('/login')} className="w-full bg-orange-600">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Review your information</h2>

      <div className="space-y-8 text-sm">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">School Information</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-gray-600">
            <dt className="font-medium">School Name</dt>
            <dd>{data.school_name}</dd>
            <dt className="font-medium">Short Name</dt>
            <dd>{data.short_name}</dd>
            <dt className="font-medium">Email</dt>
            <dd>{data.email}</dd>
          </dl>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Admin Account</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-gray-600">
            <dt className="font-medium">Name</dt>
            <dd>{data.admin_first_name} {data.admin_last_name}</dd>
            <dt className="font-medium">Email</dt>
            <dd>{data.admin_email}</dd>
          </dl>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Subscription</h3>
          <p className="text-gray-600">
            Plan: <span className="font-medium capitalize">{data.subscription?.plan}</span>
          </p>
          {data.subscription?.features.length ? (
            <p className="text-gray-600 mt-1">
              Add-ons: {data.subscription.features.join(', ')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-4 mt-12">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-orange-600 hover:bg-orange-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit & Create Account'}
        </Button>
      </div>
    </div>
  );
}