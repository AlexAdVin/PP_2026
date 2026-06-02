import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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

import { AUTH_METHODS, type AuthMethodKey } from "@/src/auth/providers";
import { supabase } from "@/src/lib/supabase";

type AuthStep = "choose" | "details" | "verify";

type Props = {
  reason: "search-limit";
  onClose: () => void;
  onStepChange?: (step: AuthStep, method?: AuthMethodKey) => void;
};

export default function AuthFlowScreen({ onClose, onStepChange }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethodKey>();
  const [step, setStep] = useState<AuthStep>("choose");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const selectedConfig = useMemo(
    () => AUTH_METHODS.find((method) => method.key === selectedMethod),
    [selectedMethod],
  );

  const setFlowStep = (nextStep: AuthStep) => {
    setStep(nextStep);
    onStepChange?.(nextStep, selectedMethod);
  };

  const handleChooseMethod = (method: AuthMethodKey) => {
    setSelectedMethod(method);
    setErrorText(null);
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      return;
    }

    if (step === "choose") {
      setFlowStep("details");
      return;
    }

    setErrorText(null);

    if (selectedMethod === "phone") {
      if (step === "details") {
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

          setFlowStep("verify");
        } catch (error) {
          setErrorText(
            error instanceof Error ? error.message : "Unable to send verification code.",
          );
        } finally {
          setBusy(false);
        }
        return;
      }

      if (step === "verify") {
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

          onClose();
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

    if (selectedMethod === "apple") {
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

        onClose();
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

    if (step === "verify") {
      setFlowStep("details");
      return;
    }

    if (step === "details") {
      setFlowStep("choose");
    }
  };

  const canContinue = useMemo(() => {
    if (!selectedMethod) {
      return false;
    }

    if (step === "choose") {
      return true;
    }

    if (selectedMethod === "phone") {
      if (step === "details") {
        return phone.trim().length >= 8 && displayName.trim().length >= 2;
      }

      if (step === "verify") {
        return otpCode.trim().length >= 6;
      }
    }

    return true;
  }, [displayName, otpCode, phone, selectedMethod, step]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === "choose" && "Authenticate"}
        {step === "details" && (selectedMethod === "phone" ? "Phone sign in" : "Apple sign in")}
        {step === "verify" && "Verify code"}
      </Text>

      <Text style={styles.subtitle}>
        {step === "choose" && "Pick a sign-in method to keep searching and sync your profile."}
        {step === "details" && selectedMethod === "phone" && "We will send a one-time code by SMS."}
        {step === "details" && selectedMethod === "apple" && "Continue with the secure Apple sign-in sheet."}
        {step === "verify" && `Enter the code sent to ${phone}.`}
      </Text>

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

      {step === "details" && selectedMethod === "phone" && (
        <View style={styles.form}>
          <Field
            label="Full name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Anne Larsen"
          />
          <Field
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+45 12 34 56 78"
            keyboardType="phone-pad"
          />
        </View>
      )}

      {step === "details" && selectedMethod === "apple" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{selectedConfig?.title}</Text>
          <Text style={styles.infoBody}>
            We use the native Apple identity token flow and then upsert your user
            profile in Supabase.
          </Text>
        </View>
      )}

      {step === "verify" && (
        <View style={styles.form}>
          <Field
            label="SMS code"
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="123456"
            keyboardType="number-pad"
          />
        </View>
      )}

      {errorText && <Text style={styles.errorText}>{errorText}</Text>}

      <View style={styles.footerButtons}>
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
            <Text style={styles.buttonText}>
              {step === "choose" && "Continue"}
              {step === "details" && selectedMethod === "phone" && "Send code"}
              {step === "details" && selectedMethod === "apple" && "Continue with Apple"}
              {step === "verify" && "Verify"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "number-pad";
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -1.4,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
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
  form: {
    marginBottom: 24,
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
  input: {
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(203,213,225,0.95)",
    paddingHorizontal: 16,
    color: "#0F172A",
    fontSize: 15,
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
  footerButtons: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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