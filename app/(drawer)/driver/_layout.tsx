import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DriverLayout() {
    const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
                      headerTransparent: true,
            headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
          name="index"
          /*             options={{
              headerShown: false,
            }} */
        />

        <Stack.Screen
          name="placeDetail"
          /*             options={{
              headerTitle: '',
              presentation: 'card',
            }} */
        />

        <Stack.Screen
          name="filter"
          options={{
            headerTitle: "",
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="pay"
          /*             options={{
              presentation: 'card',
              headerTransparent: true,
              headerTitle: 'Confirm and pay',
              headerTintColor: '#fff',
              headerBackButtonDisplayMode: 'minimal',
            }} */
        />

      </Stack>
    </ThemeProvider>
  );
}