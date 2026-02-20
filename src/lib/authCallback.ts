import { supabase } from './supabase';

function parseParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    // hash fragment (#...)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const fragment = url.substring(hashIndex + 1);
      fragment.split('&').forEach(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return;
        const key = decodeURIComponent(part.slice(0, eq).replace(/\+/g, ' '));
        const value = decodeURIComponent(
          part.slice(eq + 1).replace(/\+/g, ' '),
        );
        if (key && value) params[key] = value;
      });
    }
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const query = url.substring(queryIndex + 1).split('#')[0];
      query.split('&').forEach(part => {
        const eq = part.indexOf('=');
        if (eq === -1) return;
        const key = decodeURIComponent(part.slice(0, eq).replace(/\+/g, ' '));
        const value = decodeURIComponent(
          part.slice(eq + 1).replace(/\+/g, ' '),
        );
        if (key && value) params[key] = value;
      });
    }
  } catch {
    // ignore
  }
  return params;
}

/**
 * 콜백 URL에서 access_token, refresh_token 추출 (기존 implicit flow용)
 */
export function parseSessionFromUrl(
  url: string,
): { access_token: string; refresh_token: string } | null {
  const params = parseParamsFromUrl(url);
  if (params.access_token && params.refresh_token) {
    return {
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    };
  }
  return null;
}

/**
 * OAuth 콜백 URL 처리: PKCE(code) 또는 토큰으로 세션 설정 후 성공 여부 반환
 * - 모바일에서는 hash(#)가 전달되지 않는 경우가 많아 PKCE + code 쿼리 사용 권장
 */
export async function handleAuthCallbackUrl(url: string): Promise<boolean> {
  if (!url || !url.startsWith('helzzang://')) {
    return false;
  }

  // 중복 처리 방지: 이미 세션이 있으면 스킵 (App.tsx와 SignInScreen 둘 다 처리하는 경우 대비)
  const {
    data: { session: existingSession },
  } = await supabase.auth.getSession();
  if (existingSession) {
    return true;
  }

  const params = parseParamsFromUrl(url);

  // 1) PKCE: code로 세션 교환 (모바일 권장)
  const code = params.code;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      if (error.code === 'pkce_code_verifier_not_found') {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) return true;
        return false;
      }
      return false;
    }
    if (!data.session) return false;
    return true;
  }

  // 2) implicit: access_token, refresh_token으로 세션 설정
  const tokens = parseSessionFromUrl(url);
  if (!tokens) return false;

  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error || !data.session) return false;
  return true;
}
