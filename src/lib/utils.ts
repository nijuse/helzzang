const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 8601 UTC (예: 2026-02-20T08:58:41+00:00) → 한국 시간(KST) 기준 "N분 전" / "N시간 전" / "N일 전" / "N주 전" */
export const formatRelativeTime = (createdAt: string): string => {
  const utcDate = new Date(
    createdAt.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(createdAt)
      ? createdAt
      : `${createdAt}Z`,
  );
  const dateKst = new Date(utcDate.getTime() + KST_OFFSET_MS);
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const diffMs = nowKst.getTime() - dateKst.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${diffWeeks}주 전`;
};

export type MapUrlOptions = {
  lat: string | undefined;
  lng: string | undefined;
  name: string;
};

/** 네이버 지도 URL: 좌표 있으면 앱 스킴, 없으면 주소 검색(웹) */
export const buildNaverMapUrl = ({
  lat,
  lng,
  name,
}: MapUrlOptions): string | null => {
  const APP_BUNDLE_ID = 'com.helzzang';
  if (lat && lng) {
    const _name = encodeURIComponent(name || '목적지');
    return `nmap://place?lat=${lat}&lng=${lng}&name=${_name}&appname=${APP_BUNDLE_ID}`;
  }
  return null;
};

/** 카카오맵 URL: 좌표 있으면 앱 스킴(길찾기 도착지), 없으면 주소 검색(웹). 좌표는 위도,경도 순 */
export const buildKakaoMapUrl = ({
  lat,
  lng,
  name,
}: MapUrlOptions): string | null => {
  if (lat && lng) {
    const _name = encodeURIComponent(name || '목적지');
    return `kakaomap://route?ep=${lat},${lng}&en=${_name}`;
  }
  return null;
};
