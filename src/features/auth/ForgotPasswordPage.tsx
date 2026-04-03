// src/features/auth/ForgotPasswordPage.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './components/AuthLayout';
import { useForgotPassword } from './hooks/useForgotPassword';

export function ForgotPasswordPage() {
  const { form, onSubmit, isSubmitting, isSubmitted, submittedEmail } = useForgotPassword();

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-12 sm:mt-0">
        {/* Back button - exactly as in your original design */}
        <Link
          to="/login"
          className="absolute top-6 left-6 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors z-10"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <motion.div className="mb-8 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-heading mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-500">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </motion.div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="name@school.edu"
                    className="h-11 focus-visible:ring-orange-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending link...</span>
                    </div>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-heading mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 mb-8">
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-900">{submittedEmail}</span>.
              </p>
              <Link to="/">
                <Button className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white">
                  Return to login
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}