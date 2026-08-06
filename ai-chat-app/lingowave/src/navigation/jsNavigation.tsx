import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type JsRoute = {
  key: string;
  name: string;
  params?: object;
};

export type NavigationApi = {
  navigate: (name: string, params?: object) => void;
  replace: (name: string, params?: object) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  getParent: () => NavigationApi | undefined;
  setOptions: (options: object) => void;
  addListener: (
    _event: string,
    _cb: (...args: unknown[]) => void
  ) => () => void;
};

type NavigationContextValue = {
  navigation: NavigationApi;
  route: JsRoute;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);
const ParentNavigationContext = createContext<NavigationApi | undefined>(
  undefined
);

let routeKey = 0;
function nextKey(name: string) {
  routeKey += 1;
  return `${name}-${routeKey}`;
}

export function useNavigation<T = NavigationApi>(): T {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within a JS navigator");
  }
  return ctx.navigation as T;
}

export function useRoute<T = JsRoute>(): T {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useRoute must be used within a JS navigator");
  }
  return ctx.route as T;
}

export function NavigationContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

type StackScreenConfig = {
  name: string;
  component?: ComponentType<any>;
  getComponent?: () => ComponentType<any>;
};

type TabScreenConfig = {
  name: string;
  component: ComponentType<any>;
  options?: {
    tabBarLabel?: string;
    tabBarAccessibilityLabel?: string;
  };
  listeners?: {
    tabPress?: (event: { preventDefault: () => void }) => void;
  };
};

function collectNamedChildren<T>(children: ReactNode): T[] {
  const list: T[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && (child.props as { name?: string }).name) {
      list.push(child.props as T);
    }
  });
  return list;
}

export function createNativeStackNavigator<_ParamList = Record<string, unknown>>() {
  function Navigator({
    initialRouteName,
    children,
  }: {
    initialRouteName?: string;
    screenOptions?: object;
    children: ReactNode;
  }) {
    const screens = useMemo(
      () => collectNamedChildren<StackScreenConfig>(children),
      [children]
    );
    const parent = useContext(ParentNavigationContext);
    const first = initialRouteName ?? screens[0]?.name ?? "Unknown";
    const [stack, setStack] = useState<JsRoute[]>(() => [
      { key: nextKey(first), name: first },
    ]);
    const current = stack[stack.length - 1];

    const navigate = useCallback(
      (name: string, params?: object) => {
        if (!screens.some((screen) => screen.name === name)) {
          parent?.navigate(name, params);
          return;
        }
        setStack((prev) => [...prev, { key: nextKey(name), name, params }]);
      },
      [parent, screens]
    );

    const replace = useCallback((name: string, params?: object) => {
      setStack((prev) => {
        const next = prev.slice(0, Math.max(prev.length - 1, 0));
        next.push({ key: nextKey(name), name, params });
        return next;
      });
    }, []);

    const goBack = useCallback(() => {
      setStack((prev) => {
        if (prev.length > 1) {
          return prev.slice(0, -1);
        }
        parent?.goBack();
        return prev;
      });
    }, [parent]);

    const navigation = useMemo<NavigationApi>(
      () => ({
        navigate,
        replace,
        goBack,
        canGoBack: () => stack.length > 1 || Boolean(parent?.canGoBack()),
        getParent: () => parent,
        setOptions: () => undefined,
        addListener: () => () => undefined,
      }),
      [goBack, navigate, parent, replace, stack.length]
    );

    const screen = screens.find((item) => item.name === current.name);
    const ScreenComponent =
      screen?.component ?? screen?.getComponent?.() ?? (() => null);

    return (
      <ParentNavigationContext.Provider value={navigation}>
        <NavigationContext.Provider value={{ navigation, route: current }}>
          <View style={styles.flex}>
            <ScreenComponent />
          </View>
        </NavigationContext.Provider>
      </ParentNavigationContext.Provider>
    );
  }

  function Screen(_props: StackScreenConfig) {
    return null;
  }

  return { Navigator, Screen };
}

