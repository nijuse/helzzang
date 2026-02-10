import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Location } from 'react-native-get-location';

/**
 * 헬스장 목록 조회 (TanStack Query 캐싱)
 * queryKey에 lat/lng 포함 → 같은 위치면 캐시 사용
 */
export const useGymList = (location: Location | null) => {
  return useQuery({
    queryKey: ['gymList', location?.latitude, location?.longitude],
    queryFn: () => fetchGymList(location!.latitude, location!.longitude),
    enabled: !!location,
  });
};

export const fetchGymList = async (lat: number, lng: number) => {
  const { data } = await axios.get(
    `https://apiwoondocv1.woondoc.com/search/gym/?lat=${lat}&lng=${lng}&bound=100&type=0`,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return data;
};
