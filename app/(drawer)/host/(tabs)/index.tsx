import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import BulletPoints from "@/components/hostHub/BulletPoints";
import HostHighlightsGrid from "@/components/hostHub/HostHighlightsGrid";
import HostLocationModal from "@/components/hostHub/HostLocationModal";
import ListingCard from "@/components/hostHub/ListingCard";
import CountUpText from "@/components/layout/premium/CountUpText";
import GlassFeatureCard from "@/components/layout/premium/GlassFeatureCard";
import PremiumHero from "@/components/layout/premium/PremiumHero";
import PremiumMetricStrip from "@/components/layout/premium/PremiumMetricStrip";
import PremiumScreen from "@/components/layout/premium/PremiumScreen";
import QuickActionCard from "@/components/layout/premium/QuickActionCard";
import SectionHeader from "@/components/layout/premium/SectionHeader";
import { selectCurrentHostLocation, selectHasHostAccess, useHostStore } from "@/src/hostStore";

const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getLocationTotals = (location: any) => {
  const lots = location?.Lots?.items ?? [];
  const transactions = lots.flatMap((lot: any) => lot?.Transactions?.items ?? []);
  const totalAgreedPrice = transactions.reduce(
    (sum: number, transaction: any) => sum + (transaction?.agreedPriceHR ?? 0),
    0,
  );

  const activeLots = lots.filter((lot: any) => lot?.avlBool !== false).length;

  return { totalAgreedPrice, totalTransactionCount: transactions.length, activeLots };
};

