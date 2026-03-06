import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useGymDetail(gymId: string) {
  return useQuery({
    queryKey: ['gymDetail', gymId],
    queryFn: () => fetchGymDetail(gymId),
    enabled: !!gymId,
  });
}

export const fetchGymDetail = async (gymId: string) => {
  try {
    const { data } = await axios.get(
      `https://apiwoondocv1.woondoc.com/user/wish/?recent_gyms=${gymId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return data?.recent_gyms?.[0] ?? null;
  } catch (error) {
    console.error('fetchGymDetail error', error);
    return null;
  }
};
