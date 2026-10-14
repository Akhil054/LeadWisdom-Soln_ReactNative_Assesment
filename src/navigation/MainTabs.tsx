import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CatalogScreen } from '../screens/CatalogScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Catalog: ['grid', 'grid-outline'],
  ActiveTrip: ['timer', 'timer-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      headerTitleStyle: { fontWeight: '700' },
      headerStyle: { backgroundColor: colors.surface },
      tabBarIcon: ({ focused, color, size }) => (
        <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Fleet' }} />
    <Tab.Screen name="ActiveTrip" component={ActiveSessionScreen} options={{ title: 'Active Trip' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);
