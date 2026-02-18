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
                display: ["sans-serif"],
                body: ["sans-serif"],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                overlayShow: {
                    from: { opacity: "0" },
                    to: { opacity: "0.3" },
                },
                contentShow: {
                    from: {
                        opacity: "0",
                        transform: "translate(-50%, -48%) scale(0.96)",
                    },
                    to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
                },
                slideUpAndFade: {
                    from: { opacity: "0", transform: "translateY(2px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                enterFromRight: {
                    from: { opacity: " 0", transform: "translateX(200px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                enterFromLeft: {
                    from: { opacity: " 0", transform: "translateX(-200px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                exitToRight: {
                    from: { opacity: "1", transform: "translateX(0)" },
                    to: { opacity: " 0", transform: "translateX(200px)" },
                },
                exitToLeft: {
                    from: { opacity: "1", transform: "translateX(0)" },
                    to: { opacity: " 0", transform: "translateX(-200px)" },
                },
                fadeIn: {
                    from: { opacity: " 0" },
                    to: { opacity: "1" },
                },
                fadeOut: {
                    from: { opacity: "1" },
                    to: { opacity: " 0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                'in': 'animate-in 0.5s ease-out',
                overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                enterFromLeft: "enterFromLeft 250ms ease",
                enterFromRight: "enterFromRight 250ms ease",
                exitToLeft: "exitToLeft 250ms ease",
                exitToRight: "exitToRight 250ms ease",
                fadeIn: "fadeIn 200ms ease",
                fadeOut: "fadeOut 200ms ease",
            },
        },
    },
    plugins: [],
};
export default config;