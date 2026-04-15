import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter, updateProfile } from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { queryClient } from "@/lib/queryClient";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type User = {
  id: string;
  name: string;
  phone: string;
  coins: number;
  isAdmin: boolean;
  createdAt: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  const registeredToken = useRef<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        const user = userJson ? (JSON.parse(userJson) as User) : null;
        setState({ token, user, isLoading: false });
      } catch {
        setState({ token: null, user: null, isLoading: false });
      }
    }
    load();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => state.token);
  }, [state.token]);

  const handlePushToken = useCallback(
    (token: string) => {
      if (registeredToken.current === token) return;
      registeredToken.current = token;
      updateProfile({ expoPushToken: token }).catch(() => {});
    },
    []
  );

  const isAuthenticated = !!state.token && !state.isLoading;
  usePushNotifications(isAuthenticated, handlePushToken);

  const signIn = useCallback(async (token: string, user: User) => {
    queryClient.clear();
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ token, user, isLoading: false });
  }, []);

  const signOut = useCallback(async () => {
    updateProfile({ expoPushToken: null }).catch(() => {});
    registeredToken.current = null;
    queryClient.clear();
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem("QUERY_CACHE"),
    ]);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
