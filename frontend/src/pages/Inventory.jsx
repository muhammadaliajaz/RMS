import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useSearch } from '../context/SearchContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, ChevronLeft, Plus, Edit2, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp, Filter, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const Inventory = () => {
    // Inventory Categories
    const categories = [
        { id: 'all', name: 'All Stock', emoji: '📦' },
        { id: 'produce', name: 'Produce', emoji: '🥬' },
        { id: 'meat', name: 'Meat', emoji: '🥩' },
        { id: 'dairy', name: 'Dairy', emoji: '🧀' },
        { id: 'dry', name: 'Dry Goods', emoji: '🌾' },
        { id: 'drinks', name: 'Drinks', emoji: '🥤' },
    ];

    const [activeCategory, setActiveCategory] = useState('all');
    const { searchQuery } = useSearch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'produce',
        supplier: '',
        stock: 0,
        unit: 'kg',
        min_stock: 5,
        cost: 0
    });

    // Fetch Data
    const fetchInventory = async () => {
        try {
            const { data } = await axios.get('/api/ingredients');
            setInventory(data);
            setIsLoading(false);
        } catch (e) {
            console.error("Failed to fetch inventory", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item =>
            (activeCategory === 'all' || item.category === activeCategory) &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, activeCategory, searchQuery]);

    // Derived Stats
    const lowStockCount = inventory.filter(i => parseFloat(i.stock) <= parseFloat(i.min_stock)).length;
    const totalValue = inventory.reduce((acc, item) => acc + (parseFloat(item.stock) * parseFloat(item.cost)), 0);

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category || 'produce',
            supplier: item.supplier || '',
            stock: item.stock,
            unit: item.unit,
            min_stock: item.min_stock,
            cost: item.cost
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this item from inventory?')) {
            try {
                await axios.delete(`/api/ingredients/${id}`);
                setInventory(inventory.filter(i => i.id !== id));
            } catch (error) {
                alert("Failed to delete item");
            }
        }
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            category: 'produce',
            supplier: '',
            stock: 0,
            unit: 'kg',
            min_stock: 5,
            cost: 0
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            category: formData.category,
            supplier: formData.supplier,
            stock: parseFloat(formData.stock),
            unit: formData.unit,
            min_stock: parseFloat(formData.min_stock),
            cost: parseFloat(formData.cost)
        };

        try {
            if (editingItem) {
                await axios.put(`/api/ingredients/${editingItem.id}`, payload);
            } else {
                await axios.post('/api/ingredients', payload);
            }
            setIsModalOpen(false);
            fetchInventory();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save item.");
        }
    };

    // Helper for Stock Status Color
    const getStockStatus = (stock, min) => {
        const ratio = parseFloat(stock) / parseFloat(min);
        if (ratio < 0.5) return 'bg-red-500'; // Critical
        if (ratio <= 1) return 'bg-orange-500'; // Low
        return 'bg-green-500'; // Good
    };

    const getStockPercentage = (stock, min) => {
        const max = parseFloat(min) * 3 || 10;
        return Math.min(100, (parseFloat(stock) / max) * 100);
    };

    return (
        <div className="h-full flex flex-col relative w-full pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-gray-800">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-gray-400">Back Office</span>
                        <span className="text-gray-300">{'>'}</span>
                        <span className="text-gray-900 font-extrabold">Inventory</span>
                    </div>
                </div>

                <Button onClick={handleAddNew} className="bg-[#FFC107] text-gray-900 font-bold hover:bg-[#FFA000] shadow-md hover:shadow-lg transition-all rounded-xl px-6">
                    <Plus size={18} className="mr-2" strokeWidth={3} />
                    Add Ingredient
                </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{lowStockCount} <span className="text-sm font-medium text-gray-400">Items</span></h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Inventory Value</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Items</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{inventory.length}</h3>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stock Levels</h1>
                    {/* Search is now in header, so removed from here */}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
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
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {isLoading ? <p>Loading inventory...</p> : filteredInventory.map((item) => {
                    const statusColor = getStockStatus(item.stock, item.min_stock);
                    const isLow = parseFloat(item.stock) <= parseFloat(item.min_stock);

                    return (
                        <Card
                            key={item.id}
                            className={cn(
                                "flex flex-col p-5 bg-white border-transparent rounded-[32px] hover:shadow-xl transition-all duration-300 group relative",
                                isLow ? "ring-2 ring-red-100" : ""
                            )}
                        >
                            {/* Warning Badge */}
                            {isLow && (
                                <div className="absolute top-4 right-4 text-red-500 animate-pulse" title="Low Stock">
                                    <AlertTriangle size={20} />
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shadow-inner">
                                    {categories.find(c => c.id === item.category)?.emoji || '📦'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                    <p className="text-gray-400 text-xs font-bold">{item.supplier}</p>
                                </div>
                            </div>

                            {/* Stock Visuals */}
                            <div className="mb-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Level</span>
                                    <div className="text-right">
                                        <span className={cn("text-xl font-extrabold", isLow ? "text-red-500" : "text-gray-900")}>
                                            {item.stock}
                                        </span>
                                        <span className="text-sm font-bold text-gray-400 ml-1">{item.unit}</span>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", statusColor)}
                                        style={{ width: `${getStockPercentage(item.stock, item.min_stock)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400">${parseFloat(item.cost).toFixed(2)} / {item.unit}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#FFC107] transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-lg relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{editingItem ? 'Update Stock' : 'New Ingredient'}</h2>
                        <p className="text-sm text-gray-400 font-medium mb-6">Manage stock details and reorder levels.</p>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Ingredient Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]" autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                    >
                                        {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            step="0.001"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                        />
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 w-12 text-right bg-transparent border-none focus:outline-none"
                                            placeholder="Unit"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase text-red-400">Low Stock Alert</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.001"
                                        value={formData.min_stock}
                                        onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                                        className="w-full bg-red-50 rounded-xl px-4 py-3 font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Cost Per Unit</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            className="w-full bg-gray-50 rounded-xl pl-8 pr-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500">Cancel</Button>
                                <Button type="submit" className="flex-1 py-3.5 bg-[#FFC107] text-gray-900 font-bold rounded-xl shadow-lg shadow-yellow-100 hover:bg-[#FFA000]">Save Stock</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
