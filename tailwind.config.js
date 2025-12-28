/** @type {import("tailwindcss").Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e9f7ff",
          900: "#0f1729"
        },
        accent: "#6366f1"
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
