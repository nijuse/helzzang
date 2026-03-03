import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet, Image, Pressable } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RecentlyViewedScreen from '../screens/RecentlyViewedScreen';
import GymListScreen from '../screens/GymListScreen';
import AIComparisonScreen from '../screens/AIComparisonScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import SignInScreen from '../screens/SignInScreen';
import { colors } from '../../themed';
import CommunityWriteScreen from '../screens/community/CommunityWriteScreen';
import CommunityDetailScreen from '../screens/community/CommunityDetailScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  RecentlyViewed: undefined;
  GymList: { filter: 'dayPass' | 'membership' | 'female' };
  AIComparison: undefined;
  Community: undefined;
  SignIn: undefined;
  CommunityWrite: undefined | { id: string };
  CommunityDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const GymListScreenWrapper = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'GymList'>) => (
  <GymListScreen filter={route.params.filter} />
);

const LogoHeader = () => {
  return (
    <Image
      source={require('../../assets/images/logo2.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
};

const RootNavigator = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        contentStyle: { backgroundColor: colors.white },
        headerTitle:
          route.name !== 'CommunityDetail' ? () => <LogoHeader /> : '',
        headerTitleAlign: 'center',
        headerBackVisible: false,
        headerBackTitle: undefined,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
        headerLeft: () =>
          navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={36} color={colors.primary} />
            </Pressable>
          ) : null,
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
      <Stack.Screen name="GymList" component={GymListScreenWrapper} />
      <Stack.Screen name="AIComparison" component={AIComparisonScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="CommunityWrite" component={CommunityWriteScreen} />
      <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default RootNavigator;
