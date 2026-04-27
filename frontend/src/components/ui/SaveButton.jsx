import React from 'react';
import Button from './Button';

const SaveButton = ({ onClick, children = "Save Changes", className }) => (
    <Button
        onClick={onClick}
        className={`w-full py-4 bg-[#FFC107] text-gray-900 font-extrabold rounded-2xl hover:bg-[#FFA000] shadow-lg shadow-yellow-100 transition-all mt-8 ${className}`}
    >
        {children}
    </Button>
);

export default SaveButton;
