import { create } from 'zustand';
import { Location } from 'react-native-get-location';
import { DEFAULT_LOCATION } from '@/constants';
import type { GymSearchResult } from '@/types/gymSearch';

interface StoreState {
  location: Location | null;
  setLocation: (location: Location | null) => void;
  getDefaultLocation: () => Location;
  gymList: GymSearchResult[] | null;
  setGymList: (gymList: GymSearchResult[] | null) => void;
  getGymList: () => GymSearchResult[];
}

export const useStore = create<StoreState>(set => ({
  location: null,
  setLocation: location => set({ location }),
  getDefaultLocation: () => DEFAULT_LOCATION,
  gymList: null,
  setGymList: gymList => set({ gymList }),
  getGymList: () => [],
}));
