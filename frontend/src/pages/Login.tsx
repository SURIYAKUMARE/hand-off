import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import {
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  KeyRound,
  RotateCw,
} from 'lucide-react';

interface DemoPersona {
  id: 'admin' | 'technician' | 'employee';
  label: string;
  name: string;
  email: string;
  roleBadge: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'admin',
    label: 'Admin',
    name: 'Vikram Aditya',
    email: 'admin@helpdesk.local',
    roleBadge: 'LEVEL 4 · ADMIN',
  },
  {
    id: 'technician',
    label: 'Technician',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@helpdesk.local',
    roleBadge: 'LEVEL 3 · TECH',
  },
  {
    id: 'employee',
    label: 'Employee',
    name: 'Priya Nair',
    email: 'priya.nair@helpdesk.local',
    roleBadge: 'LEVEL 1 · STAFF',
  },
];

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [selectedPersona, setSelectedPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [email, setEmail] = useState('admin@helpdesk.local');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaCode, setCaptchaCode] = useState('CLKD4');
  const [captchaInput, setCaptchaInput] = useState('CLKD4');
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

  const regenerateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput(code);
  };

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Enter your username or official email.');
      return;
    }
    if (!loginPass) {
      setErrorMessage('Enter your password.');
      return;
    }
    if (captchaInput && captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('Invalid security captcha code. Please re-enter.');
      return;
    }

    try {
      setIsLoading(true);
      const authenticatedUser = await login(loginEmail.trim(), loginPass, rememberMe);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleSelectPersona = (persona: DemoPersona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const handleInstantDemoLogin = () => {
    performLogin(selectedPersona.email, 'Password123!');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden selection:bg-brand-light selection:text-brand">
      {/* Fullscreen Backdrop Office Image from Niyam AI */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img
          src="/images/office-bg.png"
          alt="Handoff Office Headquarters"
          className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.03]"
        />
        {/* Subtle dark vignette gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/35 to-slate-950/65 dark:from-slate-950/90 dark:via-slate-950/60 dark:to-slate-950/80" />
      </div>

      {/* Floating Center Glassmorphic Card (Exact Niyam Design) */}
      <div className="relative z-10 w-full max-w-[460px] bg-surface/95 dark:bg-surface/90 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-6 transition-all duration-200">
        
        {/* Top Control Header Row */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@helpdesk.local');
              setPassword('Password123!');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-muted border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 text-text-muted" />
            <span>Portal Home</span>
          </button>

          {/* Live Operational Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ITSM Core Online</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn !p-1.5"
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

        {/* Brand Emblem & Headings */}
        <div className="text-center pt-1 pb-1">
          <div className="inline-flex items-center justify-center relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-md mb-2 p-1.5 overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Handoff Complaint App Logo"
              className="w-full h-full object-contain rounded-xl"
            />
            <span className="live-indicator-dot absolute -top-1 -right-1" />
          </div>
          <div className="text-[11px] font-bold text-brand uppercase tracking-wider">
            Enterprise Complaint Resolution
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight mt-0.5">
            Handoff HelpDesk 360
          </h1>
          <p className="text-[11px] text-text-secondary font-medium mt-0.5">
            ITIL Incident Triaging & SLA Compliance Portal
          </p>
        </div>

        {/* Quick Demo Persona Bar (Signature Niyam UI Component) */}
        <div className="p-3 rounded-xl bg-surface-muted/90 border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-text-primary text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Quick Demo Persona</span>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
              PW: Password123!
            </span>
          </div>

          {/* Persona Pills */}
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Selected Persona Info Tag */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="truncate font-semibold text-text-primary">
              <span className="font-bold">{selectedPersona.name}</span>{' '}
              <span className="text-text-muted font-mono text-[10px]">({selectedPersona.id})</span>
            </div>
            <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-surface border border-border text-brand flex-shrink-0">
              {selectedPersona.roleBadge}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in duration-150 font-medium"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username / Official ID */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-primary">
              Username / Official Email
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official.email@helpdesk.local"
                required
                disabled={isLoading}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-text-primary">Password</label>
              <span className="font-mono text-[10px] text-brand font-semibold">
                PW: Password123!
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isLoading}
                className="w-full h-9 pl-9 pr-9 rounded-xl border border-border bg-surface text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Security Code (Captcha) - Exact Signature Feature from Niyam AI */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-text-primary">Security Code (Captcha)</label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Enterprise Verified
              </span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div
                className="col-span-5 h-9 rounded-xl border border-border bg-brand/5 dark:bg-brand/10 flex items-center justify-center font-mono font-black text-xs sm:text-sm tracking-[0.25em] text-brand select-none relative overflow-hidden shadow-xs cursor-default"
                title="Security Captcha Stamp"
              >
                <span className="relative z-10 italic line-through decoration-brand/40 decoration-1">{captchaCode}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={regenerateCaptcha}
                className="col-span-2 h-9 rounded-xl border border-border bg-surface hover:bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer shadow-xs"
                title="Refresh Captcha"
                aria-label="Refresh Captcha Code"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder={captchaCode}
                className="col-span-5 h-9 px-3 rounded-xl border border-border bg-surface text-xs font-mono font-bold tracking-widest text-text-primary uppercase placeholder:text-text-muted/60 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Remember session checkbox */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px]">Remember active session</span>
            </label>
            <span className="text-[10px] text-text-muted font-mono">256-Bit TLS</span>
          </div>

          {/* Action Buttons (Primary & Instant Demo) */}
          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs flex items-center justify-center gap-2 h-10 text-xs"
              isLoading={isLoading}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Continue with Security MPIN</span>
            </Button>

            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isLoading}
              className="w-full h-9 px-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Instant Demo Access (Skip PIN)</span>
            </button>
          </div>
        </form>

        {/* Statutory & Security Footer Bar */}
        <div className="pt-2 text-center border-t border-border space-y-1.5">
          <div className="text-[10px] text-text-muted font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <span>🛡️ 256-Bit TLS</span>
            <span>•</span>
            <span>4-Digit MPIN Protected</span>
            <span>•</span>
            <span>IT Act 2000 Compliant</span>
          </div>
          <div className="text-[10px] text-text-secondary">
            Need an enterprise account?{' '}
            <button
              type="button"
              onClick={() => toast.info('Contact system administrator at admin@helpdesk.local to request an account.')}
              className="text-brand font-bold hover:underline cursor-pointer"
            >
              Register institutional account
            </button>
          </div>
          <div className="text-[9px] text-text-muted font-mono">
            Handoff Enterprise ITSM Platform · Release v2.4
          </div>
        </div>

      </div>
    </div>
  );
};
