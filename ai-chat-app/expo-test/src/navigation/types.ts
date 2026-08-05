import { NavigatorScreenParams } from "@react-navigation/native";

export type ChatStackParamList = {
  ChatList: undefined;
  NewChat: undefined;
  Invites: undefined;
  Chat: {
    userId: string;
    userName: string;
    status?: string;
  };
};

export type AppTabParamList = {
  Chats: NavigatorScreenParams<ChatStackParamList>;
  AI: undefined;
  Calls: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Main: NavigatorScreenParams<AppTabParamList>;
  CallVideo: {
    name: string;
    enableTranslate?: boolean;
  };
  AudioCall: {
    name: string;
    enableTranslate?: boolean;
  };
  Subscription: undefined;
  LanguageSettings: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OTPVerification: {
    email?: string;
  };
};

export type RootStackParamList = AppStackParamList;
