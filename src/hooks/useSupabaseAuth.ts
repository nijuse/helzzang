import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Supabase Auth를 통해
 * - 현재 로그인한 사용자 정보(user)
 * - 세션(session)
 * 을 구독하고 반환하는 훅
 *
 * 앱이 켜져 있는 동안 `onAuthStateChange` 이벤트를 구독해서
 * 로그인/로그아웃/토큰 갱신 시점에 자동으로 값이 변경되도록 합니다.
 */
export default function useSupabaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('초기 세션 조회 에러:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error,
          }));
          return;
        }

        setState({
          session: session ?? null,
          user: session?.user ?? null,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (!isMounted) return;
        console.error('초기 세션 조회 중 예외:', e);
        setState(prev => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e : new Error(String(e)),
        }));
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setState({
          session: session ?? null,
          user: session?.user ?? null,
          loading: false,
          error: null,
        });
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
