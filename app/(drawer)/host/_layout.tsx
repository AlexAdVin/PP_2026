import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useNavigation, usePathname, useRouter } from "expo-router";
import CountUpText from "@/components/layout/premium/CountUpText";
import { selectCurrentHostLocation, useHostStore } from "@/src/hostStore";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount || 0);

function HeaderLeft() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerButton}>
      <Ionicons name="menu" size={22} color="rgba(255,255,255,0.92)" />
    </TouchableOpacity>
  );
}

function HeaderRight() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/profile")} style={styles.headerButton}>
      <Ionicons name="person-outline" size={21} color="rgba(255,255,255,0.92)" />
    </TouchableOpacity>
  );
}

function HostStackHeaderTitle() {
  const pathname = usePathname();
  const currentLocation = useHostStore(selectCurrentHostLocation);

  const totals = useMemo(() => {
    const lots = currentLocation?.Lots?.items ?? [];
    const transactions = lots.flatMap((lot: any) => lot?.Transactions?.items ?? []);
    return transactions.reduce(
      (sum: number, transaction: any) => sum + (transaction?.agreedPriceHR ?? 0),
      0,
    );
  }, [currentLocation]);

  if (pathname === "/host") {
    return (
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerEyebrow}>Welcome back</Text>
        <View style={styles.headerRevenueRow}>
          <Text numberOfLines={1} style={styles.headerLocationLabel}>
            {currentLocation?.locName ?? "Hosting hub"}
          </Text>
          <CountUpText value={totals} formatter={formatCurrency} style={styles.headerRevenueValue} />
        </View>
      </View>
    );
  }

  const labelMap: Record<string, { title: string; subtitle: string }> = {
    "/host/calendar": {
      title: "Host Calendar",
      subtitle: currentLocation?.locName ?? "Availability windows",
    },
    "/host/reservations": {
      title: "Reservations",
      subtitle: currentLocation?.locName ?? "Active bookings",
    },
  };

  const label = labelMap[pathname] ?? {
    title: "Hosting hub",
    subtitle: currentLocation?.locName ?? "Private host",
  };

  return (
    <View style={styles.headerTitleWrap}>
      <Text numberOfLines={1} style={styles.headerTitle}>{label.title}</Text>
      <Text numberOfLines={1} style={styles.headerSubtitle}>{label.subtitle}</Text>
    </View>
  );
}

export default function HostStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerTransparent: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "rgba(15,23,42,0.78)",
          },
          headerBackground: () => (
            <BlurView tint="dark" intensity={42} style={StyleSheet.absoluteFill} />
          ),
          headerTitle: () => <HostStackHeaderTitle />,
          headerLeft: () => <HeaderLeft />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen name="start-listing" />
      <Stack.Screen
        name="update-avl"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitleWrap: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 8,
  },
  headerEyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  headerRevenueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLocationLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  headerRevenueValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    marginTop: 2,
  },
});