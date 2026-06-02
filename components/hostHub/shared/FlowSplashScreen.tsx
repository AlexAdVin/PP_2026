import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FooterBackNext from "@/components/hostHub/startListing/FooterBackNext";
import FlowProgressBar from "@/components/hostHub/shared/FlowProgressBar";

export type FlowSplashCard = {
  id: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  body: string;
};

export type FlowSplashSlide = {
  id: string;
  image?: ImageSourcePropType;
  title: string;
  subtitle: string;
  cards?: FlowSplashCard[];
};

type FlowSplashScreenProps = {
  slides: FlowSplashSlide[];
  fallbackImage: ImageSourcePropType;
  onComplete: () => void;
  onExit: () => void;
  skipLabel?: string;
  nextLabel?: string;
  finalLabel?: string;
};

export default function FlowSplashScreen({
  slides,
  fallbackImage,
  onComplete,
  onExit,
  skipLabel = "Skip intro",
  nextLabel = "Next",
  finalLabel = "Continue",
}: FlowSplashScreenProps) {
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

      <View style={styles.flex}>
        <View style={styles.heroWrap}>
          <ImageBackground source={currentSlide.image ?? fallbackImage} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
            <LinearGradient
              colors={[
                "rgba(15,23,42,0.08)",
                "rgba(15,23,42,0.22)",
                "rgba(15,23,42,0.76)",
              ]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.topBar}>
              <View />
              <Pressable onPress={onComplete} style={styles.skipButton}>
                <Text style={styles.skipLabel}>{skipLabel}</Text>
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.indicatorRow}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={[styles.indicator, index === activeSlide && styles.indicatorActive]} />
          ))}
        </View>

        <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <BlurView intensity={62} tint="light" style={styles.textCard}>
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideSubtitle}>{currentSlide.subtitle}</Text>
          </BlurView>

          {(currentSlide.cards ?? []).map((card) => (
            <BlurView key={card.id} intensity={56} tint="light" style={styles.detailCard}>
              {card.icon ? (
                <View style={styles.detailIconWrap}>
                  <MaterialCommunityIcons name={card.icon} size={20} color="#0F172A" />
                </View>
              ) : null}
              <View style={styles.detailCopy}>
                <Text style={styles.detailTitle}>{card.title}</Text>
                <Text style={styles.detailBody}>{card.body}</Text>
              </View>
            </BlurView>
          ))}
        </ScrollView>

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
  heroWrap: {
    height: "48%",
  },
  heroImage: {
    flex: 1,
  },
  heroImageStyle: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBar: {
    marginTop: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
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
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 14,
  },
  indicator: {
    height: 6,
    width: 16,
    backgroundColor: "rgba(148,163,184,0.45)",
    marginHorizontal: 4,
    borderRadius: 999,
  },
  indicatorActive: {
    width: 34,
    backgroundColor: "#0F172A",
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  textCard: {
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.48)",
    marginBottom: 14,
  },
  slideTitle: {
    color: "#0F172A",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  slideSubtitle: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  detailCard: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.42)",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    marginRight: 12,
  },
  detailCopy: {
    flex: 1,
  },
  detailTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  detailBody: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
});