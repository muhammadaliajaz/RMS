import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    LayoutGrid,       // Dashboard
    ShoppingCart,     // Point of Sale (Original)
    Utensils,         // Food & Drinks/Menu (Original)
    Package,          // Inventory (Original)
    ChefHat,          // Kitchen (Original)
    MessageSquare,    // Messages (New)
    FileText,         // Bills (New)
    Settings,         // Settings
    Bell,             // Notifications
    Headphones,       // Support
    LogOut
} from 'lucide-react';
import { cn } from '../utils/cn';

const Sidebar = ({ notificationCount = 0 }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();


    // Merged Menu: Original Functionality + New Design Modules
    const mainMenu = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Point of Sale', path: '/pos' },
        { icon: Utensils, label: 'Menu Management', path: '/menu' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: ChefHat, label: 'Kitchen Display', path: '/kitchen' },
        { icon: FileText, label: 'Bills', path: '/bills' },     // Kept from new design
        { icon: MessageSquare, label: 'Messages', path: '/messages' }, // Kept from new design
    ];

    const otherMenu = [
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: notificationCount > 0 ? notificationCount : null },
        { icon: Settings, label: 'Settings', path: '/settings' }, // Moved to Other for balance
        { icon: Headphones, label: 'Support', path: '/support' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col p-6 transition-transform duration-300 border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-8 pl-2">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-sm ring-4 ring-red-50/50">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20V8H4V6Z" />
                        <path d="M4 12H20V14H4V12Z" />
                        <path d="M9 17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17H20V19H15C15 20.6569 13.6569 22 12 22C10.3431 22 9 20.6569 9 19H4V17H9Z" />
                    </svg>
                </div>
                <div>
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight block leading-none">SmartPOS</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 pb-4">
                <div className="space-y-2">
                    <div className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-3 pl-5">Main Menu</div>
                    {mainMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-5 py-3.5 rounded-[18px] text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-[#FFC107] text-gray-900 shadow-md shadow-orange-100"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <item.icon
                                size={20}
                                strokeWidth={2.5}
                                className={cn("transition-transform group-hover:scale-110", ({ isActive }) => isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900")}
                            />
                            <span className="relative z-10">{item.label}</span>
                            {/* Active Indicator Line (Optional detail) */}
                        </NavLink>
                    ))}
                </div>

                <div>
                    <div className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-3 pl-5">Other</div>
                    <div className="space-y-2">
                        {otherMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "flex items-center justify-between px-5 py-3.5 rounded-[18px] text-sm font-bold transition-all duration-300 group",
                                    isActive
                                        ? "bg-[#FFC107] text-gray-900 shadow-md shadow-orange-100"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon size={20} strokeWidth={2.5} className="text-gray-400 group-hover:text-gray-900" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-[#FFC107] text-gray-900 text-[10px] font-extrabold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm leading-none">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* User Profile - Compact */}
            <div className="mt-4 pt-4 border-t border-gray-100 pb-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={handleLogout}>
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{user?.name || 'User'}</h4>
                        <p className="text-gray-400 text-xs font-bold truncate">{user?.email || 'Staff'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <LogOut size={16} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
