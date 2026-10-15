import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  Catalog: undefined;
  ActiveTrip: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Auth flow
  Login: undefined;
  // App flow
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AssetDetail: { assetId: string };
  ReportIssue: { rentalId: string; assetName: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
