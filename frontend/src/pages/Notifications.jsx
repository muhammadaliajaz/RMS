import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, Info, CheckCircle, Package, Flame, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get('/api/notifications');
                setAlerts(data.alerts);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
                setIsLoading(false);
            }
        };

        fetchNotifications();
        // Poll every 10s
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'low_stock': return <AlertTriangle className="text-red-500" size={24} />;
            case 'new_orders': return <Flame className="text-orange-500" size={24} />;
            case 'ready_orders': return <CheckCircle className="text-green-500" size={24} />;
            default: return <Bell className="text-gray-500" size={24} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'low_stock': return 'bg-red-50 border-red-100';
            case 'new_orders': return 'bg-orange-50 border-orange-100';
            case 'ready_orders': return 'bg-green-50 border-green-100';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <div className="h-full flex flex-col w-full max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <Bell size={32} className="text-[#FFC107]" />
                    Notifications
                </h1>
                <p className="text-gray-400 font-bold mt-1">System Alerts & Updates</p>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <p className="text-gray-400">Loading alerts...</p>
                ) : alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-4 p-5 rounded-2xl border-2 transition-all hover:shadow-md animate-in slide-in-from-bottom-2 fade-in",
                                getBgColor(alert.type)
                            )}
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                {getIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-extrabold text-gray-900 text-lg mb-1">{alert.title}</h3>
                                <p className="text-gray-600 font-medium mb-3">{alert.message}</p>
                                <Link
                                    to={alert.link}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    Take Action <ArrowRight size={14} />
                                </Link>
                            </div>
                            {alert.urgent && (
                                <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide animate-pulse">
                                    Urgent
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-400 font-medium max-w-xs">There are no active alerts or notifications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
