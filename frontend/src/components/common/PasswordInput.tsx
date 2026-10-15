import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextInput, TextInputProps } from './TextInput';

export interface PasswordInputProps extends Omit<TextInputProps, 'type' | 'rightIcon'> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
