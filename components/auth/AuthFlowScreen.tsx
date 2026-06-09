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
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AUTH_METHODS, type AuthMethodKey } from "@/src/auth/providers";
import { supabase } from "@/src/lib/supabase";
import { useAuthStore, type AuthModalReason } from "@/src/store/authStore";

type AuthStep =
  | "choose"
  | "email-mode"
  | "email-entry"
  | "email-password"
  | "email-name"
  | "email-success"
  | "phone-name"
  | "phone-entry"
  | "phone-verify"
  | "apple-info";

type EmailMode = "sign-in" | "sign-up";

type Props = {
  reason: AuthModalReason;
  onClose: () => void;
  onStepChange?: (step: AuthStep, method?: AuthMethodKey) => void;
};

export default function AuthFlowScreen({ reason, onClose, onStepChange }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<AuthMethodKey>("email");
  const [step, setStep] = useState<AuthStep>("choose");
  const [emailMode, setEmailMode] = useState<EmailMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const setHostAuthPending = useAuthStore((state) => state.setHostAuthPending);

  const selectedConfig = useMemo(
    () => AUTH_METHODS.find((method) => method.key === selectedMethod),
    [selectedMethod],
  );

  const emailHasRequiredShape = /\S+@\S+\.\S+/.test(email.trim());
  const passwordHasMinLength = password.length >= 8;
  const passwordHasLetter = /[A-Za-z]/.test(password);
  const passwordHasNumber = /\d/.test(password);
  const passwordIsStrong = passwordHasMinLength && passwordHasLetter && passwordHasNumber;

  const setFlowStep = (nextStep: AuthStep) => {
    setStep(nextStep);
    onStepChange?.(nextStep, selectedMethod);
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

  const handleChooseMethod = (method: AuthMethodKey) => {
    setSelectedMethod(method);
    setErrorText(null);
    setSuccessText(null);
    setShowPassword(false);
    onStepChange?.("choose", method);
  };

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
    if (step !== "email-success") {
      return;
    }

    const timeout = setTimeout(() => {
      completeSuccessfulAuth();
    }, 1600);

    return () => clearTimeout(timeout);
  }, [completeSuccessfulAuth, step]);

  const submitEmailSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw error;
    }

    completeSuccessfulAuth();
  };

  const submitEmailSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error(
        "Email confirmation is still enabled in Supabase. Disable it to use instant sign-up.",
      );
    }

    setSuccessText("Account created successfully.");
    setFlowStep("email-success");
  };

  const handleContinue = async () => {
    setErrorText(null);
    setSuccessText(null);

    if (step === "choose") {
      if (selectedMethod === "email") {
        setFlowStep("email-mode");
        return;
      }

      if (selectedMethod === "phone") {
        setFlowStep("phone-name");
        return;
      }

      setFlowStep("apple-info");
      return;
    }

    if (step === "email-mode") {
      setFlowStep("email-entry");
      return;
    }

    if (step === "email-entry") {
      setFlowStep("email-password");
      return;
    }

    if (step === "phone-name") {
      setFlowStep("phone-entry");
      return;
    }

    if (selectedMethod === "email") {
      setBusy(true);
      try {
        if (step === "email-password") {
          if (emailMode === "sign-in") {
            await submitEmailSignIn();
          } else {
            setFlowStep("email-name");
          }
        } else if (step === "email-name") {
          await submitEmailSignUp();
        }
      } catch (error) {
        setErrorText(
          error instanceof Error ? error.message : "Unable to authenticate with email.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (selectedMethod === "phone") {
      if (step === "phone-entry") {
        setBusy(true);
        try {
          const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
              shouldCreateUser: true,
              data: {
                display_name: displayName.trim(),
              },
            },
          });

          if (error) {
            throw error;
          }

          setFlowStep("phone-verify");
        } catch (error) {
          setErrorText(
            error instanceof Error ? error.message : "Unable to send verification code.",
          );
        } finally {
          setBusy(false);
        }
        return;
      }

      if (step === "phone-verify") {
        setBusy(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            phone,
            token: otpCode,
            type: "sms",
          });

          if (error) {
            throw error;
          }

          completeSuccessfulAuth();
        } catch (error) {
          setErrorText(
            error instanceof Error ? error.message : "Unable to verify SMS code.",
          );
        } finally {
          setBusy(false);
        }
        return;
      }
    }

    if (selectedMethod === "apple" && step === "apple-info") {
      setBusy(true);
      try {
        if (Platform.OS !== "ios") {
          throw new Error("Apple sign-in is only available on iOS devices.");
        }

        const credentialState = await AppleAuthentication.isAvailableAsync();

        if (!credentialState) {
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
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("canceled")
        ) {
          return;
        }

        setErrorText(
          error instanceof Error ? error.message : "Unable to sign in with Apple.",
        );
      } finally {
        setBusy(false);
      }
    }
  };

  const handleBack = () => {
    setErrorText(null);
    setSuccessText(null);
    setShowPassword(false);

    switch (step) {
      case "email-mode":
      case "phone-name":
      case "apple-info":
        setFlowStep("choose");
        break;
      case "email-entry":
        setFlowStep("email-mode");
        break;
      case "email-password":
        setFlowStep("email-entry");
        break;
      case "email-name":
        setFlowStep("email-password");
        break;
      case "phone-entry":
        setFlowStep("phone-name");
        break;
      case "phone-verify":
        setFlowStep("phone-entry");
        break;
    }
  };

  const canContinue = useMemo(() => {
    if (step === "choose" || step === "email-mode" || step === "apple-info") {
      return true;
    }

    if (step === "email-entry") {
      return emailHasRequiredShape;
    }

    if (step === "email-password") {
      return emailMode === "sign-in" ? passwordHasMinLength : passwordIsStrong;
    }

    if (step === "email-name") {
      return displayName.trim().length >= 2;
    }

    if (step === "phone-name") {
      return displayName.trim().length >= 2;
    }

    if (step === "phone-entry") {
      return phone.trim().length >= 8;
    }

    if (step === "phone-verify") {
      return otpCode.trim().length >= 6;
    }

    return false;
  }, [
    displayName,
    emailHasRequiredShape,
    emailMode,
    otpCode,
    passwordHasMinLength,
    passwordIsStrong,
    phone,
    step,
  ]);

  const showFooter = step !== "email-success";
  const footerOffset = Platform.OS === "android" ? keyboardOffset : 0;

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
        <Text style={styles.title}>{getStepTitle(step, emailMode, selectedConfig?.title)}</Text>

        <Text style={styles.subtitle}>{getStepSubtitle(step, emailMode, phone)}</Text>

        <Text style={styles.reasonText}>{getReasonCopy(reason)}</Text>

        <View style={styles.formBlock}>
          {step === "choose" && (
            <View>
              {AUTH_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.key}
                  activeOpacity={0.9}
                  onPress={() => handleChooseMethod(method.key)}
                >
                  <View style={styles.option}>
                    <BlurView
                      intensity={35}
                      tint="light"
                      style={[
                        styles.optionBlur,
                        selectedMethod === method.key && styles.optionSelected,
                      ]}
                    >
                      <View style={styles.optionContent}>
                        <Ionicons name={method.icon} size={22} color="#0F172A" />
                        <View style={styles.optionTextWrap}>
                          <Text style={styles.optionTitle}>{method.title}</Text>
                          <Text style={styles.optionSubtitle}>{method.subtitle}</Text>
                        </View>
                        {selectedMethod === method.key && <View style={styles.selectedDot} />}
                      </View>
                    </BlurView>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === "email-mode" && (
            <View style={styles.form}>
              <Text style={styles.stepLabel}>Choose your email flow</Text>
              <View style={styles.modeSwitchRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.modeChip, emailMode === "sign-in" && styles.modeChipActive]}
                  onPress={() => setEmailMode("sign-in")}
                >
                  <Text style={[styles.modeChipText, emailMode === "sign-in" && styles.modeChipTextActive]}>
                    Sign in
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.modeChip, emailMode === "sign-up" && styles.modeChipActive]}
                  onPress={() => setEmailMode("sign-up")}
                >
                  <Text style={[styles.modeChipText, emailMode === "sign-up" && styles.modeChipTextActive]}>
                    Create account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === "email-entry" && (
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="anne@example.com"
              keyboardType="email-address"
              autoFocus
            />
          )}

          {step === "email-password" && (
            <View style={styles.form}>
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
              <View style={styles.passwordRulesCard}>
                <Text style={styles.passwordRulesTitle}>Password guidance</Text>
                <PasswordRule label="At least 8 characters" met={passwordHasMinLength} />
                <PasswordRule label="Contains a letter" met={passwordHasLetter} />
                <PasswordRule label="Contains a number" met={passwordHasNumber} />
              </View>
            </View>
          )}

          {step === "email-name" && (
            <Field
              label="Full name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Anne Larsen"
              autoFocus
            />
          )}

          {step === "email-success" && (
            <View style={styles.successWrap}>
              <LottieView
                autoPlay
                loop={false}
                source={require("@/assets/lottie/done/Comp 1.json")}
                style={styles.successAnimation}
              />
              <Text style={styles.successTitle}>Account created</Text>
              <Text style={styles.successBody}>
                Your ParkingPlanet account is ready. Taking you back now.
              </Text>
            </View>
          )}

          {step === "phone-name" && (
            <Field
              label="Full name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Anne Larsen"
              autoFocus
            />
          )}

          {step === "phone-entry" && (
            <Field
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+45 12 34 56 78"
              keyboardType="phone-pad"
              autoFocus
            />
          )}

          {step === "phone-verify" && (
            <Field
              label="SMS code"
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="123456"
              keyboardType="number-pad"
              autoFocus
            />
          )}

          {step === "apple-info" && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{selectedConfig?.title}</Text>
              <Text style={styles.infoBody}>
                Apple sign-in stays step-based as well. This slide explains the provider before launching the native Apple sheet.
              </Text>
            </View>
          )}
        </View>

        {errorText && <Text style={styles.errorText}>{errorText}</Text>}
        {successText && step !== "email-success" && <Text style={styles.successText}>{successText}</Text>}
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
          {step !== "choose" && (
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
              <Text style={styles.buttonText}>{getContinueLabel(step, emailMode)}</Text>
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
    minHeight: 240,
  },
  form: {
    marginBottom: 12,
  },
  stepLabel: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  modeSwitchRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  modeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  modeChipActive: {
    backgroundColor: "#0F172A",
  },
  modeChipText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  modeChipTextActive: {
    color: "#FFFFFF",
  },
  option: {
    marginBottom: 14,
  },
  optionBlur: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  optionSelected: {
    borderColor: "rgba(15,23,42,0.2)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  optionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#0F172A",
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
  infoCard: {
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  infoBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
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

function getStepTitle(step: AuthStep, emailMode: EmailMode, selectedTitle?: string) {
  switch (step) {
    case "email-mode":
      return "Email authentication";
    case "email-entry":
      return "Enter your email";
    case "email-password":
      return emailMode === "sign-in" ? "Enter your password" : "Create a password";
    case "email-name":
      return "What should we call you?";
    case "email-success":
      return "Success";
    case "phone-name":
      return "Start with your name";
    case "phone-entry":
      return "Enter your phone number";
    case "phone-verify":
      return "Verify code";
    case "apple-info":
      return selectedTitle ?? "Apple sign in";
    case "choose":
    default:
      return "Authenticate";
  }
}

function getStepSubtitle(step: AuthStep, emailMode: EmailMode, phone: string) {
  switch (step) {
    case "email-mode":
      return "Choose whether you are signing in or creating a new account. Each next slide asks for one detail only.";
    case "email-entry":
      return "We request your email first so the rest of the flow can stay focused and step-based.";
    case "email-password":
      return emailMode === "sign-in"
        ? "Enter the password for this email address."
        : "Use a strong password with at least 8 characters, one letter, and one number.";
    case "email-name":
      return "One final step. Your display name will be stored in your user profile.";
    case "email-success":
      return "Your account has been created and signed in.";
    case "phone-name":
      return "Phone auth is also progressive. We start with your name before asking for the number.";
    case "phone-entry":
      return "We will send a one-time code by SMS.";
    case "phone-verify":
      return `Enter the code sent to ${phone}.`;
    case "apple-info":
      return "Continue with the secure Apple sign-in sheet.";
    case "choose":
    default:
      return "Pick a sign-in method to continue and sync your profile.";
  }
}

function getContinueLabel(step: AuthStep, emailMode: EmailMode) {
  switch (step) {
    case "phone-entry":
      return "Send code";
    case "phone-verify":
      return "Verify";
    case "apple-info":
      return "Continue with Apple";
    case "email-password":
      return emailMode === "sign-in" ? "Sign in" : "Continue";
    case "email-name":
      return "Create account";
    case "choose":
    case "email-mode":
    case "email-entry":
    case "phone-name":
    default:
      return "Continue";
  }
}