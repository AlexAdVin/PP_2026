import React from "react";
import { Dimensions, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ListingCard from "@/components/hostHub/ListingCard";
import LiquidGlassModal from "@/components/modals/LiquidGlassModal";

const { height, width } = Dimensions.get("screen");

type HostLocationModalProps = {
  visible: boolean;
  locations: any[];
  onClose: () => void;
  onSelectLocation: (index: number) => void;
};

export default function HostLocationModal({
  visible,
  locations,
  onClose,
  onSelectLocation,
}: HostLocationModalProps) {
  const router = useRouter();
  const savedDraft = locations.find((item) => item?.isDraft);
  const publishedLocations = locations.filter((item) => !item?.isDraft);

  if (!visible) {
    return null;
  }

  const handleAddLocation = () => {
    onClose();

    InteractionManager.runAfterInteractions(() => {
      router.push("/host/start-listing-intro");
    });
  };

  const handleContinueDraft = () => {
    onClose();

    InteractionManager.runAfterInteractions(() => {
      router.push("/host/start-listing?resume=1");
    });
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <LiquidGlassModal
        heightPercent={0.68}
        onClose={onClose}
        onBackdropPress={onClose}
        titleSlot={(
          <View style={stylesModal.header}>
            <Text style={stylesModal.eyebrow}>Hosting hub</Text>
            <Text style={stylesModal.title}>Choose a place</Text>
            <Text style={stylesModal.subtitle}>Switch the active location to review revenue, reservations, and live controls.</Text>
          </View>
        )}
      >
        <View style={stylesModal.actionSlotWrap}>
          <Pressable onPress={savedDraft ? handleContinueDraft : handleAddLocation} style={stylesModal.ctaPressable}>
            <BlurView intensity={48} tint="light" style={stylesModal.ctaCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.58)", "rgba(255,255,255,0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={stylesModal.ctaGlow}
              />

              <View style={stylesModal.ctaIconWrap}>
                <Ionicons name={savedDraft ? "time-outline" : "add"} size={20} color="#0F172A" />
              </View>

              <View style={stylesModal.ctaCopy}>
                <Text style={stylesModal.ctaTitle}>{savedDraft ? (savedDraft.locName || "Unlisted parking") : "Add a new location"}</Text>
                <Text style={stylesModal.ctaSubtitle}>
                  {savedDraft
                    ? "Resume your saved unlisted draft from the exact step you left."
                    : "Start the guided host flow and publish another place."}
                </Text>
              </View>

              <View style={stylesModal.ctaArrowWrap}>
                <Ionicons name="arrow-forward" size={18} color="#0F172A" />
              </View>
            </BlurView>
          </Pressable>
        </View>

        <ScrollView
          style={{ height: height * 0.44, paddingHorizontal: width * 0.04 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {publishedLocations.map((item, index) => (
            <ListingCard
              key={item?.id ?? `${index}`}
              showLocationsList
              item={item}
              index={index}
              length={publishedLocations.length}
              onSelectLocation={onSelectLocation}
            />
          ))}
        </ScrollView>
      </LiquidGlassModal>
    </View>
  );
}

const stylesModal = StyleSheet.create({
  header: {
    paddingHorizontal: width * 0.06,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.4,
    color: "rgba(15,23,42,0.55)",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginTop: 8,
  },
  actionSlotWrap: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 18,
  },
  ctaPressable: {
    borderRadius: 28,
  },
  ctaCard: {
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.78)",
    backgroundColor: "rgba(255,255,255,0.42)",
    flexDirection: "row",
    alignItems: "center",
  },
  ctaGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    marginRight: 14,
  },
  ctaCopy: {
    flex: 1,
    paddingRight: 12,
  },
  ctaTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  ctaArrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
  },
});