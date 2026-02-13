import { Location } from 'react-native-get-location';

// 기본 위치 (강남역)
export const DEFAULT_LOCATION: Location = {
  longitude: 127.027621,
  latitude: 37.497942,
  altitude: 0,
  accuracy: 0,
  speed: 0,
  time: 0,
};

export const FILTERS: Record<string, string> = {
  dayPass: '일일권',
  membership: '회원권',
  female: '여성전용',
};
