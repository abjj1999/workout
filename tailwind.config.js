// Design tokens. Keep the color values in sync with constants/colors.ts,
// which exists for the few places (icons, navigation styles) that need raw values.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        surface: "#1E1E1E",
        "surface-raised": "#242424",
        border: "#2A2A2A",
        accent: "#E8590C",
        "text-primary": "#E5E2E1",
        "text-secondary": "rgba(255,255,255,0.6)",
      },
      fontFamily: {
        display: ["Oswald_700Bold"],
        body: ["Inter_400Regular"],
        "body-medium": ["Inter_500Medium"],
        "body-semibold": ["Inter_600SemiBold"],
      },
      // The only three type sizes in the app.
      fontSize: {
        title: ["28px", { lineHeight: "34px", letterSpacing: "1.5px" }],
        body: ["16px", { lineHeight: "24px" }],
        label: ["12px", { lineHeight: "16px", letterSpacing: "1.5px" }],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};
