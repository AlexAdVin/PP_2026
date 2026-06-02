import { router } from "expo-router";
import FlowSplashScreen, { type FlowSplashSlide } from "@/components/hostHub/shared/FlowSplashScreen";
import { appIntroAdapter } from "@/src/adapters/appIntroAdapter";

const heroImage = require("@/assets/img/6232c93f3ccdf.jpg");
const secondaryImage = require("@/assets/img/abstractHUB1.jpg");

const slides: FlowSplashSlide[] = [
  {
    id: "welcome-1",
    image: heroImage,
    title: "Beautiful parking. Seamlessly shared.",
    subtitle: "Find curated spaces from trusted hosts, or turn your own empty parking into a useful local asset.",
    cards: [
      {
        id: "welcome-1-card-1",
        icon: "magnify",
        title: "Explore as a driver",
        body: "Search nearby parking with a premium, flexible, and instant booking experience.",
      },
      {
        id: "welcome-1-card-2",
        icon: "home-city-outline",
        title: "Share as a host",
        body: "Let others park when you are away and turn unused space into recurring income.",
      },
    ],
  },
  {
    id: "welcome-2",
    image: secondaryImage,
    title: "Set up fast, then refine as you go.",
    subtitle: "The host flow starts lightweight, then helps you tune pricing, availability, and lot-level settings only when you need them.",
    cards: [
      {
        id: "welcome-2-card-1",
        icon: "cash-fast",
        title: "Strong first setup",
        body: "Start with a clear name and a confident price, then improve details later without losing momentum.",
      },
      {
        id: "welcome-2-card-2",
        icon: "calendar-clock-outline",
        title: "Availability stays flexible",
        body: "Open spaces while you are at work, after hours, or only on selected days and times.",
      },
    ],
  },
];

export default function WelcomeScreen() {
  return (
    <FlowSplashScreen
      slides={slides}
      fallbackImage={heroImage}
      onComplete={async () => {
        await appIntroAdapter.markAppIntroSeen();
        router.replace("/");
      }}
      onExit={async () => {
        await appIntroAdapter.markAppIntroSeen();
        router.replace("/");
      }}
      finalLabel="Enter app"
    />
  );
}