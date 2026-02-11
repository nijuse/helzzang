import { create } from 'zustand';
import { Location } from 'react-native-get-location';
import { DEFAULT_LOCATION } from '../constants';

interface StoreState {
  location: Location | null;
  setLocation: (location: Location | null) => void;
  getDefaultLocation: () => Location;
  gymList: any[] | null;
  setGymList: (gymList: any[] | null) => void;
  getGymList: () => any[];
}

export const useStore = create<StoreState>(set => ({
  location: null,
  setLocation: location => set({ location }),
  getDefaultLocation: () => DEFAULT_LOCATION,
  gymList: null,
  setGymList: gymList => set({ gymList }),
  getGymList: () => [],
}));
