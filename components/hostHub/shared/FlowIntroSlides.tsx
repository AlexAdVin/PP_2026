import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterBackNext from "@/components/hostHub/startListing/FooterBackNext";
import AmbientBackground from "@/components/layout/AmbientBackground";
import PremiumHero from "@/components/layout/premium/PremiumHero";
import FlowProgressBar from "@/components/hostHub/shared/FlowProgressBar";

export type FlowIntroCard = {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  body: string;
};

export type FlowIntroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  chips?: string[];
  cards: FlowIntroCard[];
};

type FlowIntroSlidesProps = {
  slides: FlowIntroSlide[];
  imageBackground: any;
  onComplete: () => void;
  onExit: () => void;
  skipLabel?: string;
  nextLabel?: string;
  finalLabel?: string;
};

export default function FlowIntroSlides({
  slides,
  imageBackground,
  onComplete,
  onExit,
  skipLabel = "Skip intro",
  nextLabel = "Next",
  finalLabel = "Continue",
}: FlowIntroSlidesProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = slides[activeSlide];
  const isLastSlide = activeSlide === slides.length - 1;
  const progress = useMemo(
    () => (slides.length > 1 ? (activeSlide / (slides.length - 1)) * 100 : 100),
    [activeSlide, slides.length],
  );

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }

    setActiveSlide((current) => current + 1);
  };

  const handleBack = () => {
    if (activeSlide === 0) {
      onExit();
      return;
    }

    setActiveSlide((current) => current - 1);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={["#EEF2F5", "#F8FAFC", "#FFFFFF"]} style={StyleSheet.absoluteFill} />
      <AmbientBackground imageBackground={imageBackground} />

      <View style={styles.flex}>
        <View style={styles.contentWrap}>
          <PremiumHero
            imageSource={imageBackground}
            eyebrow={currentSlide.eyebrow}
            title={currentSlide.title}
            subtitle={currentSlide.subtitle}
            heightPercent={0.34}
            topBar={
              <>
                <View style={styles.topBarSpacer} />
                <Pressable onPress={onComplete} style={styles.skipButton}>
                  <Text style={styles.skipLabel}>{skipLabel}</Text>
                </Pressable>
              </>
            }
          />

          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {(currentSlide.chips ?? []).map((chip) => (
                <BlurView key={chip} tint="light" intensity={48} style={styles.chipPill}>
                  <Text style={styles.chipText}>{chip}</Text>
                </BlurView>
              ))}
            </View>

            {currentSlide.cards.map((card) => (
              <BlurView key={card.id} tint="light" intensity={52} style={styles.card}>
                <View style={styles.cardIconWrap}>
                  <MaterialCommunityIcons name={card.icon} size={24} color="#0F172A" />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardBody}>{card.body}</Text>
                </View>
              </BlurView>
            ))}
          </ScrollView>
        </View>

        <FlowProgressBar progress={progress} />
        <FooterBackNext
          handlePrev={handleBack}
          handleNext={handleNext}
          activeSlide={activeSlide}
          isLastSlide={isLastSlide}
          nextLabel={nextLabel}
          finalLabel={finalLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flex: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingTop: 24,
  },
  topBarSpacer: {
    width: 1,
  },
  skipButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
  },
  skipLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  chipPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.44)",
  },
  chipText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    width: "100%",
    minHeight: 104,
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.48)",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    marginRight: 14,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardBody: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
  },
});