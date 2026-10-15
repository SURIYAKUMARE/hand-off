import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role === 'TECHNICIAN') {
      navigate('/technician/dashboard');
    } else {
      navigate('/employee/tickets');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-surface border border-border rounded-lg p-8">
        <div className="w-12 h-12 rounded-full bg-[#FEF3F2] flex items-center justify-center text-[#D92D20] mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight mb-2">
          Not allowed
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          You don't have permission to view this page or perform this action.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={handleBack}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Go back
        </Button>
      </div>
    </div>
  );
};
