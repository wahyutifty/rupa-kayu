import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    dark: "var(--primary-dark)",
                    foreground: "var(--primary-foreground)",
                },
            },
            fontFamily: {
                sans: ["var(--font-outfit)"],
            },
            borderRadius: {
                DEFAULT: "var(--radius)",
            },
        },
    },
    plugins: [],
};

export default config;
