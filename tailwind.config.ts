import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#FC4C02",
                "background-light": "#F7F9FB",
                "background-dark": "#0B0F19",
                "card-light": "#FFFFFF",
                "card-dark": "#161B22",
            },
            fontFamily: {
                display: ["var(--font-inter)", "sans-serif"],
                body: ["var(--font-inter)", "sans-serif"],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
            },
            animation: {
                'in': 'animate-in 0.5s ease-out',
            }
        },
    },
    plugins: [],
};
export default config;