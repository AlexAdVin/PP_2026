import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BulletPoints from "@/components/hostHub/BulletPoints";
import HostFooterButton from "@/components/hostHub/HostFooterButton";
import HostHighlightsGrid from "@/components/hostHub/HostHighlightsGrid";
import HostLocationModal from "@/components/hostHub/HostLocationModal";
import HostTitle from "@/components/hostHub/HostTitle";
import ListingCard from "@/components/hostHub/ListingCard";
import CountUpText from "@/components/layout/premium/CountUpText";
import ContinueActionCard from "@/components/layout/premium/ContinueActionCard";
import PremiumHero from "@/components/layout/premium/PremiumHero";
import PremiumScreen from "@/components/layout/premium/PremiumScreen";
import QuickActionCard from "@/components/layout/premium/QuickActionCard";
import SectionHeader from "@/components/layout/premium/SectionHeader";
import { hostDatabaseAdapter } from "@/src/adapters/hostDatabaseAdapter";
import { mapSavedListingDraftToPreview, selectCurrentHostLocation, selectHasHostAccess, useHostStore } from "@/src/hostStore";

const imageBackground = require("@/assets/img/6232c93f3ccdf.jpg");

const hostContent = [
  {
    id: "1",
    q: "We are here to help",
    ph: "Chat with us",
    ic: "rocketchat",
  },
  {
    id: "2",
    q: "Resources and tips",
    ph: "How to get paid",
    ic: "hand-holding-usd",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatElapsedTime = (savedAt?: string) => {
  if (!savedAt) {
    return "Started recently";
  }

  const elapsed = Date.now() - new Date(savedAt).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < hour) {
    const minutes = Math.max(1, Math.round(elapsed / minute));
    return `Started ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (elapsed < day) {
    const hours = Math.max(1, Math.round(elapsed / hour));
    return `Started ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.max(1, Math.round(elapsed / day));
  return `Started ${days} day${days === 1 ? "" : "s"} ago`;
};

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
  const hydrateHostData = useHostStore((state) => state.hydrateHostData);
  const hostLotState = useHostStore((state) => state.hostLotState);
  const hasHostAccess = useHostStore(selectHasHostAccess);
  const savedListingDraft = useHostStore((state) => state.savedListingDraft);
  const showLocationsList = useHostStore((state) => state.showLocationsList);
  const setShowLocationsList = useHostStore((state) => state.setShowLocationsList);
  const selectLocation = useHostStore((state) => state.selectLocation);
  const toggleLocationActive = useHostStore((state) => state.toggleLocationActive);
  const hydrateSavedListingDraft = useHostStore((state) => state.hydrateSavedListingDraft);
  const hasHydratedSavedListingDraft = useHostStore((state) => state.hasHydratedSavedListingDraft);
  const currentLocation = useHostStore(selectCurrentHostLocation);
  const savedDraftPreview = useMemo(() => mapSavedListingDraftToPreview(savedListingDraft), [savedListingDraft]);

  useEffect(() => {
    let isMounted = true;

    const hydrateMockDatabase = async () => {
      if (hostLotState.locations?.length) {
        return;
      }

      const payload = await hostDatabaseAdapter.fetchHostData();

      if (isMounted) {
        hydrateHostData(payload);
      }
    };

    void hydrateMockDatabase();

    return () => {
      isMounted = false;
    };
  }, [hostLotState.locations?.length, hydrateHostData]);

  useEffect(() => {
    void hydrateSavedListingDraft();
  }, [hydrateSavedListingDraft]);

  const totals = useMemo(() => getLocationTotals(currentLocation), [currentLocation]);
  const selectedIndex = useHostStore((state) => state.checkedPostIndex);
  const isCurrentLocationActive = currentLocation?.isActive ?? true;
  const hostName = hostProfile.hostName || "welcome back";
  const hasListedLocations = (hostLotState.locations?.length ?? 0) > 0;
  const displayedLocations = useMemo(
    () => (savedDraftPreview ? [...(hostLotState.locations ?? []), savedDraftPreview] : hostLotState.locations ?? []),
    [hostLotState.locations, savedDraftPreview],
  );
  const activeLocations = useMemo(
    () => (hostLotState.locations ?? []).filter((location: any) => location?.isActive ?? true).length,
    [hostLotState.locations],
  );
  const totalLots = useMemo(
    () => (hostLotState.locations ?? []).reduce((sum: number, location: any) => sum + Number(location?.nrOfLots ?? location?.Lots?.items?.length ?? 0), 0),
    [hostLotState.locations],
  );

  const highlights = useMemo(
    () => [
      {
        title: "Chats to answer",
        icon: "chatbox-ellipses-outline" as const,
        count: 3,
      },
      {
        title: "Revenue",
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
    ],
    [isCurrentLocationActive, router, selectedIndex, toggleLocationActive],
  );

  const openDraft = () => {
    router.push("/host/start-listing?resume=1");
  };

  if (!hasListedLocations && hasHydratedSavedListingDraft && savedDraftPreview) {
    return (
      <View style={stylesScreen.screen}>
        <PremiumScreen imageBackground={imageBackground}>
          <PremiumHero
            imageSource={imageBackground}
            eyebrow="Hosting hub"
            title="Continue listing"
            subtitle="Your draft is saved securely. Resume the exact step you left and finish publishing when ready."
            heightPercent={0.34}
          />

          <View style={stylesScreen.metricStripWrap}>
            <ContinueActionCard
              eyebrow="Continue listing"
              title={savedDraftPreview.locName || "Unlisted parking"}
              subtitle={formatElapsedTime(savedDraftPreview.savedAt)}
              onPress={openDraft}
            />
          </View>
        </PremiumScreen>
      </View>
    );
  }

  if (!hasHostAccess) {
    return (
      <View style={stylesScreen.screen}>
        <PremiumScreen imageBackground={imageBackground}>
          <HostTitle title={"Make your\nparking\navailable\n & earn extra\nevery day"} />

          <View style={stylesScreen.emptyStateWrap}>
            <Text style={stylesScreen.emptyStateTitle}>Let others park when you are not there.</Text>
            <View style={stylesScreen.emptyBulletWrap}>
              <BulletPoints />
            </View>
            <HostFooterButton label="Start sharing" onPress={() => router.push("/host/start-listing")} />
            <TouchableOpacity
              style={stylesScreen.secondaryButton}
              activeOpacity={0.85}
              onPress={() => router.push("/host/start-listing")}
            >
              <Text style={stylesScreen.secondaryButtonText}>Tell someone</Text>
            </TouchableOpacity>
          </View>
        </PremiumScreen>
      </View>
    );
  }

  return (
    <View style={stylesScreen.screen}>
      <PremiumScreen imageBackground={imageBackground}>
        <PremiumHero
          imageSource={imageBackground}
          eyebrow="Hosting hub"
          title="Welcome back"
          subtitle=""
          heightPercent={0.34}
        >
          <View style={stylesScreen.heroHeaderStack}>
            <CountUpText
              value={totals.totalAgreedPrice}
              formatter={formatCurrency}
              style={stylesScreen.heroRevenueValue}
            />
            <Text style={stylesScreen.heroRevenueDescriptor}>total revenue</Text>
            <Text style={stylesScreen.heroLocationMeta}>
              {currentLocation?.locName ?? hostName} selected
            </Text>
          </View>
        </PremiumHero>

        <View style={stylesScreen.metricStripWrap}>
          <BlurView intensity={50} tint="light" style={stylesScreen.metricStrip}>
            <View style={stylesScreen.metricItem}>
              <Text style={stylesScreen.metricValue}>{activeLocations}</Text>
              <Text style={stylesScreen.metricLabel}>Live locations</Text>
            </View>
            <View style={stylesScreen.metricDivider} />
            <View style={stylesScreen.metricItem}>
              <Text style={stylesScreen.metricValue}>{totalLots}</Text>
              <Text style={stylesScreen.metricLabel}>Total lots</Text>
            </View>
            <View style={stylesScreen.metricDivider} />
            <View style={stylesScreen.metricItem}>
              <Text style={stylesScreen.metricValue}>{totals.totalTransactionCount}</Text>
              <Text style={stylesScreen.metricLabel}>Bookings</Text>
            </View>
          </BlurView>
        </View>

        <View style={stylesScreen.locationCardWrap}>
          <ListingCard
            length={displayedLocations.length}
            item={currentLocation}
            onOpenLocations={() => setShowLocationsList(true)}
          />
        </View>

        <View style={stylesScreen.gridWrap}>
          <HostHighlightsGrid highlights={highlights} />
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
          {hostContent.map((entry) => (
            <View key={entry.id} style={stylesScreen.hostContentBlock}>
              <Text style={stylesScreen.hostContentLabel}>{entry.q}</Text>
              <TouchableOpacity activeOpacity={0.9} style={stylesScreen.hostContentCard}>
                <BlurView intensity={55} tint="light" style={stylesScreen.hostContentBlur}>
                  <View style={stylesScreen.hostContentIconWrap}>
                    <FontAwesome5 name={entry.ic} size={18} style={stylesScreen.hostContentIcon} />
                  </View>
                  <Text style={stylesScreen.hostContentText}>{entry.ph}</Text>
                  <Entypo name="chevron-thin-right" size={16} style={stylesScreen.hostContentChevron} />
                </BlurView>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <LinearGradient
          colors={["#DDF5E8", "#F4FBF7", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={stylesScreen.impactCard}
        >
          <View style={stylesScreen.impactGlow} />

          <View style={stylesScreen.impactTopRow}>
            <View>
              <Text style={stylesScreen.impactEyebrow}>Sustainability impact</Text>
              <Text style={stylesScreen.impactTitle}>Your forest is growing 🌲</Text>
            </View>

            <BlurView intensity={40} tint="light" style={stylesScreen.impactBadge}>
              <Ionicons name="leaf" size={14} color="#22C55E" />
              <Text style={stylesScreen.impactBadgeText}>+12%</Text>
            </BlurView>
          </View>

          <Text style={stylesScreen.impactText}>One more parking away from planting your next tree.</Text>

          <View style={stylesScreen.progressWrapper}>
            <View style={stylesScreen.progressBar}>
              <LinearGradient
                colors={["#22C55E", "#4ADE80"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={stylesScreen.progressFill}
              />
            </View>

            <Text style={stylesScreen.progressText}>70%</Text>
          </View>

          <View style={stylesScreen.impactStats}>
            <View>
              <Text style={stylesScreen.impactStatValue}>3</Text>
              <Text style={stylesScreen.impactStatLabel}>Trees planted</Text>
            </View>
            <View>
              <Text style={stylesScreen.impactStatValue}>2.4kg</Text>
              <Text style={stylesScreen.impactStatLabel}>CO₂ offset</Text>
            </View>
            <View>
              <Text style={stylesScreen.impactStatValue}>18</Text>
              <Text style={stylesScreen.impactStatLabel}>Eco trips</Text>
            </View>
          </View>
        </LinearGradient>
      </PremiumScreen>

      <HostLocationModal
        visible={showLocationsList}
        locations={displayedLocations}
        onClose={() => setShowLocationsList(false)}
        onSelectLocation={(index) => {
          if (savedDraftPreview && index >= (hostLotState.locations?.length ?? 0)) {
            setShowLocationsList(false);
            openDraft();
            return;
          }

          selectLocation(index);
        }}
      />
    </View>
  );
}

const stylesScreen = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroHeaderStack: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  heroRevenueValue: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1.4,
  },
  heroRevenueDescriptor: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  heroLocationMeta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 10,
    letterSpacing: -1.2,
  },
  metricStripWrap: {
    marginHorizontal: 24,
    marginTop: -34,
    zIndex: 2,
  },
  metricStrip: {
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  metricDivider: {
    width: 1,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  locationCardWrap: {
    marginTop: 14,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  gridWrap: {
    marginTop: 6,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  quickRow: {
    flexDirection: "row",
  },
  emptyStateWrap: {
    marginTop: 24,
    marginHorizontal: 20,
    minHeight: 360,
    padding: 24,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  emptyStateTitle: {
    alignSelf: "flex-start",
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 10,
    color: "white",
  },
  emptyBulletWrap: {
    marginTop: 10,
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
  hostContentBlock: {
    marginBottom: 18,
  },
  hostContentLabel: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 6,
  },
  hostContentCard: {
    borderRadius: 26,
    overflow: "hidden",
  },
  hostContentBlur: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.44)",
  },
  hostContentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  hostContentIcon: {
    color: "#0F172A",
  },
  hostContentText: {
    flex: 1,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  hostContentChevron: {
    color: "#0F172A",
  },
  impactCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 34,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  impactGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    top: -80,
    right: -40,
  },
  impactTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  impactEyebrow: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  impactTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.8,
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  impactBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },
  impactText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 24,
    color: "#475569",
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    width: "70%",
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.06)",
  },
  impactStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  impactStatLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
});