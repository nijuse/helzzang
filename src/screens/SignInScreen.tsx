import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { handleAuthCallbackUrl } from '../lib/authCallback';
import { colors } from '../../themed';
import type { RootStackParamList } from '../navigation/RootNavigator';

/**
 * OAuth 콜백 URL (Supabase 대시보드 > Authentication > URL Configuration 에
 * Redirect URLs에 helzzang://auth/callback 추가 필요)
 * 콜백 처리 및 로그인 후 Community 이동은 App.tsx + 여기 포커스 폴백으로 처리
 */
const getRedirectUrl = () => {
  return 'helzzang://auth/callback';
};

const SignInScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 구글 로그인 후 앱 복귀 시: URL 직접 처리 + auth 변경 구독 + 앱 포그라운드 시 세션 폴링
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const goToCommunity = () => {
        if (!cancelled) navigation.replace('Community');
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!cancelled && session) navigation.goBack();
      });

      const urlSub = Linking.addEventListener('url', async ({ url }) => {
        if (cancelled) return;
        const ok = await handleAuthCallbackUrl(url);
        if (ok) goToCommunity();
      });

      Linking.getInitialURL().then(async url => {
        if (cancelled || !url) return;
        const ok = await handleAuthCallbackUrl(url);
        if (ok) goToCommunity();
      });

      const { data: authSub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!cancelled && session) goToCommunity();
        },
      );

      // 3) 앱이 포그라운드로 돌아올 때: 즉시 세션 체크 + URL 폴백 + 세션 폴링
      let pollCleanup: (() => void) | null = null;
      const pollSession = () => {
        pollCleanup?.();
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!cancelled && session) goToCommunity();
        });
        let count = 0;
        const max = 12;
        const id = setInterval(() => {
          if (cancelled || count >= max) {
            clearInterval(id);
            return;
          }
          count += 1;
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!cancelled && session) {
              clearInterval(id);
              goToCommunity();
            }
          });
        }, 500);
        pollCleanup = () => clearInterval(id);
      };

      const onAppActive = () => {
        if (cancelled) return;
        Linking.getInitialURL().then(async url => {
          if (cancelled || !url || !url.startsWith('helzzang://')) return;
          const ok = await handleAuthCallbackUrl(url);
          if (ok) goToCommunity();
        });
        pollSession();
      };

      const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
        if (state === 'active') onAppActive();
      });
      if (AppState.currentState === 'active') onAppActive();

      return () => {
        cancelled = true;
        urlSub.remove();
        authSub.subscription.unsubscribe();
        appStateSub.remove();
        pollCleanup?.();
      };
    }, [navigation]),
  );

  const signInWithGoogle = async () => {
    setLoading(true);
    const redirectTo = getRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setLoading(false);
      return;
    }

    if (data?.url) {
      const canOpen = await Linking.canOpenURL(data.url);
      if (canOpen) {
        await Linking.openURL(data.url);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
      />
      <Button
        title={'Sign in with Google'}
        onPress={signInWithGoogle}
        disabled={loading}
        buttonStyle={styles.googleButton}
        titleStyle={styles.googleButtonTitle}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    marginBottom: '10%',
  },
  logo: {
    width: 240,
    height: 70,
    marginBottom: '30%',
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey0,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  googleButtonTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: colors.grey0,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default SignInScreen;
