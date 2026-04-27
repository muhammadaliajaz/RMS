import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useSearch } from '../context/SearchContext';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, ChevronLeft, Minus, Plus, Info, Trash2, ShoppingBag, CreditCard, Utensils, Bike } from 'lucide-react';
import { cn } from '../utils/cn';

const POS = () => {
    // State
    const [categories, setCategories] = useState([{ id: 'all', name: 'All Menu', emoji: '🍽️' }]);
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { searchQuery } = useSearch();
    const { settings } = useSettings();

    // Order Details State
    const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway, delivery
    const [selectedTable, setSelectedTable] = useState('T-01');
    const [guests, setGuests] = useState(2);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Tables Mock
    const tables = Array.from({ length: 10 }, (_, i) => `T-${String(i + 1).padStart(2, '0')}`);

    const orderNumber = useMemo(() => Math.floor(Math.random() * 1000), [cart.length === 0]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, itemsRes] = await Promise.all([
                    axios.get('/api/categories'),
                    axios.get('/api/menu-items')
                ]);

                // Format Categories
                const formattedCats = [
                    { id: 'all', name: 'All Menu', emoji: '🍽️' },
                    ...catsRes.data.map(c => ({
                        id: c.id,
                        name: c.name,
                        emoji: '🍴'
                    }))
                ];
                setCategories(formattedCats);

                // Format Products
                const formattedItems = itemsRes.data.map(i => ({
                    id: i.id,
                    category_id: i.category_id,
                    name: i.name,
                    weight: 'Standard',
                    price: parseFloat(i.price),
                    image: i.image ? `http://localhost:8000/storage/${i.image}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
                    description: i.description
                }));
                setProducts(formattedItems);
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to fetch menu data", e);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        let items = products;
        if (activeCategory !== 'all') {
            items = items.filter(p => p.category_id === activeCategory);
        }
        if (searchQuery) {
            items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeCategory, products, searchQuery]);

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            await axios.post('/api/orders', {
                items: cart.map(item => ({
                    menu_item_id: item.id,
                    quantity: item.qty
                })),
                payment_method: paymentMethod,
                guests: orderType === 'dine_in' ? guests : 0,
                table_number: orderType === 'dine_in' ? selectedTable : null,
                customer_name: customerName || 'Walk-in',
                order_type: orderType
            });

            alert('Order Placed Successfully!');
            setCart([]);
            setCustomerName('');
            setGuests(2);
            setSelectedTable('T-01');
        } catch (e) {
            console.error("Checkout failed", e);
            alert(`Checkout Failed: ${e.response?.data?.message || e.message}`);
        }
    };

    return (
        <div className="h-full flex gap-6 pb-4">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Menu</h1>
                    {/* Search - Usage is now via global header, hiding local search */}
                </div>

                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar shrink-0 mb-4">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300",
                                activeCategory === cat.id
                                    ? "bg-[#FFC107] text-gray-900 shadow-lg shadow-yellow-100 scale-105"
                                    : "bg-white text-gray-500 hover:bg-gray-50 shadow-sm"
                            )}
                        >
                            <span className="text-lg">{cat.emoji}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? <p className="text-gray-400 text-center font-bold">Loading Menu...</p> :
                        filteredProducts.length === 0 ? <p className="text-gray-400 text-center font-bold">No items found in this category.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="flex flex-col items-center p-6 cursor-pointer hover:shadow-xl transition-all duration-300 bg-white border-transparent rounded-[32px] group hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <Plus size={16} />
                                        </div>
                                        <div className="w-32 h-32 rounded-full mb-4 relative z-0">
                                            <div className="absolute inset-0 bg-[#FFC107] blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full transform scale-150"></div>
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-full shadow-md z-10 relative transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 text-center leading-tight min-h-[1.5em]">{product.name}</h3>
                                        <span className="text-[#FFC107] font-extrabold text-xl tracking-tight">${product.price.toFixed(2)}</span>
                                    </Card>
                                ))}
                            </div>
                        )}
                </div>
            </div>

            {/* RIGHT: Cart Sidebar */}
            <div className="w-96 bg-white rounded-[40px] shadow-sm flex flex-col shrink-0 overflow-hidden">
                {/* Order Type Toggle */}
                <div className="p-6 pb-0">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                        <button
                            onClick={() => setOrderType('dine_in')}
                            className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all", orderType === 'dine_in' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                        >
                            <Utensils size={18} /> Dine In
                        </button>
                        <button
                            onClick={() => setOrderType('takeaway')}
                            className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all", orderType === 'takeaway' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                        >
                            <ShoppingBag size={18} /> Takeaway
                        </button>
                        <button
                            onClick={() => setOrderType('delivery')}
                            className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all", orderType === 'delivery' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                        >
                            <Bike size={18} /> Delivery
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-extrabold text-gray-900">Current Order</h2>
                        <span className="bg-[#FFC107]/20 text-orange-700 font-bold px-3 py-1 rounded-full text-xs">#{orderNumber}</span>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                            <ShoppingBag size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">Cart is empty</p>
                            <p className="text-xs">Tap items to add</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center group">
                                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm">{item.name}</h4>
                                    <p className="text-[#FFC107] font-bold text-xs">${(item.price * item.qty).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-red-500"><Minus size={12} /></button>
                                    <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-green-500"><Plus size={12} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Checkout Section & Options */}
                <div className="p-6 border-t border-gray-100 bg-[#FAFAFB]">

                    {/* Dine In Specific Options */}
                    {orderType === 'dine_in' && (
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Table</label>
                            <div className="grid grid-cols-5 gap-2">
                                {tables.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTable(t)}
                                        className={cn(
                                            "py-2 rounded-lg text-xs font-bold transition-all",
                                            selectedTable === t
                                                ? "bg-gray-900 text-white shadow-lg"
                                                : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                                        )}
                                    >
                                        {t.replace('T-', '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Common Options Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {orderType === 'dine_in' && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guests</label>
                                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100">
                                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center"><Minus size={12} /></button>
                                    <span className="font-bold text-sm">{guests}</span>
                                    <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center"><Plus size={12} /></button>
                                </div>
                            </div>
                        )}
                        <div className={cn(orderType !== 'dine_in' ? "col-span-2" : "")}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Customer</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Name"
                                className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-[#FFC107]/50 focus:border-[#FFC107] outline-none"
                            />
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-6">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Payment Method</label>
                        <div className="flex gap-2">
                            {settings?.payment_method_cash !== '0' && (
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                                        paymentMethod === 'cash'
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                                    )}
                                >
                                    <span>💵</span> Cash
                                </button>
                            )}
                            {settings?.payment_method_card !== '0' && (
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                                        paymentMethod === 'card'
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                                    )}
                                >
                                    <CreditCard size={16} /> Card
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-900 text-xl font-extrabold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-[#FFC107] hover:bg-[#FFA000] text-gray-900 font-extrabold rounded-2xl shadow-lg shadow-yellow-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Place Order
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default POS;
