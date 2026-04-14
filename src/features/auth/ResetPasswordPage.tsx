// src/features/auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './components/AuthLayout';
import { useResetPassword } from './hooks/useResetPassword';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function ResetPasswordPage() {
  const { form, onSubmit, isSubmitting, uid, token } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!uid || !token) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={formVariants} className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Invalid Link</h2>
            <p className="text-gray-500 mt-2">This password reset link is not valid or has expired.</p>
          </motion.div>
          <Link to="/login">
            <Button className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white">
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Back button */}
        <Link
          to="/login"
          className="absolute top-6 left-6 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors z-10"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={formVariants}
          className="mb-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-heading mb-2">
            Set new password
          </h2>
          <p className="text-gray-500">Your new password must be different from previously used passwords.</p>
        </motion.div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <motion.div custom={1} variants={formVariants} className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...form.register('password')}
                placeholder="••••••••"
                className="h-11 pr-10 focus-visible:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </motion.div>

          <motion.div custom={2} variants={formVariants} className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                {...form.register('confirmPassword')}
                placeholder="••••••••"
                className="h-11 pr-10 focus-visible:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </motion.div>

          <motion.div custom={3} variants={formVariants}>
            <Button
              type="submit"
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Resetting password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </AuthLayout>
  );
}