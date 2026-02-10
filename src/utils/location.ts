/**
 * 좌표가 한국 내에 있는지 확인하는 함수
 * @param {number} lat - 위도 (Latitude)
 * @param {number} lng - 경도 (Longitude)
 * @returns {boolean} - 한국 내 위치 여부
 */
export const isInsideKorea = (lat: number, lng: number) => {
  const KOREA_BOUNDS = {
    minLat: 33.0, // 남단 (마라도 아래)
    maxLat: 39.0, // 북단 (휴전선 위쪽 여유분)
    minLng: 124.0, // 서단 (백령도 인근)
    maxLng: 132.0, // 동단 (독도 인근)
  };

  return (
    lat >= KOREA_BOUNDS.minLat &&
    lat <= KOREA_BOUNDS.maxLat &&
    lng >= KOREA_BOUNDS.minLng &&
    lng <= KOREA_BOUNDS.maxLng
  );
};
