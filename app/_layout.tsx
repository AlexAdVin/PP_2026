import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AuthModalHost from '@/components/auth/AuthModalHost';
import { useAuthBootstrap } from '@/src/store/authStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useAuthBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <>
          <Stack screenOptions={{ headerShown: false }}>
        
            {/* Drawer app */}
            <Stack.Screen name="(drawer)" />
            {/* Driver flow */}
            {/* <Stack.Screen name="driver" /> */}
            {/* Hosting flow */}
  {/*         <Stack.Screen name="(hostingStack)" /> */}

  {/* Global modals */}
  {/*       <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
          }}
        /> */}
          </Stack>
          <AuthModalHost />
        </>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}