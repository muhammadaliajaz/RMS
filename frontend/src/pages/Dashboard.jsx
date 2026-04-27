import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Users, Search, Bell, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { cn } from '../utils/cn';

const Dashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders_count: 0,
        top_selling: [],
        low_stock: [],
        recent_orders: [],
        period: 'today'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('today');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`/api/dashboard-stats?period=${activeTab}`);
                setStats(data);
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [activeTab]);

    const tabs = [
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <header className="flex justify-between items-center pt-2">
                <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight">Dashboard</h1>
                <div className="flex text-sm font-bold text-gray-400 gap-8 border-b border-gray-100 pb-px">
                    {tabs.map((tab) => (
                        <span
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "pb-3 cursor-pointer transition-all",
                                activeTab === tab.id
                                    ? "text-[#111827] border-b-[3px] border-[#FFC107]"
                                    : "hover:text-gray-600"
                            )}
                        >
                            {tab.label}
                        </span>
                    ))}
                </div>
            </header>

            {isLoading ? <p className="text-gray-400">Loading Dashboard...</p> : (
                /* Layout Grid */
                <div className="grid grid-cols-12 gap-8">

                    {/* 1. Daily Sales Chart (Span 6) */}
                    <div className="col-span-12 lg:col-span-6">
                        <Card className="h-full p-8 rounded-[32px] shadow-smart border-none bg-white col-span-12 lg:col-span-6">
                            <div className="flex justify-between items-start mb-10">
                                <h3 className="font-bold text-xl text-[#111827]">Sales Overview</h3>
                            </div>

                            <div className="h-64 relative w-full">
                                {/* Static Chart for now */}
                                <div className="absolute top-[8%] left-[42%] flex flex-col items-center z-10 transform -translate-x-1/2">
                                    <div className="bg-[#FFC107] text-[#111827] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mb-1">
                                        {stats.orders_count}
                                    </div>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-[#FFC107] border-r-[6px] border-r-transparent"></div>
                                </div>

                                <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.08} />
                                            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="#F3F4F6" strokeDasharray="6 6" strokeWidth="2" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#F3F4F6" strokeDasharray="6 6" strokeWidth="2" />
                                    <line x1="0" y1="150" x2="400" y2="150" stroke="#F3F4F6" strokeDasharray="6 6" strokeWidth="2" />

                                    <path
                                        d="M0,180 C30,160 50,140 80,140 C110,140 130,120 150,110 C170,100 180,60 200,60 C220,60 230,130 250,140 C280,150 300,100 330,110 C360,120 400,140 400,140"
                                        fill="none"
                                        stroke="#EF4444"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M0,180 C30,160 50,140 80,140 C110,140 130,120 150,110 C170,100 180,60 200,60 C220,60 230,130 250,140 C280,150 300,100 330,110 C360,120 400,140 400,140 V200 H0 Z"
                                        fill="url(#chartGradient)"
                                    />
                                    <circle cx="200" cy="60" r="5" fill="#EF4444" stroke="white" strokeWidth="3" className="shadow-lg" />
                                </svg>
                            </div>
                        </Card>
                    </div>

                    {/* 2. Total Income (Span 3) */}
                    <div className="col-span-12 lg:col-span-3">
                        <Card className="h-full p-8 rounded-[32px] shadow-smart border-none bg-white flex flex-col items-center justify-between">
                            <div className="w-full flex justify-between items-center">
                                <h3 className="font-bold text-xl text-[#111827]">Total income</h3>
                                <button className="text-[10px] font-bold bg-white text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors capitalize">{activeTab} ▼</button>
                            </div>

                            <div className="relative w-52 h-52 my-4">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" stroke="#F9FAFB" strokeWidth="8" fill="none" />
                                    <circle cx="50" cy="50" r="40" stroke="#D32F2F" strokeWidth="8" fill="none" strokeDasharray="138 251" strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="40" stroke="#111827" strokeWidth="8" fill="none" strokeDasharray="38 251" strokeDashoffset="-145" strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="40" stroke="#FFC107" strokeWidth="8" fill="none" strokeDasharray="63 251" strokeDashoffset="-190" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-[#111827] tracking-tight">${parseFloat(stats.revenue || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#D32F2F]"></span>
                                    <span className="text-xs font-bold text-gray-600">Food</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#FFC107]"></span>
                                    <span className="text-xs font-bold text-gray-600">Drinks</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#111827]"></span>
                                    <span className="text-xs font-bold text-gray-600">Others</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 3. Right Stats Column (Span 3) */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
                        {/* Total Orders */}
                        <Card className="flex-1 p-6 rounded-[32px] shadow-smart border-none bg-white flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                    <ShoppingBag size={20} className="absolute" strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-xs text-gray-500 mb-1">Total Orders</h3>
                                    <span className="text-[10px] font-extrabold text-green-500 capitalize">{activeTab}</span>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <h2 className="text-3xl font-extrabold text-[#111827]">{stats.orders_count}</h2>
                            </div>
                        </Card>

                        {/* Low Stock (Independent of date, always alert) */}
                        <Card className="flex-1 p-6 rounded-[32px] shadow-smart border-none bg-white flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-[#FFC107]/10 rounded-xl flex items-center justify-center text-[#FFC107]">
                                    <Users size={20} className="absolute" strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-xs text-gray-500 mb-1">Low Stock Items</h3>
                                    <span className="text-[10px] font-extrabold text-red-500">Alert</span>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <h2 className="text-3xl font-extrabold text-[#111827]">{stats.low_stock.length}</h2>
                            </div>
                            <div className="absolute bottom-4 right-6 w-12 h-1 bg-[#FFC107] rounded-full"></div>
                        </Card>
                    </div>

                    {/* 4. Bottom Row: Trending Dishes (Span 5) */}
                    <div className="col-span-12 lg:col-span-5">
                        <Card className="h-full p-8 rounded-[32px] shadow-smart border-none bg-white block">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-[#111827]">Trending dishes</h3>
                                <button className="text-[10px] font-bold bg-white text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors capitalize">{activeTab} ▼</button>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 font-bold mb-4 px-2">
                                <span>Dishes</span>
                                <span>Orders</span>
                            </div>
                            <div className="space-y-4">
                                {stats.top_selling.length > 0 ? stats.top_selling.map((dish, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm ring-2 ring-white flex items-center justify-center bg-gray-50">
                                                <span className="text-xl">🍔</span>
                                            </div>
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold mb-1 bg-[#FFC107]/20 text-orange-700`}>
                                                    Top #{i + 1}
                                                </span>
                                                <h4 className="font-bold text-[#111827] text-sm">{dish.menu_item?.name || 'Unknown'}</h4>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#111827] text-sm">{dish.total_sold}</span>
                                    </div>
                                )) : <p className="text-gray-400 font-bold text-center py-4">No sales data for this period.</p>}
                            </div>
                        </Card>
                    </div>

                    {/* 5. Bottom Row: Recent Orders (Filtered) */}
                    <div className="col-span-12 lg:col-span-7">
                        <Card className="h-full p-8 rounded-[32px] shadow-smart border-none bg-white block">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-[#111827]">Orders ({activeTab})</h3>
                                <button className="text-[10px] font-bold bg-white text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">See All</button>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 font-bold mb-4 px-2 border-b border-gray-50 pb-2">
                                <span>Customer</span>
                                <span>Total</span>
                            </div>
                            <div className="space-y-1">
                                {stats.recent_orders.length > 0 ? stats.recent_orders.map((order, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F9FAFB] rounded-2xl transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                {order.customer_name ? order.customer_name[0] : 'G'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#111827] text-sm">{order.customer_name}</h4>
                                                <p className="text-xs text-gray-400 font-bold">Table {order.table_number || 'Takeout'}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#111827] text-sm">${parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                )) : <p className="text-gray-400 font-bold text-center py-4">No orders for this period.</p>}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Dashboard;
