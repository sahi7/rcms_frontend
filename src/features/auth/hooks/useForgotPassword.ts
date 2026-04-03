import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function useForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password/', { email: data.email });
      toast.success('Password reset link sent!');
      setSubmittedEmail(data.email);   // ← capture email before reset
      setIsSubmitted(true);
      form.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Email not found');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting, isSubmitted, submittedEmail };
}