import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { Location } from 'react-native-get-location';
import type { GymSearchResult } from '../types/gymSearch';

/**
 * 헬스장 목록 조회 (TanStack Query 캐싱)
 * queryKey에 lat/lng 포함 → 같은 위치면 캐시 사용
 */
export default function useGymList(
  location: Location | null,
): UseQueryResult<GymSearchResult[]> {
  return useQuery<GymSearchResult[]>({
    // retry: 1,
    staleTime: 1000 * 60 * 60 * 24, // 24시간(1일): 헬스장 목록은 자주 바뀌지 않음
    structuralSharing: false, // 데이터 변경 시 새 참조 보장 → 리렌더 반영
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    enabled: !!location?.latitude && !!location?.longitude,
    queryKey: ['gymList', location?.latitude, location?.longitude],
    queryFn: () => fetchGymList(location!.latitude, location!.longitude),
  });
}

export const fetchGymList = async (
  lat: number,
  lng: number,
): Promise<GymSearchResult[]> => {
  try {
    const { data } = await axios.get<GymSearchResult[]>(
      `https://apiwoondocv1.woondoc.com/search/gym/?lat=${lat}&lng=${lng}&bound=80&type=0`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return data;
  } catch (error) {
    console.error('fetchGymListdata error', error);
    return [];
  }
};
