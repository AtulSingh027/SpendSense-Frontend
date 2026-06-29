export const Colors = {
  primary: "#00342b",           // Deep Teal (High-emphasis actions)
  primaryContainer: "#004d40",  // Forest Teal (Brand dominant)
  secondary: "#3b6663",         // Soft Mint Accent
  background: "#fcf9f8",        // Off-white / light cream
  surface: "#ffffff",           // Card backgrounds
  onPrimary: "#ffffff",
  onSurface: "#1b1c1c",         // Text primary
  onSurfaceVariant: "#3f4945",  // Text secondary
  outline: "#3D4945",           // Border lines
  outlineVariant: "#bfc9c4",    // Lighter outlines and placeholders
  cardBorder: "#eeeeee",
  muted: "#707975",
  grayFixed: "#e5e2e1",
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Rounded = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  displayCurrency: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8, // -0.02em of 40
  },
  displayCurrencyMobile: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  headlineLg: {
    fontFamily: "HankenGrotesk_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
  },
  headlineMd: {
    fontFamily: "HankenGrotesk_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  labelSm: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.24, // 0.02em of 12
  },
  button: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
};
