import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecentlyViewedScreen from '../screens/RecentlyViewedScreen';
import GymListScreen from '../screens/GymListScreen';
import AIComparisonScreen from '../screens/AIComparisonScreen';

export type RootStackParamList = {
  Home: undefined;
  RecentlyViewed: undefined;
  GymList: { filter: 'dayPass' | 'membership' | 'female' };
  AIComparison: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const GymListScreenWrapper = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'GymList'>) => (
  <GymListScreen filter={route.params.filter} />
);

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
      <Stack.Screen name="GymList" component={GymListScreenWrapper} />
      <Stack.Screen name="AIComparison" component={AIComparisonScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
