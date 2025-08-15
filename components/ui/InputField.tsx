"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";

// Utility function to combine classes
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  isOptional?: boolean;
  onValidate?: (value: string) => string | undefined;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    isOptional = false, 
    onValidate,
    className,
    onBlur,
    ...props 
  }, ref) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState<string>();

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      
      if (onValidate) {
        const validationError = onValidate(e.target.value);
        setLocalError(validationError);
      }
      
      onBlur?.(e);
    };

    const displayError = error || localError;
    const hasError = touched && displayError;

    return (
      <div className="space-y-1">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-eym-dark">
          {label}
          {isOptional && <span className="text-gray-500 ml-1">(opcional)</span>}
        </label>
        
        <input
          ref={ref}
          {...props}
          onBlur={handleBlur}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${props.name}-error` : undefined}
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-colors",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-eym-accent-orange/50 focus:border-eym-accent-orange",
            hasError 
              ? "border-red-300 bg-red-50" 
              : "border-gray-300 hover:border-gray-400",
            className
          )}
        />
        
        {hasError && (
          <p id={`${props.name}-error`} className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {displayError}
          </p>
        )}
        
        {!hasError && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
