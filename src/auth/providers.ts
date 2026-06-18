import { Ionicons } from "@expo/vector-icons";

export type AuthMethodKey = "apple" | "google" | "microsoft";

export type AuthMethodConfig = {
  key: AuthMethodKey;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
};

export const AUTH_METHODS: AuthMethodConfig[] = [
  {
    key: "apple",
    title: "Apple",
    subtitle: "Fast private sign in on Apple devices",
    icon: "logo-apple",
    enabled: true,
  },
  {
    key: "google",
    title: "Google",
    subtitle: "Adapter slot ready for Google OAuth",
    icon: "logo-google",
    enabled: false,
  },
  {
    key: "microsoft",
    title: "Microsoft",
    subtitle: "Adapter slot ready for Microsoft OAuth",
    icon: "logo-windows",
    enabled: false,
  },
];