export function createBottomTabNavigator<_ParamList = Record<string, unknown>>() {
  function Navigator({
    initialRouteName,
    children,
    screenOptions,
  }: {
    initialRouteName?: string;
    children: ReactNode;
    screenOptions?:
      | Record<string, unknown>
      | ((args: { route: { name: string } }) => Record<string, unknown>);
  }) {
    const screens = useMemo(
      () => collectNamedChildren<TabScreenConfig>(children),
      [children]
    );
    const parent = useContext(ParentNavigationContext);
    const [active, setActive] = useState(
      initialRouteName ?? screens[0]?.name ?? "Chats"
    );

    const route = useMemo<JsRoute>(
      () => ({ key: `tab-${active}`, name: active }),
      [active]
    );

    const navigate = useCallback(
      (name: string, params?: object) => {
        if (screens.some((screen) => screen.name === name)) {
          setActive(name);
          return;
        }
        parent?.navigate(name, params);
      },
      [parent, screens]
    );

    const navigation = useMemo<NavigationApi>(
      () => ({
        navigate,
        replace: navigate,
        goBack: () => parent?.goBack(),
        canGoBack: () => Boolean(parent?.canGoBack()),
        getParent: () => parent,
        setOptions: () => undefined,
        addListener: () => () => undefined,
      }),
      [navigate, parent]
    );

    const activeScreen = screens.find((screen) => screen.name === active);
    const ScreenComponent = activeScreen?.component ?? (() => null);
    const barOptions =
      typeof screenOptions === "function"
        ? screenOptions({ route: { name: active } })
        : (screenOptions ?? {});

    return (
      <ParentNavigationContext.Provider value={navigation}>
        <NavigationContext.Provider value={{ navigation, route }}>
          <View style={styles.flex}>
            <View style={styles.flex}>
              <ScreenComponent />
            </View>
            <View style={[styles.tabBar, barOptions.tabBarStyle as object]}>
              {screens.map((screen) => {
                const options =
                  typeof screenOptions === "function"
                    ? screenOptions({ route: { name: screen.name } })
                    : (screenOptions ?? {});
                const merged = {
                  ...options,
                  ...(screen.options ?? {}),
                };
                const isActive = screen.name === active;
                const color = isActive
                  ? String(merged.tabBarActiveTintColor ?? "#0F766E")
                  : String(merged.tabBarInactiveTintColor ?? "#64748B");
                const label = String(merged.tabBarLabel ?? screen.name);
                const icon = (
                  merged.tabBarIcon as
                    | ((args: { color: string; size: number }) => ReactNode)
                    | undefined
                )?.({ color, size: 22 });

                return (
                  <Pressable
                    key={screen.name}
                    style={styles.tabButton}
                    accessibilityLabel={
                      merged.tabBarAccessibilityLabel as string | undefined
                    }
                    onPress={() => {
                      let prevented = false;
                      screen.listeners?.tabPress?.({
                        preventDefault: () => {
                          prevented = true;
                        },
                      });
                      if (!prevented) {
                        setActive(screen.name);
                      }
                    }}
                  >
                    {icon}
                    <Text style={{ color, fontSize: 11, fontWeight: "600" }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </NavigationContext.Provider>
      </ParentNavigationContext.Provider>
    );
  }

  function Screen(_props: TabScreenConfig) {
    return null;
  }

  return { Navigator, Screen };
}

export type RouteProp<
  ParamList extends Record<string, object | undefined>,
  RouteName extends keyof ParamList,
> = {
  key: string;
  name: RouteName;
  params: ParamList[RouteName];
};

export type NativeStackNavigationProp<
  ParamList extends Record<string, object | undefined>,
  _RouteName extends keyof ParamList = keyof ParamList,
> = NavigationApi & {
  navigate: {
    <Name extends keyof ParamList>(
      ...args: undefined extends ParamList[Name]
        ? [Name] | [Name, ParamList[Name]]
        : [Name, ParamList[Name]]
    ): void;
  };
};

export type CompositeNavigationProp<A, B> = A & B;
export type NavigatorScreenParams<_T> = object | undefined;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingBottom: 8,
    paddingTop: 6,
    minHeight: 64,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
