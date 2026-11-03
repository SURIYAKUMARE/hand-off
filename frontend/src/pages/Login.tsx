import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import {
  LifeBuoy,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Server,
  Zap,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (user) {
      const target =
        user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'TECHNICIAN'
          ? '/technician/dashboard'
          : '/employee/tickets';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      const authenticatedUser = await login(email.trim(), password, rememberMe);
      toast.success(`Welcome back, ${authenticatedUser.name}!`);

      const defaultDest =
        authenticatedUser.role === 'ADMIN'
          ? '/admin/dashboard'
          : authenticatedUser.role === 'TECHNICIAN'
          ? '/technician/dashboard'
          : '/employee/tickets';

      const destination = (location.state as any)?.from?.pathname || defaultDest;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-text-primary selection:bg-brand-light selection:text-brand">
      {/* Top Floating Theme Switcher on Mobile/Tablet */}
      <div className="absolute top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Left Panel: Executive Institutional Brand Panel (Niyam AI style) */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#0F172A] text-white p-8 md:p-12 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
        {/* Subtle decorative radial gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Brand Row with Emblem + Monospace Tag */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
              <span className="live-indicator-dot absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  HelpDesk <span className="text-blue-400">360</span>
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Enterprise ITSM Gateway
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise service management, structured from issue to resolution.
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Engineered with ITIL SLA enforcement, offline-first sync architecture, multi-department queues, and automated technician assignment.
            </p>
          </div>

          {/* Institutional Highlights */}
          <div className="mt-8 space-y-3 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Real-time multi-tenant ticket triaging</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Offline outbox synchronization</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Automated SLA breach prevention & escalations</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Role-enforced authentication & audit persistence</span>
        </div>
      </div>

      {/* Right Panel: Sign-in Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20 mb-3">
              <Lock className="w-3 h-3" />
              <span>Authorized Enterprise Access</span>
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Enter your corporate email and credentials to access your support workspace.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Corporate Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@helpdesk.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <PasswordInput
              label="Account Password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand focus:ring-offset-0"
                />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[11px] text-text-muted">ISO 20000 Compliant</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-sm"
              isLoading={isLoading}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Access Service Desk
            </Button>
          </form>

          {/* Demo Accounts Helper Panel */}
          <div className="pt-4 border-t border-border">
            <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-2.5">
              Quick Role Switcher (Pre-fills verified credentials)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@helpdesk.local')}
                className="flex items-start gap-2 p-2 text-left rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-brand/40 transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">Vikram Aditya</div>
                  <div className="text-[10px] text-text-muted font-medium truncate">Administrator</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('arjun.mehta@helpdesk.local')}
                className="flex items-start gap-2 p-2 text-left rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-brand/40 transition-all shadow-xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">Arjun Mehta</div>
                  <div className="text-[10px] text-text-muted font-medium truncate">Technician</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('priya.nair@helpdesk.local')}
                className="flex items-start gap-2 p-2 text-left rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-brand/40 transition-all shadow-xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">Priya Nair</div>
                  <div className="text-[10px] text-text-muted font-medium truncate">Employee</div>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-2 text-center">
              Click any profile above to instantly test permissions and views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
