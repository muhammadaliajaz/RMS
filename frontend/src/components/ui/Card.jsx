import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                "clean-card",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
