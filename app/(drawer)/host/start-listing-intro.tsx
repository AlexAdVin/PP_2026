import { router } from "expo-router";
import FlowSplashScreen, { type FlowSplashSlide } from "@/components/hostHub/shared/FlowSplashScreen";

const heroImage = require("@/assets/img/6232c93f3ccdf.jpg");
const secondaryImage = require("@/assets/img/abstractHUB1.jpg");

const slides: FlowSplashSlide[] = [
  {
    id: "start-intro-1",
    image: heroImage,
    title: "Start-listing is quick by design.",
    subtitle: "You only set the essentials first: parking type, address, lot count, hourly price, and a strong name.",
    cards: [
      {
        id: "start-intro-1-card-1",
        icon: "timer-sand",
        title: "Fast path into the host flow",
        body: "Get the listing basics in place first, then move into lot settings after the core details are ready.",
      },
      {
        id: "start-intro-1-card-2",
        icon: "content-save-outline",
        title: "Save & Exit stays available",
        body: "You can pause anytime and return to the exact step you left.",
      },
    ],
  },
  {
    id: "start-intro-2",
    image: secondaryImage,
    title: "Set a confident price and a memorable name.",
    subtitle: "A clear hourly rate and an attractive title make the listing easier to trust and easier to compare.",
    cards: [
      {
        id: "start-intro-2-card-1",
        icon: "cash-fast",
        title: "Start with one strong hourly rate",
        body: "You can fine-tune the price per lot later if some spaces deserve a premium.",
      },
      {
        id: "start-intro-2-card-2",
        icon: "lightbulb-on-outline",
        title: "Suggestions can help",
        body: "If you are unsure, we can nudge useful names and keep the setup feeling lightweight.",
      },
    ],
  },
];

export default function StartListingIntroScreen() {
  return (
    <FlowSplashScreen
      slides={slides}
      fallbackImage={heroImage}
      onComplete={() => router.replace("/host/start-listing")}
      onExit={() => router.replace("/host")}
      finalLabel="Start setup"
    />
  );
}