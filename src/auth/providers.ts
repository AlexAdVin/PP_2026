import { Ionicons } from "@expo/vector-icons";

export type AuthMethodKey = "phone" | "apple";

export type AuthMethodConfig = {
  key: AuthMethodKey;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const AUTH_METHODS: AuthMethodConfig[] = [
  {
    key: "phone",
    title: "Phone OTP",
    subtitle: "Sign in with a one-time SMS code",
    icon: "chatbubble-ellipses-outline",
  },
  {
    key: "apple",
    title: "Sign in with Apple",
    subtitle: "Private, fast authentication on Apple devices",
    icon: "logo-apple",
  },
];