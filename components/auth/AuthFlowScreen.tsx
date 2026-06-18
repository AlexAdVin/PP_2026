import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AUTH_METHODS, type AuthMethodKey } from "@/src/auth/providers";
import { authIdentityAdapter, type IdentityKind } from "@/src/adapters/authIdentityAdapter";
import { userProfileAdapter } from "@/src/adapters/userProfileAdapter";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore, type AuthModalReason } from "@/src/store/authStore";

type AuthStep =
  | "entry"
  | "verify"
  | "profile-name"
  | "password-fallback"
  | "password-setup"
  | "success";

type AuthIntent = "sign-in" | "sign-up" | null;

type Props = {
  reason: AuthModalReason;
  onClose: () => void;
  onStepChange?: (step: AuthStep, method?: AuthMethodKey) => void;
};

export default function AuthFlowScreen({ reason, onClose, onStepChange }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setHostAuthPending = useAuthStore((state) => state.setHostAuthPending);
  const [step, setStep] = useState<AuthStep>("entry");
  const [identityInput, setIdentityInput] = useState("");
  const [identityKind, setIdentityKind] = useState<IdentityKind | null>(null);
  const [normalizedIdentity, setNormalizedIdentity] = useState("");
  const [intent, setIntent] = useState<AuthIntent>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const enabledProviders = useMemo(
    () => AUTH_METHODS.filter((method) => method.enabled),
    [],
  );

  const passwordHasMinLength = password.length >= 8;
  const passwordHasLetter = /[A-Za-z]/.test(password);
  const passwordHasNumber = /\d/.test(password);
  const passwordIsStrong = passwordHasMinLength && passwordHasLetter && passwordHasNumber;

  const setFlowStep = (nextStep: AuthStep, method?: AuthMethodKey) => {
    setStep(nextStep);
    onStepChange?.(nextStep, method);
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      if (Platform.OS === "android") {
        setKeyboardOffset(Math.max(event.endCoordinates.height - 18, 0));
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const completeSuccessfulAuth = useCallback(() => {
    if (reason === "host-required") {
      setHostAuthPending(false);
    }

    onClose();

    if (reason === "profile-required") {
      router.push("/profile");
      return;
    }

    if (reason === "host-required") {
      router.replace("/host");
    }
  }, [onClose, reason, router, setHostAuthPending]);

  useEffect(() => {
    if (step !== "success") {
      return;
    }

    const timeout = setTimeout(() => {
      completeSuccessfulAuth();
    }, 1600);

    return () => clearTimeout(timeout);
  }, [completeSuccessfulAuth, step]);

  const sendPasswordlessCode = async (
    kind: IdentityKind,
    normalized: string,
    shouldCreateUser: boolean,
  ) => {
    if (kind === "email") {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser },
      });

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: { shouldCreateUser },
    });

    if (error) {
      throw error;
    }
  };

  const verifyPasswordlessCode = async () => {
    if (!identityKind) {
      throw new Error("Enter your email or phone number first.");
    }

    const verificationPayload =
      identityKind === "email"
        ? {
            email: normalizedIdentity,
            token: verificationCode.trim(),
            type: "email" as const,
          }
        : {
            phone: normalizedIdentity,
            token: verificationCode.trim(),
            type: "sms" as const,
          };

    const { error } = await supabase.auth.verifyOtp(verificationPayload);

    if (error) {
      throw error;
    }
  };

  const finalizeProfile = async () => {
    const updatePayload = password
      ? {
          password,
          data: { display_name: displayName.trim() },
        }
      : {
          data: { display_name: displayName.trim() },
        };

    const { data, error } = await supabase.auth.updateUser(updatePayload);

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Unable to finish setting up your account.");
    }

    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      await userProfileAdapter.upsertForSession(sessionData.session);
    }

    setSuccessText("You are signed in.");
    setFlowStep("success");
  };

  const submitPasswordFallback = async () => {
    if (identityKind !== "email") {
      throw new Error("Password fallback is available only for email accounts.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedIdentity,
      password,
    });

    if (error) {
      throw error;
    }

    completeSuccessfulAuth();
  };

  const handleIdentitySubmit = async () => {
    const lookup = await authIdentityAdapter.lookup(identityInput);
    const nextIntent = lookup.exists ? "sign-in" : "sign-up";

    setIdentityKind(lookup.kind);
    setNormalizedIdentity(lookup.normalizedIdentity);
    setIntent(nextIntent);

    await sendPasswordlessCode(lookup.kind, lookup.normalizedIdentity, !lookup.exists);

    setSuccessText(
      lookup.kind === "email"
        ? "We sent a one-time email code. If your Supabase template is configured for magic link, that link also works."
        : "We sent a one-time SMS code.",
    );

    setFlowStep("verify");
  };

  const handleAppleSignIn = async () => {
    setErrorText(null);
    setSuccessText(null);
    setBusy(true);

    try {
      if (Platform.OS !== "ios") {
        throw new Error("Apple sign-in is available only on iPhone and iPad.");
      }

      const available = await AppleAuthentication.isAvailableAsync();

      if (!available) {
        throw new Error("Apple sign-in is not available on this device.");
      }

      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const credential = await AppleAuthentication.signInAsync({
        nonce: hashedNonce,
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple did not return an identity token.");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) {
        throw error;
      }

      completeSuccessfulAuth();
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("canceled")) {
        return;
      }

      setErrorText(error instanceof Error ? error.message : "Unable to sign in with Apple.");
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = async () => {
    setErrorText(null);

    if (step === "success") {
      return;
    }

    setBusy(true);

    try {
      if (step === "entry") {
        await handleIdentitySubmit();
      } else if (step === "verify") {
        await verifyPasswordlessCode();

        if (intent === "sign-up") {
          setSuccessText(null);
          setFlowStep("profile-name");
        } else {
          completeSuccessfulAuth();
        }
      } else if (step === "profile-name" || step === "password-setup") {
        await finalizeProfile();
      } else if (step === "password-fallback") {
        await submitPasswordFallback();
      }
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Unable to continue authentication.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBack = () => {
    setErrorText(null);
    setSuccessText(null);

    switch (step) {
      case "verify":
      case "password-fallback":
        setFlowStep("entry");
        break;
      case "profile-name":
        setFlowStep("verify");
        break;
      case "password-setup":
        setFlowStep("profile-name");
        break;
      default:
        break;
    }
  };

  const handlePasswordFallbackPress = () => {
    setErrorText(null);
    setSuccessText(null);
    setPassword("");
    setShowPassword(false);
    setFlowStep("password-fallback");
  };

  const handleOptionalPasswordPress = () => {
    setErrorText(null);
    setSuccessText(null);
    setPassword("");
    setShowPassword(false);
    setFlowStep("password-setup");
  };

  const canContinue = useMemo(() => {
    if (step === "entry") {
      return identityInput.trim().length >= 4;
    }

    if (step === "verify") {
      return verificationCode.trim().length >= 6;
    }

    if (step === "profile-name") {
      return displayName.trim().length >= 2;
    }

    if (step === "password-fallback") {
      return password.length >= 8;
    }

    if (step === "password-setup") {
      return displayName.trim().length >= 2 && passwordIsStrong;
    }

    return false;
  }, [displayName, identityInput, password, passwordIsStrong, step, verificationCode]);

  const footerOffset = Platform.OS === "android" ? keyboardOffset : 0;
  const showBack = step !== "entry" && step !== "success";
  const showFooter = step !== "success";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={24}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{getStepTitle(step, intent)}</Text>
        <Text style={styles.subtitle}>
          {getStepSubtitle(step, normalizedIdentity, intent)}
        </Text>
        <Text style={styles.reasonText}>{getReasonCopy(reason)}</Text>

        {step === "entry" && (
          <View style={styles.formBlock}>
            <Field
              label="Email or phone"
              value={identityInput}
              onChangeText={setIdentityInput}
              placeholder="anne@example.com or +45 12 34 56 78"
              keyboardType="email-address"
              autoFocus
            />

            <Text style={styles.helperText}>
              We detect returning users automatically and default to one-time verification first.
            </Text>

            {enabledProviders.length > 0 && (
              <View style={styles.ssoSection}>
                <Text style={styles.ssoLabel}>Or continue with</Text>

                {enabledProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.key}
                    activeOpacity={0.88}
                    style={styles.ssoButton}
                    onPress={() => {
                      if (provider.key === "apple") {
                        void handleAppleSignIn();
                      }
                    }}
                  >
                    <Ionicons name={provider.icon} size={18} color="#0F172A" />
                    <Text style={styles.ssoButtonText}>Continue with {provider.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {step === "verify" && (
          <View style={styles.formBlock}>
            <Field
              label={identityKind === "email" ? "Email code" : "SMS code"}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="123456"
              keyboardType="number-pad"
              autoFocus
            />

            {identityKind === "email" && intent === "sign-in" && (
              <TouchableOpacity activeOpacity={0.8} onPress={handlePasswordFallbackPress}>
                <Text style={styles.inlineAction}>Use password instead</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === "profile-name" && (
          <View style={styles.formBlock}>
            <Field
              label="Your name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Anne Larsen"
              autoFocus
            />

            <TouchableOpacity activeOpacity={0.8} onPress={handleOptionalPasswordPress}>
              <Text style={styles.inlineAction}>Add an optional password</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "password-fallback" && (
          <View style={styles.formBlock}>
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoFocus
              rightAccessory={
                <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              }
            />
            <Text style={styles.helperText}>
              Password is fallback only. One-time codes remain the default sign-in path.
            </Text>
          </View>
        )}

        {step === "password-setup" && (
          <View style={styles.formBlock}>
            <Field
              label="Optional password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoFocus
              rightAccessory={
                <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              }
            />

            <View style={styles.passwordRulesCard}>
              <Text style={styles.passwordRulesTitle}>Password guidance</Text>
              <PasswordRule label="At least 8 characters" met={passwordHasMinLength} />
              <PasswordRule label="Contains a letter" met={passwordHasLetter} />
              <PasswordRule label="Contains a number" met={passwordHasNumber} />
            </View>
          </View>
        )}

        {step === "success" && (
          <View style={styles.successWrap}>
            <LottieView
              autoPlay
              loop={false}
              source={require("@/assets/lottie/done/Comp 1.json")}
              style={styles.successAnimation}
            />
            <Text style={styles.successTitle}>You&apos;re in</Text>
            <Text style={styles.successBody}>Finishing sign-in and taking you back now.</Text>
          </View>
        )}

        {errorText && <Text style={styles.errorText}>{errorText}</Text>}
        {successText && step !== "success" && (
          <Text style={styles.successText}>{successText}</Text>
        )}
      </ScrollView>

      {showFooter && (
        <View
          style={[
            styles.footerButtons,
            {
              paddingBottom: 12 + insets.bottom + footerOffset,
            },
          ]}
        >
          {showBack && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleBack}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            disabled={!canContinue || busy}
            style={[styles.button, (!canContinue || busy) && styles.buttonDisabled]}
            onPress={() => {
              void handleContinue();
            }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{getContinueLabel(step, intent)}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "number-pad" | "email-address";
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  rightAccessory?: React.ReactNode;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  autoFocus = false,
  rightAccessory,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoFocus={autoFocus}
        />
        {rightAccessory ? <View style={styles.inputAccessory}>{rightAccessory}</View> : null}
      </View>
    </View>
  );
}

function PasswordRule({ label, met }: { label: string; met: boolean }) {
  return (
    <View style={styles.passwordRuleRow}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#15803D" : "#94A3B8"}
      />
      <Text style={[styles.passwordRuleText, met && styles.passwordRuleTextMet]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -1.4,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 12,
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
  },
  reasonText: {
    marginBottom: 18,
    color: "#334155",
    fontSize: 13,
    lineHeight: 20,
  },
  formBlock: {
    minHeight: 250,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: "#475569",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  inputShell: {
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(203,213,225,0.95)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: 15,
  },
  inputAccessory: {
    marginLeft: 12,
  },
  helperText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
  },
  ssoSection: {
    marginTop: 22,
  },
  ssoLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  ssoButton: {
    height: 54,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ssoButtonText: {
    marginLeft: 10,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  inlineAction: {
    marginTop: 4,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  passwordRulesCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
  },
  passwordRulesTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  passwordRuleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  passwordRuleText: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 13,
  },
  passwordRuleTextMet: {
    color: "#15803D",
  },
  errorText: {
    marginBottom: 16,
    color: "#B91C1C",
    fontSize: 13,
  },
  successText: {
    marginBottom: 16,
    color: "#15803D",
    fontSize: 13,
    lineHeight: 20,
  },
  successWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  },
  successAnimation: {
    width: 180,
    height: 180,
  },
  successTitle: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  successBody: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 240,
  },
  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(248,250,252,0.92)",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "rgba(15,23,42,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

function getReasonCopy(reason: AuthModalReason) {
  switch (reason) {
    case "profile-required":
      return "Create your account to access your profile and saved preferences.";
    case "payment-required":
      return "Authentication is required before confirming payment and starting a reservation.";
    case "host-required":
      return "Sign in before continuing into the hosting workspace.";
    case "search-limit":
    default:
      return "Guest browsing is limited. Authenticate to keep searching and save your activity.";
  }
}

function getStepTitle(step: AuthStep, intent: AuthIntent) {
  switch (step) {
    case "verify":
      return intent === "sign-up" ? "Verify your contact" : "Check your code";
    case "profile-name":
      return "What should we call you?";
    case "password-fallback":
      return "Use your password";
    case "password-setup":
      return "Add a password";
    case "success":
      return "Success";
    case "entry":
    default:
      return "Enter your email or phone";
  }
}

function getStepSubtitle(step: AuthStep, normalizedIdentity: string, intent: AuthIntent) {
  switch (step) {
    case "verify":
      return `Enter the code sent to ${normalizedIdentity}.`;
    case "profile-name":
      return "That is the only required profile field. Preferences and optional details can wait.";
    case "password-fallback":
      return "Use password only when you cannot access the one-time code flow.";
    case "password-setup":
      return "This is optional. Passwordless sign-in stays available either way.";
    case "success":
      return intent === "sign-up" ? "Your new account is ready." : "You are signed in.";
    case "entry":
    default:
      return "We detect returning users automatically and default to passwordless verification first.";
  }
}

function getContinueLabel(step: AuthStep, intent: AuthIntent) {
  switch (step) {
    case "verify":
      return intent === "sign-up" ? "Verify and continue" : "Verify";
    case "profile-name":
      return "Finish setup";
    case "password-fallback":
      return "Sign in with password";
    case "password-setup":
      return "Save password";
    case "entry":
    default:
      return "Continue";
  }
}
