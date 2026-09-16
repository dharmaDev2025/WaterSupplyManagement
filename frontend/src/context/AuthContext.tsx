import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

// ==========================================
// USER INTERFACE
// ==========================================

interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  customerType?: string;
}

// ==========================================
// AUTH CONTEXT INTERFACE
// ==========================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// ==========================================
// CREATE CONTEXT
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Store logged-in user
  const [user, setUser] = useState<User | null>(null);

  // Used while checking login status
  const [loading, setLoading] = useState<boolean>(true);

  // ==========================================
  // FETCH USER PROFILE
  // ==========================================

  const fetchUser = async () => {
    try {
      // Check token
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      // api.ts will automatically send:
      // Authorization: Bearer <token>

      const response = await api.get("/customers/profile");

      console.log("Profile Response:", response.data);

      // Get customer from backend response
      const customer =
        response.data.customer ||
        response.data.user ||
        response.data.data;

      setUser(customer);
    } catch (error) {
      console.log("Profile Fetch Error:", error);

      // Token may be invalid or expired
      localStorage.removeItem("token");

      setUser(null);
    }
  };

  // ==========================================
  // CHECK LOGIN WHEN APPLICATION STARTS
  // ==========================================

  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);

      await fetchUser();

      setLoading(false);
    };

    checkLogin();
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (token: string) => {
    // Store only JWT
    // Do NOT store "Bearer" here
    localStorage.setItem("token", token);

    // Fetch logged-in customer
    await fetchUser();
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");

    setUser(null);
  };

  // ==========================================
  // PROVIDE AUTH DATA
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}