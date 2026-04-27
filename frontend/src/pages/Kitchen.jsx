import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Clock, ChefHat, CheckCircle, Flame, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

const Kitchen = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update timer every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            // Fetch all active orders (not completed)
            // You might want to filter this on the backend, for now let's just get everything and filter locally or ask backend for specific statuses
            const { data } = await axios.get('/api/orders');
            // Filter out completed/cancelled for the active board
            const activeOrders = data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
            setOrders(activeOrders);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    }, []);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchOrders();
        const poller = setInterval(fetchOrders, 5000); // Poll every 5s
        return () => clearInterval(poller);
    }, [fetchOrders]);

    const getElapsedTime = (createdAt) => {
        const startTime = new Date(createdAt);
        const diff = Math.floor((currentTime - startTime) / 60000); // Minutes
        return diff;
    };

    const getTimerColor = (minutes) => {
        if (minutes < 10) return 'text-green-500 bg-green-50';
        if (minutes < 20) return 'text-orange-500 bg-orange-50';
        return 'text-red-500 bg-red-50 animate-pulse';
    };

    const updateStatus = async (orderId, currentStatus) => {
        let newStatus = '';
        if (currentStatus === 'pending') newStatus = 'preparing';
        else if (currentStatus === 'preparing') newStatus = 'ready';
        else if (currentStatus === 'ready') newStatus = 'completed';

        // Optimistic Update
        setOrders(prev => {
            if (newStatus === 'completed') {
                return prev.filter(o => o.id !== orderId);
            }
            return prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        });

        try {
            await axios.put(`/api/orders/${orderId}`, { status: newStatus });
            // Optionally refetch to ensure sync
            fetchOrders();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update order status");
            fetchOrders(); // Revert
        }
    };

    const OrderTicket = ({ order }) => {
        const elapsed = getElapsedTime(order.created_at);

        return (
            <Card className="flex flex-col p-0 overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all shadow-sm">
                {/* Ticket Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-400">Order #{order.id}</span>
                            <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-md uppercase">{order.table_number || order.order_type}</span>
                        </div>
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold", getTimerColor(elapsed))}>
                            <Clock size={12} strokeWidth={3} />
                            {elapsed} min ago
                        </div>
                    </div>
                    {/* Status Icon */}
                    {order.status === 'pending' && <AlertCircle className="text-gray-300" />}
                    {order.status === 'preparing' && <Flame className="text-orange-500 animate-pulse" />}
                    {order.status === 'ready' && <CheckCircle className="text-green-500" />}
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 space-y-4">
                    {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[#FFC107]/20 text-gray-900 font-extrabold rounded-lg text-lg">
                                {item.quantity}
                            </span>
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.menu_item?.name || 'Unknown Item'}</h4>
                                {/* Notes would go here if we had them in backend */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <Button
                        onClick={() => updateStatus(order.id, order.status)}
                        className={cn(
                            "w-full font-extrabold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2",
                            order.status === 'pending' ? "bg-gray-900 text-white hover:bg-gray-800" :
                                order.status === 'preparing' ? "bg-[#FFC107] text-gray-900 hover:bg-[#FFA000]" :
                                    "bg-green-500 text-white hover:bg-green-600"
                        )}
                    >
                        {order.status === 'pending' && <>Start Cooking <Flame size={18} /></>}
                        {order.status === 'preparing' && <>Mark Ready <CheckCircle size={18} /></>}
                        {order.status === 'ready' && <>Serve / Complete <ChevronRight size={18} /></>}
                    </Button>
                </div>
            </Card>
        );
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const prepOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    return (
        <div className="h-full flex flex-col w-full pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <ChefHat size={32} className="text-[#FFC107]" />
                        Kitchen Display
                    </h1>
                    <p className="text-gray-400 font-bold mt-1">
                        Live Feed • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Pending</span>
                        <span className="text-2xl font-extrabold text-gray-900">{pendingOrders.length}</span>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Cooking</span>
                        <span className="text-2xl font-extrabold text-[#FFC107]">{prepOrders.length}</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">

                {/* Column 1: PENDING */}
                <div className="flex flex-col h-full bg-gray-100/50 rounded-[32px] p-4 border border-gray-200/50">
                    <h2 className="text-xl font-extrabold text-gray-600 mb-4 px-2 flex items-center gap-2">
                        <AlertCircle size={20} /> New Orders
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {isLoading ? <p className="text-center text-gray-400">Loading...</p> : pendingOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                        {!isLoading && pendingOrders.length === 0 && (
                            <div className="h-32 flex items-center justify-center text-gray-400 font-bold opacity-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                No pending orders
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: PREPARING */}
                <div className="flex flex-col h-full bg-white rounded-[32px] p-4 shadow-xl shadow-gray-100 border border-gray-100">
                    <h2 className="text-xl font-extrabold text-[#FFC107] mb-4 px-2 flex items-center gap-2">
                        <Flame size={20} /> Cooking
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {prepOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                        {!isLoading && prepOrders.length === 0 && (
                            <div className="h-32 flex items-center justify-center text-gray-300 font-bold opacity-50 border-2 border-dashed border-gray-100 rounded-2xl">
                                Chef is waiting...
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: READY */}
                <div className="flex flex-col h-full bg-green-50/50 rounded-[32px] p-4 border border-green-100">
                    <h2 className="text-xl font-extrabold text-green-600 mb-4 px-2 flex items-center gap-2">
                        <CheckCircle size={20} /> Ready to Serve
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                        {readyOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Kitchen;
