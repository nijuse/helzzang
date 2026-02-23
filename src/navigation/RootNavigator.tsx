import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecentlyViewedScreen from '../screens/RecentlyViewedScreen';
import GymListScreen from '../screens/GymListScreen';
import AIComparisonScreen from '../screens/AIComparisonScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import SignInScreen from '../screens/SignInScreen';
import { colors } from '../../themed';
import CommunityWriteScreen from '../screens/community/CommunityWriteScreen';

export type RootStackParamList = {
  Home: undefined;
  RecentlyViewed: undefined;
  GymList: { filter: 'dayPass' | 'membership' | 'female' };
  AIComparison: undefined;
  Community: undefined;
  SignIn: undefined;
  CommunityWrite: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const GymListScreenWrapper = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'GymList'>) => (
  <GymListScreen filter={route.params.filter} />
);

// Header에 표시할 로고 컴포넌트
// 로고 이미지가 있으면 Image 컴포넌트를 사용하고, 없으면 텍스트 로고를 표시합니다
// 로고 이미지를 사용하려면: import { Image } from 'react-native'; 추가 후 아래 주석 해제
const LogoHeader = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('Home');
  };

  // 로고 이미지가 있다면 이 부분의 주석을 해제하고 경로를 수정하세요
  // import { Image } from 'react-native'; 추가 필요
  // return (
  //   <Pressable onPress={handlePress}>
  //     <Image
  //       source={require('../../assets/logo.png')}
  //       style={styles.logo}
  //       resizeMode="contain"
  //     />
  //   </Pressable>
  // );
  return (
    <Pressable onPress={handlePress}>
      <Text style={styles.logoText}>HELZZANG</Text>
    </Pressable>
  );
};

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        contentStyle: { backgroundColor: colors.white, padding: 24 },
        headerTitle: LogoHeader,
        headerTitleAlign: 'center',
        headerBackVisible: route.name !== 'Home',
        headerBackTitle: '',
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
      <Stack.Screen name="GymList" component={GymListScreenWrapper} />
      <Stack.Screen name="AIComparison" component={AIComparisonScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="CommunityWrite" component={CommunityWriteScreen} />
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
