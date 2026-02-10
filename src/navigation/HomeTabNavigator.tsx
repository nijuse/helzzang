import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import GymListScreen from '../screens/GymListScreen';
import AIComparisonScreen from '../screens/AIComparisonScreen';

const Tab = createBottomTabNavigator();

const TabIconPlaceholder = () => <View style={styles.iconPlaceholder} />;

const HomeTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: TabIconPlaceholder,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2089dc',
        tabBarInactiveTintColor: '#666',
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
      }}
    >
      <Tab.Screen
        name="일일권"
        component={() => <GymListScreen filter="dayPass" />}
      />
      <Tab.Screen
        name="회원권"
        component={() => <GymListScreen filter="membership" />}
      />
      <Tab.Screen
        name="여성전용"
        component={() => <GymListScreen filter="female" />}
      />
      <Tab.Screen name="AI 추천 헬스장" component={AIComparisonScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconPlaceholder: {
    width: 0,
    height: 0,
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    minHeight: 48,
    marginBottom: 0,
    color: '#666',
  },
  tabBarItem: {
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 100,
    marginHorizontal: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    color: '#666',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeTabNavigator;
