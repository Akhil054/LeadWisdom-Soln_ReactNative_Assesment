import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components';
import { LoginScreen } from '../screens/LoginScreen';
import { AssetDetailScreen } from '../screens/AssetDetailScreen';
import { ReportIssueScreen } from '../screens/ReportIssueScreen';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

/**
 * Root stack. Auth and app screens are rendered conditionally, so after login
 * the Login screen is removed from history (Back can't return to it) and a
 * logout/401 swaps straight back to Login.
 */
export const RootNavigator = () => {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) return <LoadingView message="Restoring your session…" />;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontWeight: '700' },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Asset Details' }} />
            <Stack.Screen
              name="ReportIssue"
              component={ReportIssueScreen}
              options={{ title: 'Report Issue', presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
