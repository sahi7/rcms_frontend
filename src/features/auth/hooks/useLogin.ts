import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/app/store/authStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLogin() {
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      // Password field cleared only on success (UX)
      form.setValue('password', '');
    } catch {
      // Error already toasted inside authStore
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting };
}