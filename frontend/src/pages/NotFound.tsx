import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user?.role === 'TECHNICIAN') {
      navigate('/technician/dashboard');
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/employee/tickets');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-surface border border-border rounded-lg p-8">
        <div className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center text-text-muted mx-auto mb-4">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          The page you're looking for doesn't exist or has been relocated.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={handleGoHome}
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  );
};
