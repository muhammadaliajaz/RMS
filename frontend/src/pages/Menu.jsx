import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, ChevronLeft, Plus, Edit2, Trash2, Clock, ChefHat, Flame, X, Check, DollarSign, Percent, Tag, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils/cn';

const Menu = () => {
    // State
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        description: '',
        image: null,
        imagePreview: null,
        weight: 'Standard',
        discount_value: 0,
        discount_reason: '',
        discount_active: false,
        selected_ingredients: [] // Array of { id, quantity }
    });

    // Fetch Data
    const fetchData = async () => {
        try {
            const [catsRes, itemsRes, ingRes] = await Promise.all([
                axios.get('/api/categories'),
                axios.get('/api/menu-items'),
                axios.get('/api/ingredients')
            ]);

            const formattedCats = [
                { id: 'all', name: 'All Menu', emoji: '🍽️' },
                ...catsRes.data.map(c => ({
                    id: c.id,
                    name: c.name,
                    emoji: '🍴'
                }))
            ];
            setCategories(formattedCats);
            setItems(itemsRes.data);
            setAvailableIngredients(ingRes.data);
            setIsLoading(false);
        } catch (e) {
            console.error("Failed to fetch menu data", e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            (activeCategory === 'all' || item.category_id === activeCategory) &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, activeCategory, searchTerm]);

    // Handlers
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            category_id: categories.length > 1 ? categories[1].id : '',
            price: '',
            description: '',
            image: null,
            imagePreview: null,
            weight: 'Standard',
            discount_value: 0,
            discount_reason: '',
            discount_active: false,
            selected_ingredients: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        // Map ingredients to { id, quantity }
        const ingredients = item.ingredients ? item.ingredients.map(i => ({
            id: i.id,
            quantity: i.pivot.quantity // Get quantity from pivot
        })) : [];
        const imageUrl = item.image ? `http://localhost:8000/storage/${item.image}` : null;

        setFormData({
            name: item.name,
            category_id: item.category_id,
            price: item.price,
            description: item.description || '',
            image: item.image,
            imagePreview: imageUrl,
            weight: 'Standard',
            discount_value: item.discount_value || 0,
            discount_reason: item.discount_reason || '',
            discount_active: Boolean(item.is_discount_active),
            selected_ingredients: ingredients
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this dish?')) {
            try {
                await axios.delete(`/api/menu-items/${id}`);
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                alert("Failed to delete item");
            }
        }
    };

    const toggleIngredient = (id) => {
        setFormData(prev => {
            const current = [...prev.selected_ingredients];
            const index = current.findIndex(i => i.id === id);

            if (index >= 0) {
                // Remove
                current.splice(index, 1);
                return { ...prev, selected_ingredients: current };
            } else {
                // Add with default quantity 1
                return { ...prev, selected_ingredients: [...current, { id, quantity: 1 }] };
            }
        });
    };

    const updateIngredientQuantity = (id, newQty) => {
        setFormData(prev => {
            const current = prev.selected_ingredients.map(i => {
                if (i.id === id) {
                    return { ...i, quantity: newQty };
                }
                return i;
            });
            return { ...prev, selected_ingredients: current };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category_id', formData.category_id);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('discount_value', formData.discount_value);
        data.append('discount_reason', formData.discount_reason);
        data.append('is_discount_active', formData.discount_active ? '1' : '0');

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        // Handle Ingredients Array for FormData
        formData.selected_ingredients.forEach((ing, index) => {
            data.append(`ingredients[${index}][id]`, ing.id);
            data.append(`ingredients[${index}][quantity]`, ing.quantity);
        });

        try {
            if (editingItem) {
                data.append('_method', 'PUT');
                await axios.post(`/api/menu-items/${editingItem.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/api/menu-items', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Save failed", error);
            alert(`Failed to save item: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    // Helper calculate discounted price
    const getFinalPrice = (price, discountValue, isActive) => {
        if (!isActive) return price;
        return price * (1 - discountValue / 100);
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
                        <span className="text-gray-900 font-extrabold">Menu Management</span>
                    </div>
                </div>

                <Button onClick={handleAddNew} className="bg-[#FFC107] text-gray-900 font-bold hover:bg-[#FFA000] shadow-md hover:shadow-lg transition-all rounded-xl px-6">
                    <Plus size={18} className="mr-2" strokeWidth={3} />
                    Add New Dish
                </Button>
            </div>

            {/* Controls */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Menu Items</h1>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search items..."
                            className="pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50 shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>
                {/* Categories */}
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

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {isLoading ? <p>Loading menu...</p> : filteredItems.map((item) => {
                    const isDiscountActive = Boolean(item.is_discount_active);
                    const finalPrice = getFinalPrice(parseFloat(item.price), parseFloat(item.discount_value), isDiscountActive);

                    return (
                        <Card
                            key={item.id}
                            onClick={() => handleEdit(item)}
                            className="flex flex-col p-0 overflow-hidden bg-white border-transparent rounded-[32px] hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
                        >
                            {isDiscountActive && (
                                <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                                    {Math.round(item.discount_value)}% OFF
                                </div>
                            )}

                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={item.image ? `http://localhost:8000/storage/${item.image}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#FFC107] transition-colors">{item.name}</h3>
                                    <div className="flex flex-col items-end">
                                        {isDiscountActive ? (
                                            <>
                                                <span className="text-gray-400 text-xs font-bold line-through decoration-red-500/50">${parseFloat(item.price).toFixed(2)}</span>
                                                <span className="text-red-500 font-extrabold text-lg">${finalPrice.toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span className="text-[#FFC107] font-extrabold text-lg">${parseFloat(item.price).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs font-bold mb-4 line-clamp-2">{item.description}</p>

                                {isDiscountActive && item.discount_reason && (
                                    <div className="mt-auto pt-2">
                                        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                            <Tag size={10} /> {item.discount_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 max-h-[90vh]">
                        {/* Left: Image (Preview) */}
                        <div className="hidden md:block w-2/5 relative h-full bg-gray-100 group">
                            <img
                                src={formData.imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold">
                                <ImageIcon size={32} className="mb-2" />
                                <span>Change Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* Right: Form */}
                        <div className="w-full md:w-3/5 p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-extrabold text-gray-900">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Mobile Image Upload */}
                                <div className="block md:hidden mb-4">
                                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FFC107] text-gray-500">
                                        <div className="flex flex-col items-center">
                                            {formData.imagePreview ? <img src={formData.imagePreview} className="w-20 h-20 rounded-lg object-cover mb-2" /> : <Upload size={24} className="mb-2" />}
                                            <span className="text-xs font-bold">{formData.imagePreview ? 'Change Image' : 'Upload Image'}</span>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>

                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Dish Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                        >
                                            {categories.filter(c => c.id !== 'all').map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFC107] h-20 resize-none"
                                    ></textarea>
                                </div>

                                {/* Ingredients Section */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-gray-900 font-extrabold text-sm mb-3">
                                        <ChefHat size={16} className="text-[#FFC107]" /> Recipe Ingredients
                                    </h3>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                                        {availableIngredients.length > 0 ? availableIngredients.map(ing => {
                                            const isSelected = formData.selected_ingredients.some(i => i.id === ing.id);
                                            const selectedData = formData.selected_ingredients.find(i => i.id === ing.id) || { quantity: 1 };

                                            return (
                                                <div key={ing.id} className={cn("flex items-center justify-between p-3 rounded-xl transition-all", isSelected ? "bg-[#FFC107]/10 border border-[#FFC107]" : "hover:bg-gray-50 border border-transparent")}>
                                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-[#FFC107] checked:bg-[#FFC107]"
                                                                checked={isSelected}
                                                                onChange={() => toggleIngredient(ing.id)}
                                                            />
                                                            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                                                <Check size={12} strokeWidth={4} />
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-sm font-bold text-gray-900">{ing.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold">{ing.stock} {ing.unit} available</span>
                                                        </div>
                                                    </label>

                                                    {isSelected && (
                                                        <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                value={selectedData.quantity}
                                                                onChange={(e) => updateIngredientQuantity(ing.id, e.target.value)}
                                                                className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 text-right text-sm font-bold focus:border-[#FFC107] focus:outline-none"
                                                                placeholder="Qty"
                                                            />
                                                            <span className="text-xs font-bold text-gray-400">{ing.unit}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }) : <p className="text-xs text-gray-400 italic">No ingredients found. Add them in Inventory.</p>}
                                    </div>
                                </div>

                                {/* Discount Section */}
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                            <Tag size={16} className="text-red-400" /> Enable Discount
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.discount_active}
                                                onChange={e => setFormData({ ...formData, discount_active: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                        </label>
                                    </div>

                                    {formData.discount_active && (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Percentage %</label>
                                                <input
                                                    type="number"
                                                    value={formData.discount_value}
                                                    onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                                    className="w-full bg-gray-50 rounded-xl px-4 py-2 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Reason</label>
                                                <input
                                                    type="text"
                                                    value={formData.discount_reason}
                                                    onChange={e => setFormData({ ...formData, discount_reason: e.target.value })}
                                                    placeholder="e.g. Promo"
                                                    className="w-full bg-gray-50 rounded-xl px-4 py-2 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Cancel</Button>
                                    <Button type="submit" className="flex-1 py-4 bg-[#FFC107] text-gray-900 font-bold rounded-xl shadow-lg shadow-yellow-100 hover:bg-[#FFA000]">
                                        {editingItem ? 'Save Changes' : 'Create Dish'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
