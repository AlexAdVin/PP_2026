import { router } from "expo-router";
import FlowSplashScreen, { type FlowSplashSlide } from "@/components/hostHub/shared/FlowSplashScreen";

const heroImage = require("@/assets/img/6232c93f3ccdf.jpg");
const secondaryImage = require("@/assets/img/abstractHUB1.jpg");

const slides: FlowSplashSlide[] = [
  {
    id: "lot-intro-1",
    image: heroImage,
    title: "Now decide when the parking should be available.",
    subtitle: "This works well while you are at work, or after hours when offices, schools, and institutions are empty.",
    cards: [
      {
        id: "lot-intro-1-card-1",
        icon: "briefcase-clock-outline",
        title: "Useful for workday routines",
        body: "Make your lot available while you are away and pause it again when you need it back.",
      },
      {
        id: "lot-intro-1-card-2",
        icon: "office-building-clock-outline",
        title: "Strong for after-hours access",
        body: "Open staff or institutional parking once employees are off site and reclaim it later.",
      },
    ],
  },
  {
    id: "lot-intro-2",
    image: secondaryImage,
    title: "Every lot starts with a 12-month availability window.",
    subtitle: "That default can be changed at any time, and it keeps rolling forward automatically unless you stop it.",
    cards: [
      {
        id: "lot-intro-2-card-1",
        icon: "calendar-range-outline",
        title: "Adjust the full availability period",
        body: "Shorten it, extend it, or stop it entirely whenever your schedule changes.",
      },
      {
        id: "lot-intro-2-card-2",
        icon: "calendar-clock-outline",
        title: "Choose days and time intervals",
        body: "Select which days are open and, for those days, the exact time intervals when bookings are allowed.",
      },
    ],
  },
  {
    id: "lot-intro-3",
    image: heroImage,
    title: "Lots can vary in availability, price, and live status.",
    subtitle: "Use the listing master switch for the whole location, or pause one lot only when that single bay should be unavailable.",
    cards: [
      {
        id: "lot-intro-3-card-1",
        icon: "toggle-switch-outline",
        title: "Master switch for the entire listing",
        body: "You can switch the whole listing on or off here and later from Hosting Hub.",
      },
      {
        id: "lot-intro-3-card-2",
        icon: "car-multiple",
        title: "Granular per-lot control",
        body: "Each lot can have its own availability and hourly price, so one bay can stay private while another stays bookable.",
      },
    ],
  },
];

export default function CreateListingIntroScreen() {
  return (
    <FlowSplashScreen
      slides={slides}
      fallbackImage={heroImage}
      onComplete={() => router.replace("/host/create-listing")}
      onExit={() => router.back()}
      finalLabel="Open settings"
    />
  );
}