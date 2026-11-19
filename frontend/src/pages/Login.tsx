import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Mail, Moon, Sun } from 'lucide-react';
import { LoginSchema } from '@helpdesk360/shared';
import { ApiError } from '../api/client';
import { Button } from '../components/common/Button';
import { PasswordInput } from '../components/common/PasswordInput';
import { TextInput } from '../components/common/TextInput';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const demoAccounts = [
  { role: 'Employee', email: 'priya.nair@helpdesk.local' },
  { role: 'Technician', email: 'arjun.mehta@helpdesk.local' },
  { role: 'Admin', email: 'admin@helpdesk.local' },
];
const showDemo = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

export const Login: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    const from = (location.state as { from?: { pathname: string; search: string; hash: string } } | null)?.from;
    const destination = from?.pathname.startsWith('/') && !from.pathname.startsWith('//') ? from : '/';
    return <Navigate to={destination} replace />;
  }

  const signIn = async (email: string, password: string, persistSession: boolean) => {
    if (isLoading || isSubmitting) return;
    setError(null);

    const result = LoginSchema.safeParse({ email, password, rememberMe: persistSession });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const account = await login(result.data.email, result.data.password, persistSession);
      toast.success(`Welcome back, ${account.name}!`);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status < 500) {
        setError(cause.validationErrors?.[0]?.message || cause.message);
      } else {
        setError('Unable to reach the sign-in service. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void signIn(String(form.get('email') ?? ''), String(form.get('password') ?? ''), rememberMe);
  };

  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-900 p-4 sm:p-8">
      <div className="absolute inset-0" aria-hidden="true">
        <img src="/images/office-bg.png" alt="" className="h-full w-full object-cover opacity-45" />
      </div>

      <section aria-labelledby="login-title" className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
        <header className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="" className="h-11 w-11 rounded-lg border border-border bg-white object-contain p-1" />
            <span className="text-sm font-semibold text-text-primary">HelpDesk 360</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <h1 id="login-title" className="text-2xl font-semibold tracking-tight text-text-primary">Sign in to your account</h1>
        <p className="mt-2 text-sm text-text-secondary">Use your work email to access the IT service desk.</p>

        {isLoading ? (
          <p role="status" className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking your session…
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" onChange={() => setError(null)}>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <TextInput
                id="login-email"
                label="Work email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
                required
                disabled={isSubmitting}
                className="!h-11 !text-base sm:!text-sm"
              />
              <PasswordInput
                id="login-password"
                label="Password"
                name="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="!h-11 !text-base sm:!text-sm"
              />

              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                Keep me signed in on this device
              </label>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            {showDemo && (
              <div className="mt-5 border-t border-border pt-4">
                <button
                  type="button"
                  className="rounded text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-brand"
                  aria-expanded={showDemoAccounts}
                  aria-controls="demo-accounts"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                >
                  Demo accounts
                </button>
                <div id="demo-accounts" hidden={!showDemoAccounts} className="mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {demoAccounts.map(({ role, email }) => (
                      <Button key={role} type="button" size="sm" variant="secondary" disabled={isSubmitting} onClick={() => void signIn(email, 'Password123!', false)}>
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="mt-5 text-xs text-text-secondary">Need an account or a password reset? Contact your IT administrator.</p>
          </>
        )}
      </section>
    </main>
  );
};
