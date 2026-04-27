import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Clock, MoreHorizontal, FileText, CheckCircle2, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/ui/Button';

// Helper Icons
const ChevronLeft = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;
const ChevronDown = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;

const Bills = () => {
    const [orders, setOrders] = useState([]);
    const [selectedBillId, setSelectedBillId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/orders');
            // Sort by latest (although backend likely does this)
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setOrders(sorted);

            // Should auto-select first order if none selected or if selection no longer exists
            if (!selectedBillId && sorted.length > 0) {
                setSelectedBillId(sorted[0].id);
            }
            setIsLoading(false);
        } catch (e) {
            console.error("Failed to fetch orders", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCharge = async () => {
        if (!selectedBillId) return;
        try {
            await axios.put(`/api/orders/${selectedBillId}`, { status: 'completed' });
            // Optimistically update status
            setOrders(prev => prev.map(o => o.id === selectedBillId ? { ...o, status: 'completed' } : o));
            alert("Order charged successfully!");
        } catch (e) {
            console.error("Charge failed", e);
            alert("Failed to update status");
        }
    };

    const selectedBill = orders.find(b => b.id === selectedBillId);

    // Helpers to map backend data to UI
    const getStatusLabel = (status) => status === 'pending' ? 'Active' : (status === 'completed' ? 'Done' : status);
    const getStatusColor = (status) => status === 'pending' ? 'yellow' : 'green';

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-8 overflow-hidden">
            {/* LEFT PANEL: BILLS LIST */}
            <div className="w-96 flex flex-col shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="p-2 rounded-full hover:bg-white"><ChevronLeft size={20} /></Button>
                        <h1 className="text-3xl font-extrabold text-gray-900">Bills</h1>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex gap-2 text-sm font-bold text-gray-500">
                        <span>All orders ({orders.length})</span>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {isLoading ? <p className="text-center text-gray-400">Loading...</p> :
                        orders.length === 0 ? <p className="text-center text-gray-400">No orders found.</p> :
                            orders.map(bill => (
                                <div
                                    key={bill.id}
                                    onClick={() => setSelectedBillId(bill.id)}
                                    className={cn(
                                        "p-5 rounded-[24px] cursor-pointer transition-all duration-300 group",
                                        selectedBillId === bill.id
                                            ? "bg-white shadow-xl shadow-gray-100 scale-[1.02]"
                                            : "bg-transparent hover:bg-white/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-extrabold text-gray-900">Order #{bill.id}</span>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1",
                                                getStatusColor(bill.status) === 'yellow'
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(bill.status) === 'yellow' ? "bg-yellow-500" : "bg-green-500")} />
                                                {getStatusLabel(bill.status)}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-sm font-bold">
                                        <span>Table {bill.table_number || 'N/A'} • {bill.guests} guests</span>
                                        <span>{new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* RIGHT PANEL: BILL DETAILS */}
            <div className="flex-1 bg-white rounded-[40px] shadow-sm p-8 flex flex-col relative overflow-hidden">
                {/* Top Decor */}
                <div className="absolute top-0 right-0 p-8 flex gap-4 text-gray-400">
                    <span className="text-sm font-bold flex items-center gap-2"><Clock size={16} /> Payment history <ChevronDown size={14} /></span>
                    <MoreHorizontal size={20} className="cursor-pointer" />
                </div>

                {selectedBill ? (
                    <>
                        {/* Header */}
                        <div className="mb-8 mt-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-4xl font-extrabold text-gray-900">Order #{selectedBill.id}</h2>
                                <span className={cn("px-6 py-2 rounded-xl font-bold text-sm shadow-lg",
                                    getStatusColor(selectedBill.status) === 'yellow'
                                        ? "bg-[#FFC107] text-gray-900 shadow-yellow-100"
                                        : "bg-green-500 text-white shadow-green-200")}>
                                    {getStatusLabel(selectedBill.status)}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-4 gap-8 mb-8">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Table</p>
                                    <p className="text-xl font-extrabold text-gray-900">{selectedBill.table_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Guests</p>
                                    <p className="text-xl font-extrabold text-gray-900">{selectedBill.guests}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Customer</p>
                                    <p className="text-xl font-extrabold text-gray-900 truncate pr-2">{selectedBill.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Payment</p>
                                    <p className="text-xl font-extrabold text-gray-900 capitalize">{selectedBill.payment_method}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                            <p className="text-gray-400 font-bold mb-4 text-sm">Order info</p>

                            {selectedBill.items && selectedBill.items.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedBill.items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-2xl transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                    🍽️
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.quantity}x {item.menu_item?.name || 'Item'}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-300 font-bold bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                    No items found for this order.
                                </div>
                            )}
                        </div>

                        {/* Footer Totals */}
                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 font-bold">Total</span>
                                <span className="text-3xl font-extrabold text-gray-900">${parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                            </div>

                            {selectedBill.status === 'pending' ? (
                                <Button
                                    onClick={handleCharge}
                                    className="w-full py-4 rounded-[20px] bg-[#FFC107] text-gray-900 font-bold text-lg shadow-xl shadow-yellow-200 hover:scale-[1.01] hover:shadow-yellow-300 transition-all"
                                >
                                    Charge customer ${parseFloat(selectedBill.total_amount).toFixed(2)}
                                </Button>
                            ) : (
                                <div className="w-full py-4 rounded-[20px] bg-green-100 text-green-700 font-bold text-lg text-center shadow-none flex items-center justify-center gap-2">
                                    <CheckCircle2 size={24} />
                                    Payment Completed
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                        {orders.length === 0 ? "No orders yet" : "Select an order to view details"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bills;
