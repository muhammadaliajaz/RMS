import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-medium text-gray-400 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors duration-300">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-dark-bg/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 focus:bg-dark-bg",
                        "transition-all duration-300",
                        "hover:border-white/20",
                        Icon && "pl-10",
                        error && "border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50 bg-red-500/5",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-400 ml-1 animate-fade-in">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
