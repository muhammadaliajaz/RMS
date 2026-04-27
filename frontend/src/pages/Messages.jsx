import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Phone, Video, MoreVertical, Paperclip, Mic, Send, Smile, Bell, ChevronLeft, Plus, X, UserPlus, Mail, Clock } from 'lucide-react';
import { cn } from '../utils/cn';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Messages = () => {
    const { user: currentUser } = useAuth();

    // State
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Waiter' });

    const messagesEndRef = useRef(null);

    // Fetch Contacts (Users + Stats)
    const fetchContacts = async () => {
        try {
            const { data } = await axios.get('/api/contacts');
            setChats(data);
        } catch (e) {
            console.error("Failed to fetch contacts", e);
        }
    };

    // Mark Messages as Read
    const markAsRead = async (senderId) => {
        try {
            await axios.post('/api/messages/mark-read', { sender_id: senderId });
            // Immediately update local state to hide badge to feel instant
            setChats(prev => prev.map(c => c.id === senderId ? { ...c, unread: 0 } : c));
        } catch (e) {
            console.error("Failed to mark as read", e);
        }
    };

    // Initial Fetch & Poll Contacts
    useEffect(() => {
        fetchContacts();
        const interval = setInterval(fetchContacts, 5000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Poll Messages for Active Chat & Mark Read
    useEffect(() => {
        if (!activeChatId) return;

        // Mark as read immediately when entering chat
        markAsRead(activeChatId);

        const fetchMessages = async () => {
            try {
                const type = 'personal';
                const { data } = await axios.get(`/api/messages`, {
                    params: { contact_id: activeChatId, type }
                });

                const formatted = data.map(m => ({
                    id: m.id,
                    sender: m.sender_id === currentUser?.id ? 'me' : 'other',
                    text: m.message,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    name: m.sender.name,
                    avatar: `https://ui-avatars.com/api/?name=${m.sender.name}&background=random`
                }));
                setMessages(formatted);

                // Also mark as read periodically in case new messages arrive while open
                markAsRead(activeChatId);

            } catch (e) {
                console.error("Failed to fetch messages", e);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [activeChatId, currentUser]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        try {
            await axios.post('/api/messages', {
                type: 'personal',
                receiver_id: activeChatId,
                message: messageInput
            });
            setMessageInput('');
            const newMessage = {
                id: Date.now(),
                sender: 'me',
                text: messageInput,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, newMessage]);
            fetchContacts();
        } catch (e) {
            console.error("Failed to send", e);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', {
                name: newUser.name,
                email: newUser.email,
                password: 'password'
            });

            setIsAddModalOpen(false);
            setNewUser({ name: '', email: '', role: 'Waiter' });
            fetchContacts();
            alert(`User ${newUser.name} added! Password is 'password'.`);
        } catch (e) {
            console.error("Failed to create user", e);
            alert("Failed to create user. Email might be taken.");
        }
    };

    const activeChat = chats.find(c => c.id === activeChatId);

    const ContactItem = ({ contact }) => (
        <div
            onClick={() => setActiveChatId(contact.id)}
            className={cn(
                "p-4 rounded-[24px] mb-4 cursor-pointer transition-all duration-300 relative group",
                activeChatId === contact.id ? "bg-white shadow-lg shadow-gray-100 scale-[1.02]" : "hover:bg-white/50"
            )}
        >
            <div className="flex gap-4">
                <div className="relative">
                    <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{contact.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{contact.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={cn("text-sm truncate pr-2 max-w-[140px]",
                            activeChatId === contact.id ? "text-gray-600 font-medium" :
                                (contact.unread > 0 ? "text-gray-900 font-extrabold" : "text-gray-400")
                        )}>
                            {contact.lastMessage}
                        </p>
                        {/* UNREAD BADGE */}
                        {contact.unread > 0 && (
                            <div className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-red-200 shadow-md">
                                {contact.unread}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-8 overflow-hidden relative">
            {/* Sidebar */}
            <div className="w-96 flex flex-col shrink-0 pb-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
                        <p className="text-gray-400 font-bold text-xs mt-1">Real-time Communication</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-10 h-10 bg-[#FFC107] text-gray-900 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200 hover:scale-105 transition-transform"
                        title="Add New Contact"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 px-2">Contacts</h3>
                    {chats.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No contacts yet.<br />Click <b>+</b> to add someone!
                        </div>
                    )}
                    {chats.map(contact => <ContactItem key={contact.id} contact={contact} />)}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
                {activeChat ? (
                    <>
                        <div className="p-6 pb-2 border-b border-gray-50">
                            <div className="flex justify-between items-center px-2 pb-4">
                                <div
                                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-colors -ml-2 select-none"
                                    onClick={() => setIsProfileOpen(true)}
                                    title="View Profile"
                                >
                                    <img src={activeChat.avatar} alt={activeChat.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900 hover:underline decoration-[#FFC107] decoration-2 underline-offset-4">{activeChat.name}</h2>
                                        <p className="text-sm font-bold text-green-500">Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <p className="font-bold">No messages yet</p>
                                    <p className="text-sm">Say hello to {activeChat.name} 👋</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={cn("flex gap-4 max-w-[80%] animate-in fade-in slide-in-from-bottom-2", msg.sender === 'me' ? "ml-auto flex-row-reverse" : "")}>
                                        {msg.sender !== 'me' && (
                                            <img src={msg.avatar} alt={msg.name} className="w-10 h-10 rounded-full object-cover shadow-sm mt-auto" />
                                        )}

                                        <div className={cn("space-y-1", msg.sender === 'me' ? "items-end flex flex-col" : "")}>
                                            <div className={cn(
                                                "p-5 rounded-[24px] text-sm font-semibold leading-relaxed shadow-sm relative group",
                                                msg.sender === 'me'
                                                    ? "bg-gray-50 text-gray-800 rounded-br-none"
                                                    : "bg-gray-50 text-gray-800 rounded-bl-none"
                                            )}>
                                                <div className={cn(
                                                    "absolute inset-0 rounded-[24px]",
                                                    msg.sender === 'me' ? "bg-[#FFC107]/40 rounded-br-none" : "bg-gray-50 rounded-bl-none"
                                                )} style={{ zIndex: -1 }}></div>

                                                <span className="relative z-10 text-gray-900 font-bold">{msg.text}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 px-2">{msg.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-6 pt-0 bg-white">
                            <form onSubmit={handleSendMessage} className="bg-gray-50 rounded-[24px] p-2 flex items-center gap-2 pr-2 shadow-inner transition-all focus-within:ring-2 focus-within:ring-[#FFC107]/20">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Write a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-400 py-3 pl-4"
                                />
                                <button type="submit" disabled={!messageInput.trim()} className="w-12 h-12 disabled:opacity-50 bg-[#FFC107] rounded-xl flex items-center justify-center text-gray-900 shadow-lg shadow-yellow-200 hover:scale-105 transition-transform">
                                    <Send size={20} className="ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <UserPlus size={48} className="mb-4 text-gray-200" />
                        <p className="text-2xl font-bold mb-2">Start a Conversation</p>
                        <p className="text-sm">Select a contact or add a new one!</p>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-sm relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Add Contact</h2>
                        <p className="text-sm text-gray-400 font-bold mb-6">Create a new user to chat with.</p>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                label="Name"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                required
                                placeholder="e.g. John Doe"
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                required
                                placeholder="john@example.com"
                            />
                            <div className="pt-4">
                                <Button type="submit" className="w-full py-3.5 bg-[#FFC107] text-gray-900 font-bold rounded-xl shadow-lg shadow-yellow-100 hover:bg-[#FFA000]">
                                    Create & Add
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center mt-2">Default password: 'password'</p>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile View Modal */}
            {isProfileOpen && activeChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Abstract Header Background */}
                        <div className="h-32 bg-gradient-to-r from-[#FFC107] to-orange-400 relative">
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6 flex justify-center">
                                <img
                                    src={activeChat.avatar}
                                    alt={activeChat.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                                />
                                <div className="absolute bottom-2 right-1/2 translate-x-12 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>

                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900">{activeChat.name}</h2>
                                <p className="text-gray-400 font-bold">{activeChat.role || 'Staff Member'}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                                        <p className="text-gray-900 font-bold truncate">{activeChat.email}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                        <Clock size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Local Time</p>
                                        <p className="text-gray-900 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <Button className="w-full py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 font-bold rounded-xl">
                                    Mute
                                </Button>
                                <Button className="w-full py-3 bg-gray-900 text-white hover:bg-gray-800 font-bold rounded-xl">
                                    Block
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
