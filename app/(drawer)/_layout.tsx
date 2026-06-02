import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useRouter } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme";
import CustomDrawer from "@/components/drawer/CustomDrawer";

/* const { width, height } = Dimensions.get("window"); */

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "slide",
          overlayColor: "rgba(0,0,0,0.12)",

          /*             drawerStyle: {
            backgroundColor: 'transparent',
            width: width * 0.85,
          }, */

          drawerActiveTintColor: "#111827",
          drawerInactiveTintColor: "#6B7280",

          drawerActiveBackgroundColor: "rgba(255,255,255,0.75)",

          drawerLabelStyle: {
            fontSize: 16,
            letterSpacing: 0.2,
          },

          drawerItemStyle: {
            borderRadius: 18,
            marginHorizontal: 10,
            marginVertical: 4,
            height: 54,
            justifyContent: "center",
            overflow: "hidden",
          },
        }}
      >
        {/* landing */}
        <Drawer.Screen name="index" options={{ drawerLabel: "Home" }} />
        <Drawer.Screen
          name="welcome"
          options={{
            drawerItemStyle: { display: "none" },
            drawerLabel: "Welcome",
            title: "Welcome",
          }}
        />

        {/* Driver flow */}
        <Drawer.Screen
          name="driver"
          options={{
            //drawerItemStyle: { display: "none" },
            drawerLabel: "Map",
            title: "Map",
          }}
        />

        {/* Profile flow - hidden */}
        <Drawer.Screen
          name="profile/index"
          options={{
            drawerItemStyle: { display: "none" },
            drawerLabel: "profile",
            title: "profile",
          }}
        />

        {/* Host Home flow */}
        <Drawer.Screen
          name="host"
          options={{
            drawerLabel: "Hosting Home",
            title: "Host Home",
          }}
          listeners={{
            drawerItemPress: (event) => {
              event.preventDefault();
              router.replace("/host");
            },
          }}
        />
      </Drawer>
      <StatusBar />
    </ThemeProvider>
  );
}
