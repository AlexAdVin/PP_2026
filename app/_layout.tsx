import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
    </ThemeProvider>
  );
}