export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mp-bg": "#020314",
        "mp-surface": "rgba(10, 14, 35, 0.85)",
        "mp-accent": "#00f5a0",
        "mp-accent-soft": "#00d9f5",
        "web3-bg": "#0f0f0f",
        "web3-card": "rgba(255, 255, 255, 0.03)",
        "web3-border": "rgba(255, 255, 255, 0.08)",
        "web3-primary": "#3b82f6", // blue
        "web3-purple": "#8b5cf6", // purple
      },
      backgroundImage: {
        "web3-gradient":
          "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 70%), radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1), transparent 50%)",
        "glass-gradient":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
      },
      boxShadow: {
        "mp-glow": "0 0 60px rgba(0, 245, 160, 0.35)",
        "web3-glow": "0 0 20px rgba(59, 130, 246, 0.3)",
        "web3-card-glow": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 24px -1px rgba(0, 0, 0, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
