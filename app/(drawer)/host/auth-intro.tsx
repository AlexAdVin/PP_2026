import { useEffect } from "react";
import { router } from "expo-router";

import FlowSplashScreen, { type FlowSplashSlide } from "@/components/hostHub/shared/FlowSplashScreen";
import { useAuthStore } from "@/src/store/authStore";

const heroImage = require("@/assets/img/6232c93f3ccdf.jpg");
const secondaryImage = require("@/assets/img/abstractHUB1.jpg");

const slides: FlowSplashSlide[] = [
  {
    id: "host-auth-intro-1",
    image: heroImage,
    title: "Hosting starts with a verified account.",
    subtitle: "Browse the hosting flow first, then authenticate before entering the host workspace.",
    cards: [
      {
        id: "host-auth-intro-1-card-1",
        icon: "shield-check-outline",
        title: "Protected host access",
        body: "Authentication lets us attach future listings, payouts, and reservations to the right account.",
      },
      {
        id: "host-auth-intro-1-card-2",
        icon: "home-city-outline",
        title: "Hosting stays modular",
        body: "The current auth record is the base for future host profiles, owned locations, and transactions.",
      },
    ],
  },
  {
    id: "host-auth-intro-2",
    image: secondaryImage,
    title: "Finish the intro, then unlock hosting.",
    subtitle: "After you skip or finish these slides, the shared auth modal will open inside the glass sheet.",
    cards: [
      {
        id: "host-auth-intro-2-card-1",
        icon: "gesture-tap-button",
        title: "Consistent modal auth",
        body: "The same modal flow is reused across search, profile access, payment confirmation, and host access.",
      },
    ],
  },
];

export default function HostAuthIntroScreen() {
  const session = useAuthStore((state) => state.session);
  const openModal = useAuthStore((state) => state.openModal);
  const setHostAuthPending = useAuthStore((state) => state.setHostAuthPending);

  useEffect(() => {
    if (session) {
      setHostAuthPending(false);
      router.replace("/host");
    }
  }, [session, setHostAuthPending]);

  const finishIntro = () => {
    if (session) {
      setHostAuthPending(false);
      router.replace("/host");
      return;
    }

    setHostAuthPending(true);
    router.replace("/host");
    openModal("host-required");
  };

  return (
    <FlowSplashScreen
      slides={slides}
      fallbackImage={heroImage}
      onComplete={finishIntro}
      onExit={finishIntro}
      finalLabel="Unlock hosting"
      skipLabel="Skip intro"
    />
  );
}