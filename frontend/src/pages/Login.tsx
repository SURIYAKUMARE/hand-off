import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { TextInput } from '../components/common/TextInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { LifeBuoy, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (user) {
      const target =
        user.role === 'TECHNICIAN' ? '/technician/dashboard' : '/employee/tickets';
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

      const destination =
        (location.state as any)?.from?.pathname ||
        (authenticatedUser.role === 'TECHNICIAN'
          ? '/technician/dashboard'
          : '/employee/tickets');
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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel: Quiet Neutral Brand Panel */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#101828] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              HelpDesk <span className="text-[#8487F5]">360</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#F7F8FA] leading-tight">
              IT support, organized from request to resolution.
            </h1>
            <p className="text-xs text-[#98A2B3] leading-relaxed max-w-sm">
              An enterprise platform engineered for immediate issue triage, transparent service-level agreements, and rapid resolution tracking.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1D2939] text-[11px] text-[#667085]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8487F5]" />
            <span>Role-enforced security & audit persistence</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Sign-in Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Enter your corporate credentials to access the service desk.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318] animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-[#D92D20] mt-0.5 flex-shrink-0" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Email address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@helpdesk.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand focus:ring-offset-0"
                />
                <span>Remember session</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isLoading}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          {/* Demo Accounts Helper Panel (Local Development) */}
          <div className="pt-4 border-t border-border">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
              Quick demo accounts
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('priya.nair@helpdesk.local')}
                className="flex items-start gap-2 p-2.5 text-left rounded-lg border border-border bg-surface hover:bg-[#F9FAFB] hover:border-brand/40 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-text-primary">Priya Nair</div>
                  <div className="text-[10px] text-text-muted">Employee (Requester)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('arjun.mehta@helpdesk.local')}
                className="flex items-start gap-2 p-2.5 text-left rounded-lg border border-border bg-surface hover:bg-[#F9FAFB] hover:border-brand/40 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-[#F79009] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-text-primary">Arjun Mehta</div>
                  <div className="text-[10px] text-text-muted">IT Technician</div>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-2 text-center">
              Password pre-fills with verified development seed password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
