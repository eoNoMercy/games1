/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { navy: "#0b1022", porcelain: "#eef0f5", ink: "#12151f", signal: "#3d63ff", mist: "#9aa3b8" },
      fontFamily: { display: ["var(--font-display)", "sans-serif"], body: ["var(--font-body)", "sans-serif"] },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [],
};
