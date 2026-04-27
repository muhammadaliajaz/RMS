import React from 'react';

const SectionHeading = ({ children, className }) => (
    <h3 className={`text-lg font-extrabold text-gray-900 dark:text-white mb-4 mt-8 first:mt-0 ${className}`}>
        {children}
    </h3>
);

export default SectionHeading;
