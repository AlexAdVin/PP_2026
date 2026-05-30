// app/profile/index.tsx

import React, { useState } from "react";

import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import ScreenLayout from "@/components/layout/ScreenLayout";
import ProfilePassport from "@/components/layout/ProfilePassport";
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";
import PaymentMethodScreen from "@/app/modal/PaymentMethodScreen";

export default function ProfileScreen() {
  const [activeModal, setActiveModal] = useState<null | "payment">(null);
  const [paymentLabel, setPaymentLabel] = useState("Cards & billing");
  const [modalHeightPercent, setModalHeightPercent] = useState(0.55);

  const closeModal = () => setActiveModal(null);

  const handlePaymentSelect = () => {
    setActiveModal("payment");
    setModalHeightPercent(0.55);
  };

  const handlePaymentContinue = (method: string) => {
    setPaymentLabel(method);
    closeModal();
  };

  const handlePaymentStepChange = (step: "choose" | "details" | "review") => {
    switch (step) {
      case "choose":
        setModalHeightPercent(0.5);
        break;
      case "details":
        setModalHeightPercent(0.6);
        break;
      case "review":
        setModalHeightPercent(0.50);
        break;
    }
  };

  const renderModalContent = () => {
    if (activeModal === "payment") {
      return (
        <PaymentMethodScreen
          onContinue={handlePaymentContinue}
          onStepChange={handlePaymentStepChange}
        />
      );
    }

    return null;
  };

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* PASSPORT */}
        <ProfilePassport />

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <ProfileItem
            icon="person-outline"
            title="Personal details"
            subtitle="Profile information"
          />

          <ProfileItem
            icon="car-outline"
            title="Vehicles"
            subtitle="Manage your cars"
          />

          <ProfileItem
            icon="card-outline"
            title="Payments"
            subtitle={paymentLabel}
            onPress={handlePaymentSelect}
          />
        </View>

        {/* HOST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosting</Text>

          <ProfileItem
            icon="home-outline"
            title="My parking spaces"
            subtitle="Manage your listings"
          />

          <ProfileItem
            icon="stats-chart-outline"
            title="Earnings"
            subtitle="Host analytics"
          />
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <ProfileItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push & activity"
          />

          <ProfileItem
            icon="settings-outline"
            title="Settings"
            subtitle="Privacy & security"
          />
        </View>

        {/* PREMIUM CARD */}
        <BlurView intensity={40} tint="light" style={styles.premiumCard}>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond-outline" size={14} color="#fff" />

            <Text style={styles.premiumBadgeText}>ParkingPlanet+</Text>
          </View>

          <Text style={styles.premiumTitle}>
            Unlock premium parking benefits
          </Text>

          <Text style={styles.premiumText}>
            Priority spaces, smart reservations and exclusive eco rewards.
          </Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Upgrade membership</Text>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>

      {activeModal && (
        <LiquidGlassModal
          heightPercent={modalHeightPercent}
          onClose={closeModal}
        >
          {renderModalContent()}
        </LiquidGlassModal>
      )}
    </ScreenLayout>
  );
}

/* ITEM */

function ProfileItem({ icon, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <BlurView intensity={35} tint="light" style={styles.itemCard}>
        <View style={styles.itemIcon}>
          <Ionicons name={icon} size={18} color="#0F172A" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{title}</Text>

          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 140,
  },

  section: {
    marginTop: 22,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
    marginBottom: 14,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },

  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  itemSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  premiumCard: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 34,
    padding: 24,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  premiumBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  premiumTitle: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    marginTop: 18,
    letterSpacing: -1,
  },

  premiumText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 24,
    marginTop: 12,
  },

  premiumButton: {
    marginTop: 24,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
  },

  premiumButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
});
