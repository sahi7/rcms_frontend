// src/features/auth/LoginPage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";
import api from "@/lib/api";
import { School } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [showForgot, setShowForgot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ← our own loading state

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      // Only reset password field on success
      loginForm.setValue("password", "");
    } catch {
      // Do nothing — error already toasted in store
      // Username stays filled, password stays (user can correct)
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgot = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password/", { email: data.email });
      toast.success("Password reset link sent!");
      setShowForgot(false);
      forgotForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Email not found");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <School className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">School Management</CardTitle>
          <CardDescription>Sign in with your username</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="principal2025"
                autoComplete="username"
                disabled={isSubmitting}
                {...loginForm.register("username")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...loginForm.register("password")}
              />
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-primary hover:underline font-medium"
              disabled={isSubmitting}
            >
              Forgot your password?
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Try: <strong>principal2025</strong> (any password)
          </p>
        </CardContent>
      </Card>

      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a reset link
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="principal@school.com"
                {...forgotForm.register("email")}
              />
              {forgotForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {forgotForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button variant="outline" type="button" onClick={() => setShowForgot(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}