export default function HostHomeScreen() {
  const router = useRouter();
  const hostProfile = useHostStore((state) => state.hostProfile);
  const hostLotState = useHostStore((state) => state.hostLotState);
  const hasHostAccess = useHostStore(selectHasHostAccess);
  const showLocationsList = useHostStore((state) => state.showLocationsList);
  const setShowLocationsList = useHostStore((state) => state.setShowLocationsList);
  const selectLocation = useHostStore((state) => state.selectLocation);
  const toggleLocationActive = useHostStore((state) => state.toggleLocationActive);
  const currentLocation = useHostStore(selectCurrentHostLocation);

  const totals = useMemo(() => getLocationTotals(currentLocation), [currentLocation]);
  const selectedIndex = useHostStore((state) => state.checkedPostIndex);
  const isCurrentLocationActive = currentLocation?.isActive ?? true;
  const hostingDays = useMemo(() => {
    const lotDays = currentLocation?.Lots?.items?.flatMap((lot: any) => lot?.AvlDaysNTimes?.items ?? []) ?? [];
    return Array.from(new Set(lotDays.filter((item: any) => item?.bool).map((item: any) => item?.day))).slice(0, 4);
  }, [currentLocation]);
  const upcomingReservations = useMemo(() => {
    const now = new Date();
    return (currentLocation?.Lots?.items ?? [])
      .flatMap((lot: any) => lot?.Transactions?.items ?? [])
      .filter((transaction: any) => new Date(transaction.startBooking) > now).length;
  }, [currentLocation]);

  const highlights = useMemo(
    () => [
      {
        title: "Guest messages",
        icon: "chatbox-ellipses-outline" as const,
        count: 3,
      },
      {
        title: "Payout",
        icon: "trending-up" as const,
        count: formatCurrency(totals.totalAgreedPrice),
      },
      {
        title: "Reservations",
        icon: "calendar-outline" as const,
        count: totals.totalTransactionCount,
        onPress: () => router.push("/host/reservations"),
      },
      {
        title: "Lot Settings",
        icon: "ellipsis-vertical-circle-outline" as const,
        count: "Modify",
        onPress: () => router.push("/host/update-avl"),
      },
    ],
    [router, totals.totalAgreedPrice, totals.totalTransactionCount],
  );

  const quickActions = useMemo(
    () => [
      {
        icon: isCurrentLocationActive ? "pause-circle-outline" : "play-circle-outline",
        label: isCurrentLocationActive ? "Pause listing" : "Resume listing",
        subtitle: isCurrentLocationActive ? "Switch this location off instantly" : "Make this location bookable again",
        onPress: () => toggleLocationActive(selectedIndex),
        accent: isCurrentLocationActive ? "rgba(254,226,226,0.72)" : "rgba(220,252,231,0.72)",
      },
      {
        icon: "time-outline",
        label: "Availability",
        subtitle: "Adjust date and time windows per lot",
        onPress: () => router.push("/host/update-avl"),
        accent: "rgba(219,234,254,0.72)",
      },
      {
        icon: "chatbubble-ellipses-outline",
        label: "Guest chats",
        subtitle: "Reply quickly to the latest parking requests",
        onPress: () => Alert.alert("Guest chats", "Chat inbox is the next host surface to wire into the hub."),
        accent: "rgba(243,232,255,0.72)",
      },
      {
        icon: "receipt-outline",
        label: "Reservations",
        subtitle: `${upcomingReservations} upcoming stays waiting for review`,
        onPress: () => router.push("/host/reservations"),
        accent: "rgba(254,249,195,0.72)",
      },
    ],
    [isCurrentLocationActive, router, selectedIndex, toggleLocationActive, upcomingReservations],
  );

  if (!hasHostAccess) {
    return (
      <PremiumScreen imageBackground={imageBackground}>
        <PremiumHero
          imageSource={imageBackground}
          eyebrow={hostProfile.hostSub ? "Hosting hub" : "Private hosts · Institutions · Homes"}
          title={"Share your empty\nparking beautifully."}
          subtitle="Set when your space is available, accept guests on your terms, and turn quiet hours into premium income."
          heightPercent={0.5}
        >
          <View style={stylesScreen.heroMetricWrap}>
            <PremiumMetricStrip
              dark
              metrics={[
                { value: "5 min", label: "To list" },
                { value: "Full", label: "Availability control" },
                { value: "Weekly", label: "Payout rhythm" },
              ]}
            />
          </View>
        </PremiumHero>

        <GlassFeatureCard
          icon="sparkles-outline"
          title="Start sharing your location"
          subtitle="Create a polished listing, define when it is open, and return here to manage revenue, reservations, and live status."
          onPress={() => router.push("/host/start-listing")}
          trailingLabel="Start"
        />

        <View style={stylesScreen.section}>
          <SectionHeader title="Why hosts love it" />
          <View style={stylesScreen.bulletGrid}>
            {[
              "Pause a location in one tap when you come home.",
              "Offer evening, weekend, or holiday-only availability.",
              "Manage households, yards, garages, and after-hours institutional lots.",
            ].map((bullet) => (
              <View key={bullet} style={stylesScreen.bulletCard}>
                <BulletPoints />
                <Text style={stylesScreen.bulletLabel}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={stylesScreen.section}>
          <SectionHeader title="Hosting promise" />
          <View style={stylesScreen.quickRow}>
            <QuickActionCard
              icon="calendar-outline"
              label="Choose the hours"
              subtitle="Only open your parking when you want guests."
              accent="rgba(219,234,254,0.72)"
            />
            <QuickActionCard
              icon="cash-outline"
              label="See the value"
              subtitle="Track performance and revenue from the same hub."
              accent="rgba(220,252,231,0.72)"
            />
          </View>
        </View>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen imageBackground={imageBackground}>
      <PremiumHero
        imageSource={imageBackground}
        eyebrow={`${currentLocation?.locName ?? "Hosting hub"} · ${currentLocation?.type ?? "Private host"}`}
        title={"Premium hosting,\none location at a time."}
        subtitle={`Control availability, understand revenue, and respond to guests without leaving the hosting hub. ${hostingDays.length ? `Most available on ${hostingDays.join(", ")}.` : "Set your first availability window today."}`}
        heightPercent={0.52}
      >
        <View style={stylesScreen.heroRevenueCard}>
          <Text style={stylesScreen.heroRevenueEyebrow}>Revenue from this location</Text>
          <CountUpText
            value={totals.totalAgreedPrice}
            formatter={formatCurrency}
            style={stylesScreen.heroRevenueValue}
          />
          <Text style={stylesScreen.heroRevenueSubtext}>
            {isCurrentLocationActive ? "Live and bookable now" : "Currently paused by host"}
          </Text>
        </View>
      </PremiumHero>

      <View style={stylesScreen.metricWrap}>
        <PremiumMetricStrip
          metrics={[
            { value: `${totals.activeLots}`, label: "Active lots" },
            { value: `${totals.totalTransactionCount}`, label: "Reservations" },
            { value: isCurrentLocationActive ? "Live" : "Paused", label: "Status" },
          ]}
        />
      </View>

      <View style={stylesScreen.locationCardWrap}>
        <ListingCard
          length={hostLotState.locations.length}
          item={currentLocation}
          onOpenLocations={() => setShowLocationsList(true)}
        />
      </View>

      <View style={stylesScreen.section}>
        <SectionHeader title="Quick actions" actionLabel="New listing" onPressAction={() => router.push("/host/start-listing")} />
        <View style={stylesScreen.quickRow}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              icon={action.icon}
              label={action.label}
              subtitle={action.subtitle}
              onPress={action.onPress}
              accent={action.accent}
            />
          ))}
        </View>
      </View>

      <View style={stylesScreen.section}>
        <SectionHeader title="Hosting snapshot" actionLabel="See reservations" onPressAction={() => router.push("/host/reservations")} />
        <HostHighlightsGrid highlights={highlights} />
        <View style={stylesScreen.featureStack}>
          <GlassFeatureCard
            icon="calendar-clear-outline"
            title="Availability rhythm"
            subtitle={hostingDays.length ? `${hostingDays.join(", ")} are currently open for booking.` : "No repeating availability windows configured yet."}
            onPress={() => router.push("/host/update-avl")}
            trailingLabel="Edit"
          />
          <GlassFeatureCard
            icon="sparkles-outline"
            title="Hosting notes"
            subtitle={isCurrentLocationActive ? "Guests can request this location right now. Keep times accurate to avoid manual changes later." : "This place is hidden from guests until you resume it from the hosting hub."}
            onPress={() => Alert.alert("Hosting notes", "Pricing tips and message templates can be added as the next host iteration.")}
            trailingLabel="Learn"
          />
        </View>
      </View>

      <HostLocationModal
        visible={showLocationsList}
        locations={hostLotState.locations}
        onClose={() => setShowLocationsList(false)}
        onSelectLocation={selectLocation}
      />
    </PremiumScreen>
  );
}

const stylesScreen = StyleSheet.create({
  heroRevenueCard: {
    marginTop: 26,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroRevenueEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heroRevenueValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 8,
    letterSpacing: -1.2,
  },
  heroRevenueSubtext: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    marginTop: 6,
  },
  heroMetricWrap: {
    marginTop: 24,
  },
  metricWrap: {
    marginHorizontal: 24,
    marginTop: -38,
  },
  locationCardWrap: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  quickRow: {
    flexDirection: "row",
  },
  featureStack: {
    gap: 16,
    marginTop: 16,
  },
  bulletGrid: {
    gap: 14,
  },
  bulletCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
  },
  bulletLabel: {
    color: "#0F172A",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
});