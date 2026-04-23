// src/features/auth/LoginPage.tsx
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AuthLayout } from './components/AuthLayout';
import { useLogin } from './hooks/useLogin';

const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export default function LoginPage() {
  const { form, onSubmit, isSubmitting } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={formVariants}
          className="mb-8 text-center lg:text-left"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-heading mb-2">
            Welcome back
          </h2>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </motion.div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <motion.div custom={1} variants={formVariants} className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </Label>
            <Input
              id="username"
              {...form.register('username')}
              placeholder="principal2025"
              className="h-11 focus-visible:ring-orange-500"
            />
          </motion.div>

          {/* Password */}
          <motion.div custom={2} variants={formVariants} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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
          </motion.div>

          <motion.div custom={4} variants={formVariants}>
            <Button
              type="submit"
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div custom={5} variants={formVariants} className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/request-demo" className="w-full sm:w-auto text-brand-orange">
              <Button variant="outline" className="w-full h-11">
                Request Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}