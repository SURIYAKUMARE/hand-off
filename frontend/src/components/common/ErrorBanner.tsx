import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = 'Cannot reach server. Please check connection and retry.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between p-3.5 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-xs text-[#B42318] ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#D92D20] flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-[#FDA29B] bg-white text-[#B42318] hover:bg-[#FEF3F2]"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
