/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "react-native" {
  export interface StyleProp<_T = any> {
    [key: string]: any;
  }

  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };

  export interface ViewProps {
    style?: any;
    children?: import("react").ReactNode;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface TextProps {
    style?: any;
    children?: import("react").ReactNode;
    numberOfLines?: number;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface TouchableOpacityProps {
    style?: any;
    children?: import("react").ReactNode;
    onPress?: () => void;
    activeOpacity?: number;
    disabled?: boolean;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityState?: { disabled?: boolean; selected?: boolean; checked?: boolean | "mixed" };
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
    multiline?: boolean;
    numberOfLines?: number;
    accessibilityLabel?: string;
    testID?: string;
    [key: string]: any;
  }

  export interface ScrollViewProps {
    style?: any;
    contentContainerStyle?: any;
    children?: import("react").ReactNode;
    refreshControl?: import("react").ReactNode;
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

  export const View: import("react").ComponentType<ViewProps>;
  export const Text: import("react").ComponentType<TextProps>;
  export const TouchableOpacity: import("react").ComponentType<TouchableOpacityProps>;
  export const TextInput: import("react").ComponentType<TextInputProps>;
  export const ScrollView: import("react").ComponentType<ScrollViewProps>;
  export const RefreshControl: import("react").ComponentType<RefreshControlProps>;
  export const ActivityIndicator: import("react").ComponentType<{
    size?: "small" | "large" | number;
    color?: string;
    style?: any;
  }>;
  export const Pressable: import("react").ComponentType<TouchableOpacityProps>;
  export const Image: import("react").ComponentType<{
    source: any;
    style?: any;
    resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
    accessibilityLabel?: string;
  }>;
  export const Modal: import("react").ComponentType<{
    visible?: boolean;
    animationType?: "none" | "slide" | "fade";
    transparent?: boolean;
    onRequestClose?: () => void;
    children?: import("react").ReactNode;
  }>;
  export const Dimensions: {
    get: (dim: "window" | "screen") => {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
  };
  export const Platform: {
    OS: "ios" | "android" | "web";
    select: <T>(specifics: { ios?: T; android?: T; default?: T }) => T;
  };
  export const Share: {
    share: (content: {
      message: string;
      title?: string;
      url?: string;
    }) => Promise<{ action: string }>;
  };
  export const Linking: {
    openURL: (url: string) => Promise<boolean>;
    canOpenURL: (url: string) => Promise<boolean>;
  };
  export const Switch: import("react").ComponentType<{
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    trackColor?: { false?: string; true?: string };
    thumbColor?: string;
    disabled?: boolean;
    accessibilityLabel?: string;
    style?: any;
  }>;
  export const Alert: {
    alert: (
      title: string,
      message?: string,
      buttons?: Array<{
        text?: string;
        onPress?: () => void;
        style?: "default" | "cancel" | "destructive";
      }>
    ) => void;
  };
}

declare module "expo-status-bar" {
  export const StatusBar: import("react").ComponentType<{
    style?: "auto" | "inverted" | "light" | "dark";
    backgroundColor?: string;
    translucent?: boolean;
    hidden?: boolean;
  }>;
}

declare module "expo-router" {
  export const Stack: import("react").ComponentType<{
    screenOptions?: any;
    children?: import("react").ReactNode;
  }> & {
    Screen: import("react").ComponentType<{
      name: string;
      options?: any;
    }>;
  };

  export const Tabs: import("react").ComponentType<{
    screenOptions?: any;
    children?: import("react").ReactNode;
  }> & {
    Screen: import("react").ComponentType<{
      name: string;
      options?: any;
    }>;
  };

  export const Link: import("react").ComponentType<{
    href: string | { pathname: string; params?: Record<string, string> };
    asChild?: boolean;
    children?: import("react").ReactNode;
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
    children?: import("react").ReactNode;
    edges?: Array<"top" | "right" | "bottom" | "left">;
  }
  export const SafeAreaView: import("react").ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: import("react").ComponentType<{
    children?: import("react").ReactNode;
  }>;
  export const useSafeAreaInsets: () => {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

declare module "expo-print" {
  export interface PrintToFileOptions {
    html: string;
    width?: number;
    height?: number;
    base64?: boolean;
  }
  export interface FilePrintResult {
    uri: string;
    numberOfPages?: number;
    base64?: string;
  }
  export function printToFileAsync(options: PrintToFileOptions): Promise<FilePrintResult>;
}

declare module "expo-sharing" {
  export interface SharingOptions {
    mimeType?: string;
    dialogTitle?: string;
    UTI?: string;
  }
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(url: string, options?: SharingOptions): Promise<void>;
}

declare module "expo-notifications" {
  export interface NotificationPermissionsStatus {
    status: "granted" | "undetermined" | "denied";
    granted: boolean;
    canAskAgain: boolean;
    expires?: "never" | number;
  }

  export interface NotificationContentInput {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: boolean | string;
    badge?: number;
  }

  export interface NotificationTriggerInput {
    date?: Date | number;
    seconds?: number;
    repeats?: boolean;
    type?: string;
  }

  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function scheduleNotificationAsync(request: {
    content: NotificationContentInput;
    trigger: NotificationTriggerInput | Date | number | null;
  }): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function getAllScheduledNotificationsAsync(): Promise<
    Array<{ identifier: string; content: NotificationContentInput }>
  >;
}
