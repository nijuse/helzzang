import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Alert, Linking } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { colors } from '../../themed';

/**
 * OAuth 콜백 URL (Supabase 대시보드 > Authentication > URL Configuration 에
 * Redirect URLs에 helzzang://auth/callback 추가 필요)
 */
const getRedirectUrl = () => {
  return 'helzzang://auth/callback';
};

/**
 * 콜백 URL에서 access_token, refresh_token 추출 후 세션 설정
 * Supabase는 hash fragment (#access_token=...) 또는 query parameter (?access_token=...)로 토큰을 전달할 수 있음
 */
const parseSessionFromUrl = (
  url: string,
): { access_token: string; refresh_token: string } | null => {
  try {
    console.log('📥 받은 URL:', url);

    // hash fragment에서 파싱 시도 (#access_token=...)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const fragment = url.substring(hashIndex + 1);
      const params: Record<string, string> = {};
      fragment.split('&').forEach(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return;
        const key = decodeURIComponent(part.slice(0, eq));
        const value = decodeURIComponent(part.slice(eq + 1));
        if (key && value) params[key] = value;
      });

      if (params.access_token && params.refresh_token) {
        return {
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        };
      }
    }

    // query parameter에서 파싱 시도 (?access_token=...)
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const query = url.substring(queryIndex + 1).split('#')[0]; // hash가 있으면 제거
      const params: Record<string, string> = {};
      query.split('&').forEach(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return;
        const key = decodeURIComponent(part.slice(0, eq));
        const value = decodeURIComponent(part.slice(eq + 1));
        if (key && value) params[key] = value;
      });

      if (params.access_token && params.refresh_token) {
        console.log('✅ 토큰 발견 (query parameter)');
        return {
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        };
      }
    }

    console.log('❌ 토큰을 찾을 수 없음');
    return null;
  } catch (error) {
    console.error('❌ URL 파싱 오류:', error);
    return null;
  }
};

const SignInScreen = () => {
  const [loading, setLoading] = useState(false);

  const createSessionFromUrl = useCallback(async (url: string) => {
    // helzzang:// 스킴인지 확인
    if (!url.startsWith('helzzang://')) {
      console.log('⚠️  helzzang:// 스킴이 아님, 무시');
      return;
    }

    const tokens = parseSessionFromUrl(url);
    if (!tokens) {
      console.log('⚠️  토큰을 찾을 수 없어 세션 생성 불가');
      Alert.alert(
        '로그인 오류',
        '인증 토큰을 받지 못했습니다. 다시 시도해주세요.',
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    setLoading(false);

    if (error) {
      return;
    }

    if (data.session) {
      console.log('✅ 로그인 성공! 사용자:', data.session.user.email);
      // 로그인 성공 시 onAuthStateChange 로 네비게이션 처리 가능
    } else {
      console.log('⚠️  세션이 생성되지 않음');
    }
  }, []);

  useEffect(() => {
    console.log('🔗 딥링크 리스너 설정');

    // 앱이 콜백 URL로 열렸을 때 (콜드 스타트)
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('📱 초기 URL:', url);
        createSessionFromUrl(url);
      } else {
        console.log('📱 초기 URL 없음');
      }
    };
    handleInitialUrl();

    // 앱이 백그라운드에 있을 때 콜백 URL로 복귀
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 딥링크 수신:', url);
      createSessionFromUrl(url);
    });

    return () => {
      console.log('🔗 딥링크 리스너 제거');
      subscription.remove();
    };
  }, [createSessionFromUrl]);

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
        // 브라우저가 열렸으므로 loading은 false로 설정하지 않음
        // 사용자가 Google 로그인 후 앱으로 돌아오면 딥링크 핸들러가 처리
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
        title={loading ? '처리 중...' : 'Sign in with Google'}
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
    // justifyContent: 'center',
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
