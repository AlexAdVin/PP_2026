// PaymentMethodScreen.tsx

import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

import { BlurView } from "expo-blur";

import { Ionicons } from "@expo/vector-icons";

type PaymentMethod = "apple" | "mobilepay" | "card";

type Props = {
  onContinue: (paymentLabel: string) => void;
  onStepChange?: (step: "choose" | "details" | "review") => void;
};

export default function PaymentMethodScreen({
  onContinue,
  onStepChange,
}: Props) {
  const [selected, setSelected] = useState<PaymentMethod>();
  const [step, setStep] = useState<"choose" | "details" | "review">("choose");
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("John Doe");

  const methods = [
    {
      key: "apple" as PaymentMethod,
      title: "Apple Pay",
      icon: "logo-apple",
    },
    {
      key: "mobilepay" as PaymentMethod,
      title: "MobilePay",
      icon: "phone-portrait-outline",
    },
    {
      key: "card" as PaymentMethod,
      title: "Card",
      icon: "card-outline",
    },
  ];

  const selectedMethod = methods.find((method) => method.key === selected);
  const cardMask = cardNumber.slice(-4).padStart(4, "•");
  const paymentLabel =
    selected === "card"
      ? `Visa •••• ${cardMask}`
      : (selectedMethod?.title ?? "Card");

  const canContinueToNext = () => {
    if (!selected) return false;
    if (step === "details") {
      return (
        cardNumber.length >= 12 &&
        expiry.length > 3 &&
        cvc.length >= 3 &&
        name.length > 0
      );
    }
    return true;
  };

  const handleNext = () => {
    if (!selected) return;

    const nextStep =
      selected === "card" && step === "choose" ? "details" : "review";
    setStep(nextStep);
    onStepChange?.(nextStep);
  };

  const handlePay = () => {
    onContinue(paymentLabel);
  };

  const handleBack = () => {
    const previousStep =
      step === "review"
        ? selected === "card"
          ? "details"
          : "choose"
        : "choose";
    setStep(previousStep);
    onStepChange?.(previousStep);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === "choose" && "Payment"}
        {step === "details" && "Add card details"}
        {step === "review" && "Review"}
      </Text>

      <Text style={styles.subtitle}>
        {step === "choose" && "Choose payment method"}
        {step === "details" && "Enter your card information"}
        {step === "review" && `Pay with ${paymentLabel}`}
      </Text>

      {step === "choose" &&
        methods.map((method) => (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.9}
            onPress={() => setSelected(method.key)}
          >
            <View style={styles.option}>
              <BlurView
                intensity={35}
                tint="light"
                style={[selected === method.key && styles.optionSelected]}
              >
                <View style={styles.content}>
                  <Ionicons
                    name={method.icon as any}
                    size={22}
                    color="#0F172A"
                  />
                  <Text style={styles.optionText}>{method.title}</Text>
                  {selected === method.key && (
                    <View style={styles.selectedDot} />
                  )}
                </View>
              </BlurView>
            </View>
          </TouchableOpacity>
        ))}

      {step === "details" && selected === "card" && (
        <View style={styles.detailsForm}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Card number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              style={styles.input}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.fieldLabel}>Expiry</Text>
              <TextInput
                value={expiry}
                onChangeText={setExpiry}
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.fieldLabel}>CVC</Text>
              <TextInput
                value={cvc}
                onChangeText={setCvc}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name on card</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      )}

      {step === "review" && (
        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Method</Text>
            <Text style={styles.reviewValue}>{paymentLabel}</Text>
          </View>

          {selected === "card" && (
            <>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Card holder</Text>
                <Text style={styles.reviewValue}>{name}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Expires</Text>
                <Text style={styles.reviewValue}>{expiry}</Text>
              </View>
            </>
          )}

          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Amount</Text>
            <Text style={styles.reviewValue}>$0.00</Text>
          </View>
        </View>
      )}

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
          disabled={!selected || !canContinueToNext()}
          style={[
            styles.button,
            (!selected || !canContinueToNext()) && { opacity: 0.5 },
          ]}
          onPress={step === "review" ? handlePay : handleNext}
        >
          <Text style={styles.buttonText}>
            {step === "choose" &&
              (selected === "card" ? "Continue" : "Continue")}
            {step === "details" && "Review"}
            {step === "review" && "Pay"}
          </Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
  },

  option: {
    height: 68,
    borderRadius: 26,
    paddingHorizontal: 20,
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionSelected: {
    borderColor: "rgba(15,23,42,0.18)",
  },

  optionText: {
    marginLeft: 16,

    fontSize: 16,
    fontWeight: "600",

    color: "#0F172A",
  },

  selectedDot: {
    marginLeft: "auto",

    width: 10,
    height: 10,
    borderRadius: 999,

    backgroundColor: "#0F172A",
  },

  detailsForm: {
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

  row: {
    flexDirection: "row",
  },

  halfField: {
    flex: 1,
  },

  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },

  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  reviewLabel: {
    color: "#475569",
    fontSize: 14,
  },

  reviewValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },

  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.45)",
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
    marginTop: "auto",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "#0F172A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
