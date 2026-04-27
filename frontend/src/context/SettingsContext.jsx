import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    // Default safe values to prevent crashes
    const [settings, setSettings] = useState({
        payment_method_cash: '1',
        payment_method_card: '1'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings');
            const flat = {};
            Object.values(data).flat().forEach(s => {
                flat[s.key] = s.value;
            });
            setSettings(prev => ({
                ...prev,
                ...flat
            }));

            // Apply Theme Immediately
            applyTheme(flat.theme);
        } catch (e) {
            console.error("Failed to fetch settings", e);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (theme) => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    const updateSetting = (key, value) => {
        // Optimistic UI update
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            if (key === 'theme') applyTheme(value);
            return newSettings;
        });
    };

    const saveSettingsGroup = async (group, keys) => {
        const payload = {
            settings: keys.map(k => ({
                key: k,
                value: settings[k] ?? null,
                group: group
            }))
        };

        try {
            await axios.post('/api/settings', payload);
            return true;
        } catch (e) {
            console.error("Save failed", e);
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, saveSettingsGroup, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
