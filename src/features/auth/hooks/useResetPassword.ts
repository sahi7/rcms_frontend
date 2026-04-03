// src/features/auth/hooks/useResetPassword.ts
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export function useResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!uid || !token) return;
    setIsSubmitting(true);

    try {
      await api.post(`/auth/reset-password/${uid}/${token}/`, {
        password: data.password,
        confirm_password: data.confirmPassword,
      });

      toast.success('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Invalid or expired reset link';
      toast.error(msg);
      form.setError('password', { message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting, uid, token };
}