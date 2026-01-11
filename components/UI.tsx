import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg', isLoading?: boolean }> = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] relative overflow-hidden";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-3.5 text-base rounded-2xl"
  };
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 border border-transparent",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md",
    outline: "border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20",
  };

  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`glass-panel rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 ring-1 ring-white/20 dark:ring-white/10 ${className}`} {...props}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full space-y-1.5 group">
    {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">{label}</label>}
    <input 
      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-400 ${className}`} 
      {...props} 
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full space-y-1.5 group">
    {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">{label}</label>}
    <textarea 
      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all placeholder-slate-400 resize-none ${className}`} 
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: string[], direction?: 'top' | 'bottom' }> = ({ label, options, className = '', value, onChange, disabled, direction = 'bottom', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: option },
        currentTarget: { value: option },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const dropdownClasses = direction === 'top' 
    ? 'bottom-full mb-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]' 
    : 'mt-2 shadow-2xl';

  return (
    <div className="w-full space-y-1.5 group" ref={containerRef}>
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">{label}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer text-left flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 ${className}`}
        >
          <span className="truncate block pr-6 font-medium">{value || 'Select...'}</span>
          <ChevronDown size={18} className={`absolute right-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute z-50 w-full ${dropdownClasses} bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto animate-scale-in custom-scrollbar p-1`}>
            {options.map(opt => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === opt ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);