/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, ReactNode } from "react";

declare module "react-native" {
  export interface StyleProp<T = any> {
    [key: string]: any;
  }

  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };

  export interface ViewProps {
    style?: any;
    children?: ReactNode;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface TextProps {
    style?: any;
    children?: ReactNode;
    numberOfLines?: number;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface TouchableOpacityProps {
    style?: any;
    children?: ReactNode;
    onPress?: () => void;
    activeOpacity?: number;
    disabled?: boolean;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityState?: { disabled?: boolean; selected?: boolean };
    testID?: string;
    [key: string]: any;
  }

  export interface TextInputProps {
    style?: any;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    placeholderTextColor?: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: () => void;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    returnKeyType?: "done" | "go" | "next" | "search" | "send";
    editable?: boolean;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface ScrollViewProps {
    style?: any;
    contentContainerStyle?: any;
    children?: ReactNode;
    refreshControl?: ReactNode;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    keyboardShouldPersistTaps?: "always" | "never" | "handled";
    testID?: string;
    [key: string]: any;
  }

  export interface RefreshControlProps {
    refreshing: boolean;
    onRefresh: () => void;
    colors?: string[];
    tintColor?: string;
    [key: string]: any;
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const RefreshControl: ComponentType<RefreshControlProps>;
  export const ActivityIndicator: ComponentType<{
    size?: "small" | "large" | number;
    color?: string;
    style?: any;
  }>;
  export const Pressable: ComponentType<TouchableOpacityProps>;
  export const Image: ComponentType<{
    source: any;
    style?: any;
    resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
    accessibilityLabel?: string;
  }>;
  export const Modal: ComponentType<{
    visible?: boolean;
    animationType?: "none" | "slide" | "fade";
    transparent?: boolean;
    onRequestClose?: () => void;
    children?: ReactNode;
  }>;
  export const Dimensions: {
    get: (dim: "window" | "screen") => { width: number; height: number; scale: number; fontScale: number };
  };
  export const Platform: {
    OS: "ios" | "android" | "web";
    select: <T>(specifics: { ios?: T; android?: T; default?: T }) => T;
  };
}

declare module "expo-status-bar" {
  export const StatusBar: ComponentType<{
    style?: "auto" | "inverted" | "light" | "dark";
    backgroundColor?: string;
    translucent?: boolean;
    hidden?: boolean;
  }>;
}

declare module "expo-router" {
  export const Stack: ComponentType<{
    screenOptions?: any;
    children?: ReactNode;
  }> & {
    Screen: ComponentType<{
      name: string;
      options?: any;
    }>;
  };

  export const Tabs: ComponentType<{
    screenOptions?: any;
    children?: ReactNode;
  }> & {
    Screen: ComponentType<{
      name: string;
      options?: any;
    }>;
  };

  export const Link: ComponentType<{
    href: string | { pathname: string; params?: Record<string, string> };
    asChild?: boolean;
    children?: ReactNode;
    style?: any;
  }>;

  export const useRouter: () => {
    push: (href: string | { pathname: string; params?: Record<string, string> }) => void;
    replace: (href: string | { pathname: string; params?: Record<string, string> }) => void;
    back: () => void;
  };

  export const useLocalSearchParams: <T = Record<string, string>>() => T;
}

declare module "react-native-safe-area-context" {
  export interface SafeAreaViewProps {
    style?: any;
    children?: ReactNode;
    edges?: Array<"top" | "right" | "bottom" | "left">;
  }
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: ComponentType<{ children?: ReactNode }>;
  export const useSafeAreaInsets: () => { top: number; right: number; bottom: number; left: number };
}
