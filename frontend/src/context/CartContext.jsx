import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQty = (itemId, delta) => {
        setCartItems(prev => {
            return prev.map(i => {
                if (i.id === itemId) {
                    const newQty = Math.max(0, i.qty + delta);
                    return { ...i, qty: newQty };
                }
                return i;
            }).filter(i => i.qty > 0);
        });
    };

    const clearCart = () => setCartItems([]);

    const total = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
    }, [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
