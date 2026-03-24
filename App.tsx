/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef } from 'react';
import { ThemeProvider } from '@rneui/themed';
import {
  StatusBar,
  useColorScheme,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './themed';
import RootNavigator from '@/navigation/RootNavigator';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { handleAuthCallbackUrl } from '@/lib/authCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 캐시 유효
    },
  },
});

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function navigateToCommunityAfterAuth() {
  const tryNavigate = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Community');
      return true;
    }
    return false;
  };
  if (!tryNavigate()) {
    setTimeout(tryNavigate, 200);
  }
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const authSuccessPending = useRef(false);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const success = await handleAuthCallbackUrl(url);
      if (success) {
        authSuccessPending.current = true;
        navigateToCommunityAfterAuth();
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    const appStateSub = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          Linking.getInitialURL().then(handleUrl);
        }
      },
    );

    return () => {
      subscription.remove();
      appStateSub.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              if (authSuccessPending.current) {
                authSuccessPending.current = false;
                navigationRef.navigate('Community');
              }
            }}
          >
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
