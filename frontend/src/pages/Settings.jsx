import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Bell, AppWindow, CreditCard, Shield, Globe, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import SectionHeading from '../components/ui/SectionHeading';
import SaveButton from '../components/ui/SaveButton';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';


const Settings = () => {
    const [activeTab, setActiveTab] = useState('appearance');
    const { settings, updateSetting, saveSettingsGroup, loading } = useSettings();
    const { logout } = useAuth(); // hook

    const handleSave = async (group) => {
        let keys = [];
        if (group === 'appearance') keys = ['theme', 'font_size', 'card_size'];
        if (group === 'checkout') keys = ['save_payment_history', 'payment_method_card', 'payment_method_cash'];
        if (group === 'language') keys = ['region', 'language', 'predictive_text'];
        if (group === 'notifications') keys = ['email_order_confirm', 'email_daily_reports', 'email_stock_alerts'];

        const success = await saveSettingsGroup(group, keys);
        if (success) alert('Settings saved successfully!');
        else alert('Failed to save settings');
    };

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: AppWindow },
        { id: 'checkout', label: 'Checkout settings', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'language', label: 'Language & Region', icon: Globe },
    ];

    if (loading) return <div className="p-10">Loading settings...</div>;

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* Left Sidebar - Navigation */}
            <div className="w-64 bg-white dark:bg-gray-800 rounded-[32px] p-6 h-full shadow-sm flex flex-col shrink-0 transition-colors">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 px-2">Settings</h2>
                <nav className="space-y-2 flex-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative",
                                activeTab === item.id
                                    ? "bg-[#FFC107] text-gray-900 shadow-md shadow-yellow-100"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-900 rounded-r-full"></div>
                            )}

                            <item.icon size={18} strokeWidth={2.5} className={cn(activeTab === item.id ? "text-gray-900" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white")} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-[32px] p-10 h-full shadow-sm overflow-y-auto custom-scrollbar relative transition-colors">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
                        <span>Settings</span>
                        <ChevronRight size={14} />
                        <span className="text-[#FFC107] capitalize">{menuItems.find(i => i.id === activeTab)?.label}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 capitalize">{menuItems.find(i => i.id === activeTab)?.label}</h1>

                    {/* Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'appearance' && <AppearanceSettings settings={settings} update={updateSetting} save={() => handleSave('appearance')} />}
                        {activeTab === 'checkout' && <CheckoutSettings settings={settings} update={updateSetting} save={() => handleSave('checkout')} />}
                        {activeTab === 'language' && <LanguageSettings settings={settings} update={updateSetting} save={() => handleSave('language')} />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {/* Pass navigation props to Profile */}
                        {activeTab === 'profile' && <ProfileSettings navigateTo={(tab) => setActiveTab(tab)} onLogout={logout} />}
                        {activeTab === 'notifications' && <NotificationSettings settings={settings} update={updateSetting} save={() => handleSave('notifications')} />}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Settings Tabs ---

const AppearanceSettings = ({ settings, update, save }) => {
    const isLight = settings.theme !== 'dark';

    return (
        <div className="space-y-6">
            <SectionHeading>Theme</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-2">
                <Toggle label="Light" checked={isLight} onChange={(v) => update('theme', v ? 'light' : 'dark')} />
                <Toggle label="Dark" checked={!isLight} onChange={(v) => update('theme', v ? 'dark' : 'light')} />
            </div>

            <SectionHeading>Size</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <label className="text-gray-900 dark:text-white font-bold">Font size</label>
                    <input
                        type="number"
                        value={settings.font_size || 16}
                        onChange={(e) => update('font_size', e.target.value)}
                        className="bg-white dark:bg-gray-600 px-4 py-2 rounded-xl font-bold w-20 text-center border-none focus:ring-2 focus:ring-[#FFC107] dark:text-white"
                    />
                </div>
            </div>

            <SaveButton onClick={save} />
        </div>
    );
};

const CheckoutSettings = ({ settings, update, save }) => {
    return (
        <div className="space-y-6">
            <SectionHeading>Payment history</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                <Toggle
                    label="Save payment history"
                    checked={settings.save_payment_history == '1'}
                    onChange={(v) => update('save_payment_history', v ? '1' : '0')}
                />
                <button className="text-[#FFC107] font-bold text-sm mt-2 hover:underline">Clear history</button>
            </div>

            <SectionHeading>Enabled Payment Methods</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                <Toggle
                    label="Bank card"
                    checked={settings.payment_method_card == '1'}
                    onChange={(v) => update('payment_method_card', v ? '1' : '0')}
                />
                <div className="h-px bg-gray-200 dark:bg-gray-600 my-2"></div>
                <Toggle
                    label="Cash"
                    checked={settings.payment_method_cash == '1'}
                    onChange={(v) => update('payment_method_cash', v ? '1' : '0')}
                />
            </div>

            <SaveButton onClick={save} />
        </div>
    );
};

const LanguageSettings = ({ settings, update, save }) => {
    return (
        <div className="space-y-6">
            <SectionHeading>Language & Region</SectionHeading>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Choose region</label>
                    <select
                        value={settings.region || 'New York, USA'}
                        onChange={(e) => update('region', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3.5 font-bold text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                    >
                        <option>New York, USA</option>
                        <option>London, UK</option>
                        <option>Paris, France</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase">Choose language</label>
                    <select
                        value={settings.language || 'English'}
                        onChange={(e) => update('language', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3.5 font-bold text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                    >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>Urdu</option>
                    </select>
                </div>
            </div>

            <SectionHeading>Input</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                <Toggle
                    label="Predictive text suggestions"
                    checked={settings.predictive_text == '1'}
                    onChange={(v) => update('predictive_text', v ? '1' : '0')}
                />
                <p className="text-xs text-gray-400 mt-2 font-medium">See predictive text suggestions while you type</p>
            </div>

            <SaveButton onClick={save} />
        </div>
    );
};

const SecuritySettings = () => {
    const { settings, updateSetting, saveSettingsGroup } = useSettings();
    const [sessions, setSessions] = useState([]);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const { data } = await axios.get('/api/sessions');
                setSessions(data);
            } catch (e) {
                console.error("Failed to fetch sessions", e);
            }
        };
        fetchSessions();
    }, []);

    const handleSaveSecurity = () => {
        saveSettingsGroup('security', ['security_login_alerts']);
        alert('Security settings saved!');
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/profile/password', passwordData);
            alert('Password updated successfully!');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (e) {
            console.error("Password update failed", e);
            alert(e.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeading>Change Password</SectionHeading>
            <form onSubmit={handlePasswordUpdate} className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Current Password</label>
                    <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full bg-white dark:bg-gray-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107]"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">New Password</label>
                        <input
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="w-full bg-white dark:bg-gray-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107]"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordData.new_password_confirmation}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                            className="w-full bg-white dark:bg-gray-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107]"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full py-3 bg-[#FFC107] text-gray-900 font-extrabold rounded-xl hover:bg-[#FFA000] shadow-md transition-all mt-2">
                    Update Password
                </Button>
            </form>

            <SectionHeading>Notifications</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center text-gray-900 dark:text-white shadow-sm shrink-0">
                    <Bell size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900 dark:text-white">Security alert</h4>
                        <Toggle
                            label=""
                            checked={settings.security_login_alerts == '1'}
                            onChange={(v) => updateSetting('security_login_alerts', v ? '1' : '0')}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">You will get alerts when someone tries logging in to your account from an unknown device or browser.</p>
                </div>
            </div>

            <SectionHeading>Where You're logged in</SectionHeading>
            <div className="space-y-3">
                {sessions.map(session => (
                    <div key={session.id} className={cn("bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl p-4 flex gap-4 items-center", !session.is_current && "opacity-75")}>
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-600 flex items-center justify-center">
                            <AppWindow size={20} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{session.device} • {session.ip_address}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                {session.is_current && (
                                    <span className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Active now</span>
                                )}
                                <span className="text-[10px] font-bold text-gray-400">
                                    {new Date(session.last_activity * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <SaveButton onClick={handleSaveSecurity} />
        </div>
    );
};

const ProfileSettings = ({ navigateTo, onLogout }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        postal_code: '',
        gender: 'male'
    });
    const [stats, setStats] = useState({ earnings: 0, orders: 0 });

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get('/api/profile');
            setUser({
                ...data.user,
                last_name: data.user.last_name || '',
                phone: data.user.phone || '',
                date_of_birth: data.user.date_of_birth || '',
                address: data.user.address || '',
                postal_code: data.user.postal_code || '',
                gender: data.user.gender || 'male'
            });
            setStats(data.stats);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch profile", e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleGenderChange = (gender) => {
        setUser({ ...user, gender });
    };

    const handleSave = async () => {
        try {
            await axios.put('/api/profile', user);
            alert('Profile updated successfully!');
        } catch (e) {
            console.error("Update failed", e);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="flex gap-8 items-start">
            {/* Left Card - Stats & Nav */}
            <div className="w-80 bg-white dark:bg-gray-800 rounded-[32px] p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 flex flex-col shrink-0">
                <div className="relative inline-block mb-4 mx-auto group cursor-pointer">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user.name}+${user.last_name}&background=FFC107&color=000&size=128`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover shadow-xl"
                    />
                    <div className="absolute bottom-2 right-2 bg-[#FFC107] w-8 h-8 rounded-full flex items-center justify-center text-gray-900 shadow-md transform hover:scale-110 transition-transform">
                        <span className="text-sm">✏️</span>
                    </div>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white capitalize mb-1">{user.name} {user.last_name}</h2>
                <p className="text-gray-400 font-bold text-sm mb-8">Admin</p>

                <div className="flex justify-between border-y border-gray-100 dark:border-gray-700 py-6 mb-8 group hover:border-gray-200 transition-colors">
                    <div className="text-center w-1/2 border-r border-gray-100 dark:border-gray-700">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">${parseFloat(stats.earnings).toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Earned</p>
                    </div>
                    <div className="text-center w-1/2">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.orders}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Orders</p>
                    </div>
                </div>

                <div className="space-y-1 text-left">
                    <button className="w-full flex items-center gap-3 px-0 py-3 font-bold text-sm text-gray-900 dark:text-white hover:text-[#FFC107] transition-colors relative">
                        <User size={18} />
                        Personal information
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FFC107] rounded-l-full"></div>
                    </button>
                    <button onClick={() => navigateTo('security')} className="w-full flex items-center gap-3 px-0 py-3 font-bold text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Shield size={18} />
                        Login & Password
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-0 py-3 font-bold text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <span className="rotate-180 inline-block"><ChevronRight size={18} /></span>
                        Log out
                    </button>
                </div>

                <div className="mt-auto pt-8">
                    <button className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-600 transition-colors">
                        <span>🗑️</span> Delete account
                    </button>
                </div>
            </div>

            {/* Right Form */}
            <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Personal information</h2>

                <div className="flex gap-12 items-center mb-8">
                    <div className="flex gap-8">
                        <label className={cn("flex items-center gap-3 cursor-pointer group")}>
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", user.gender === 'male' ? "border-[#FFC107]" : "border-gray-200 dark:border-gray-600 group-hover:border-gray-300")}>
                                {user.gender === 'male' && <div className="w-2.5 h-2.5 bg-[#FFC107] rounded-full" />}
                            </div>
                            <span className={cn("font-bold text-sm", user.gender === 'male' ? "text-gray-900 dark:text-white" : "text-gray-400")}>Male</span>
                            <input type="radio" name="gender" value="male" className="hidden" onChange={() => handleGenderChange('male')} />
                        </label>
                        <label className={cn("flex items-center gap-3 cursor-pointer group")}>
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", user.gender === 'female' ? "border-[#FFC107]" : "border-gray-200 dark:border-gray-600 group-hover:border-gray-300")}>
                                {user.gender === 'female' && <div className="w-2.5 h-2.5 bg-[#FFC107] rounded-full" />}
                            </div>
                            <span className={cn("font-bold text-sm", user.gender === 'female' ? "text-gray-900 dark:text-white" : "text-gray-400")}>Female</span>
                            <input type="radio" name="gender" value="female" className="hidden" onChange={() => handleGenderChange('female')} />
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">First Name</label>
                            <input name="name" value={user.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Last Name</label>
                            <input name="last_name" value={user.last_name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">Email</label>
                        <div className="relative">
                            <input name="email" value={user.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500 text-xs font-extrabold flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                <Shield size={12} strokeWidth={3} /> Verified
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Phone number</label>
                            <input name="phone" value={user.phone} onChange={handleChange} placeholder="(000) 785-3156" className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={user.date_of_birth} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Location</label>
                            <div className="relative">
                                <input name="address" value={user.address} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Postal Code</label>
                            <input name="postal_code" value={user.postal_code} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#FFC107] transition-all" />
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full py-4 bg-[#FFC107] text-gray-900 font-extrabold rounded-2xl hover:bg-[#FFA000] shadow-lg shadow-yellow-100 transition-all mt-6">
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = ({ settings, update, save }) => (
    <div className="space-y-6">
        <SectionHeading>Email Notifications</SectionHeading>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
            <Toggle
                label="Order confirmations"
                checked={settings.email_order_confirm == '1'}
                onChange={(v) => update('email_order_confirm', v ? '1' : '0')}
            />
            <Toggle
                label="Daily reports"
                checked={settings.email_daily_reports == '1'}
                onChange={(v) => update('email_daily_reports', v ? '1' : '0')}
            />
        </div>
        <SaveButton onClick={save} />
    </div>
);

export default Settings;
