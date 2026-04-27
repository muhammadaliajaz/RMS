import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Bell, Clock } from 'lucide-react';
import axios from 'axios';
import { useSearch } from '../context/SearchContext';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { searchQuery, setSearchQuery } = useSearch();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get current page name from path
    const getPageTitle = () => {
        const path = location.pathname.substring(1);
        if (!path) return 'Dashboard';
        return path.split('/').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/notifications');
            setNotificationCount(data.count);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex bg-[#FAFAFB] min-h-screen text-[#2D2D2D] font-sans selection:bg-[#FFC107] selection:text-black">
            <Sidebar notificationCount={notificationCount} />
            <main className="flex-1 ml-72 p-8 transition-all duration-300">
                {/* Top Header Bar */}
                <header className="flex justify-between items-center mb-10 pl-2">
                    <div className="flex items-center gap-6">
                        {/* Back Arrow */}
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow active:scale-95"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-3 text-sm font-bold">
                            <span className="text-gray-400">Back Office</span>
                            <span className="text-gray-300">{'>'}</span>
                            <span className="text-gray-900 capitalized">{getPageTitle()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bubble */}
                        <Link to="/notifications" className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <Bell size={24} className="text-gray-900" strokeWidth={2} />
                            {notificationCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FFC107] text-[10px] font-bold flex items-center justify-center rounded-full leading-none">
                                    {notificationCount}
                                </span>
                            )}
                        </Link>

                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100">
                            <Clock size={20} className="text-[#FFC107]" strokeWidth={2.5} />
                            <span className="text-sm font-bold text-gray-700 min-w-[65px] text-center">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search here..."
                                className="pl-12 pr-6 py-3.5 bg-white rounded-[20px] text-sm font-medium w-64 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50 shadow-sm transition-all group-hover:shadow-md"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FFC107] transition-colors" size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
