import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';
import analyticsImg from '../assets/aa.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    // Slider State
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Manage sales, inventory\nand other transactions",
            image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80" // Reliable POS/Payment image
        },
        {
            title: "Real-time analytics\nat your fingertips",
            image: analyticsImg // Reliable Analytics (Charts on laptop)
        },
        {
            title: "Empower your staff\nmaximize efficiency",
            image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80" // Chef/Staff
        }
    ];

    // Auto-rotate slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login({ email, password });
        } catch (e) {
            if (e.response?.status === 422) {
                setError("Invalid credentials provided.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full font-sans">
            {/* Left Side - Slider (Beige Background) */}
            <div className="hidden lg:flex w-1/2 bg-[#F8F8F6] flex-col relative p-12 justify-between overflow-hidden">
                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20V8H4V6Z" />
                            <path d="M4 12H20V14H4V12Z" />
                            <path d="M9 17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17H20V19H15C15 20.6569 13.6569 22 12 22C10.3431 22 9 20.6569 9 19H4V17H9Z" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-gray-900 text-xl tracking-tight">SmartPOS</span>
                </div>

                {/* Slider Content */}
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mx-auto relative z-10">
                    {/* Visual Area - Images */}
                    <div className="w-full relative h-[450px] flex items-center justify-center mb-8">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 translate-x-0 scale-100' :
                                    index < currentSlide ? 'opacity-0 -translate-x-10 scale-95' : 'opacity-0 translate-x-10 scale-95'
                                    }`}
                            >
                                <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover transform transition-transform duration-[10s] ease-linear group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay for Text Readability if needed, but we keep it clean for now */}
                                    <div className="absolute inset-0 bg-black/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Text Area */}
                    <div className="h-20 flex items-center justify-center w-full">
                        {slides.map((slide, index) => (
                            <h2
                                key={index}
                                className={`text-3xl font-bold text-gray-900 text-center font-display leading-tight absolute transition-opacity duration-500 whitespace-pre-line ${index === currentSlide ? 'opacity-100 delay-200' : 'opacity-0'
                                    }`}
                            >
                                {slide.title}
                            </h2>
                        ))}
                    </div>

                    {/* Interactive Slider Indicators */}
                    <div className="flex gap-2 mt-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#FFC107] w-8' : 'bg-gray-300 w-2.5 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-bl-[100px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-50 rounded-tr-[80px] opacity-30 pointer-events-none"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome Back!</h1>
                        <p className="text-gray-400 font-medium text-sm">Please, sign in to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {/* Email / Sales ID */}
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Sales ID number"
                                className="w-full h-14 bg-[#F2F2F2] rounded-xl px-5 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC107] transition-all"
                            />

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Password"
                                    className="w-full h-14 bg-[#F2F2F2] rounded-xl px-5 pr-12 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC107] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full h-14 text-base font-bold bg-[#FFC107] hover:bg-[#FFA000] text-gray-900 rounded-xl shadow-none hover:shadow-lg transition-all"
                        >
                            Sign in
                        </Button>
                    </form>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">or</span>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 h-12 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            Sign up with Google
                        </button>
                        <button className="flex-1 h-12 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                            Sign up with Facebook
                        </button>
                    </div>

                    <div className="space-y-4 text-center">
                        <a href="#" className="block text-sm font-bold text-blue-500 hover:text-blue-600">Forgot password?</a>
                        <p className="text-sm text-gray-400 font-medium">
                            Don't have an account? <Link to="/register" className="text-gray-900 hover:underline">Go to Registration</Link>
                        </p>
                    </div>

                    <div className="pt-8 text-center">
                        <p className="text-[10px] text-gray-300">© 2020 SmartPOS App</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
