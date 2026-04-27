import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import analyticsImg from '../assets/aa.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    // Slider State (Matching Login Page)
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Join SmartPOS\nand streamline your business",
            image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Manage everything\nfrom one elegant dashboard",
            image: analyticsImg
        },
        {
            title: "Scale your restaurant\nwith ease and efficiency",
            image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await register(formData);
        } catch (e) {
            console.error("Registration failed", e);
            if (e.response?.data?.errors) {
                const errors = e.response.data.errors;
                setError(Object.values(errors)[0][0]);
            } else {
                setError(e.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full font-sans">
            {/* Left Side - Slider (Consistent with Login) */}
            <div className="hidden lg:flex w-1/2 bg-[#F8F8F6] flex-col relative p-12 justify-between overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 6H20V8H4V6Z" />
                            <path d="M4 12H20V14H4V12Z" />
                            <path d="M9 17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17H20V19H15C15 20.6569 13.6569 22 12 22C10.3431 22 9 20.6569 9 19H4V17H9Z" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-gray-900 text-xl tracking-tight">SmartPOS</span>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mx-auto relative z-10">
                    <div className="w-full relative h-[450px] flex items-center justify-center mb-8">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 translate-x-0 scale-100' :
                                    index < currentSlide ? 'opacity-0 -translate-x-10 scale-95' : 'opacity-0 translate-x-10 scale-95'
                                    }`}
                            >
                                <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-20 flex items-center justify-center w-full">
                        {slides.map((slide, index) => (
                            <h2 key={index} className={`text-3xl font-bold text-gray-900 text-center leading-tight absolute transition-opacity duration-500 whitespace-pre-line ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                                {slide.title}
                            </h2>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create Account</h1>
                        <p className="text-gray-400 font-medium text-sm">Join us and simplify your management</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100 animate-in fade-in zoom-in duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input name="name" type="text" onChange={handleChange} required placeholder="Full Name" className="w-full h-14 bg-[#F2F2F2] rounded-xl px-12 text-gray-900 font-medium focus:ring-2 focus:ring-[#FFC107] outline-none" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input name="email" type="email" onChange={handleChange} required placeholder="Email Address" className="w-full h-14 bg-[#F2F2F2] rounded-xl px-12 text-gray-900 font-medium focus:ring-2 focus:ring-[#FFC107] outline-none" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input name="password" type={showPassword ? "text" : "password"} onChange={handleChange} required placeholder="Password" className="w-full h-14 bg-[#F2F2F2] rounded-xl px-12 text-gray-900 font-medium focus:ring-2 focus:ring-[#FFC107] outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input name="password_confirmation" type={showPassword ? "text" : "password"} onChange={handleChange} required placeholder="Confirm Password" className="w-full h-14 bg-[#F2F2F2] rounded-xl px-12 text-gray-900 font-medium focus:ring-2 focus:ring-[#FFC107] outline-none" />
                            </div>
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full h-14 text-base font-bold bg-[#FFC107] hover:bg-[#FFA000] text-gray-900 rounded-xl transition-all mt-4">
                            Register Now
                        </Button>
                    </form>

                    <p className="text-sm text-gray-400 font-medium text-center">
                        Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
