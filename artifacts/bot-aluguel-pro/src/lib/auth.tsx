import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("bot_token");
  });

  useEffect(() => {
    setAuthTokenGetter(() => {
      const storedToken = localStorage.getItem("bot_token");
      return storedToken;
    });
  }, []);

  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false
    }
  });

  useEffect(() => {
    if (error && token) {
      // Token invalid
      logout();
    }
  }, [error, token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("bot_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("bot_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        token,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
