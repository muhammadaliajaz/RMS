import React from 'react';
import { cn } from '../../utils/cn';

const Toggle = ({ label, checked, onChange, description }) => (
    <div className="flex justify-between items-center py-4">
        <div className="flex flex-col">
            <span className="text-gray-900 dark:text-white font-bold">{label}</span>
            {description && <p className="text-xs text-gray-400 mt-1 font-medium">{description}</p>}
        </div>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50",
                checked ? "bg-[#FFC107]" : "bg-gray-200 dark:bg-gray-600"
            )}
        >
            <span
                className={cn(
                    "block w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-300",
                    checked ? "left-[26px]" : "left-0.5"
                )}
            />
        </button>
    </div>
);

export default Toggle;
