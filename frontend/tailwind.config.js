/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Precise SmartPOS Colors
                primary: {
                    DEFAULT: '#FFC107', // The main yellow
                    50: '#FFF8E1',
                    100: '#FFECB3',
                    200: '#FFE082',
                    300: '#FFD54F', // Lighter accent
                    400: '#FFCA28',
                    500: '#FFC107', // Base
                    600: '#FFB300',
                    700: '#FFA000',
                    800: '#FF8F00',
                    900: '#FF6F00',
                },
                secondary: '#1E1E2D', // Dark text color
                danger: '#F44336',    // Red for arrows/badges
                success: '#4CAF50',   // Green for arrows
                light: {
                    bg: '#FAFAFB',    // Very light gray background
                    card: '#FFFFFF',
                    text: '#2D2D2D',
                    muted: '#9E9E9E',
                    border: '#F0F0F0',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'sans-serif'], // Use same font mostly, maybe bolder
            },
            boxShadow: {
                'soft': '0px 10px 60px rgba(226, 236, 249, 0.5)', // Very diffuse shadow
                'card': '0px 4px 20px rgba(0, 0, 0, 0.03)',
            },
            borderRadius: {
                '4xl': '2rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
