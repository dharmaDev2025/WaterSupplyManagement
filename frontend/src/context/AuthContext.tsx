import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";


interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  customerType?: string;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;

  login: (
    token: string
  ) => Promise<void>;

  logout: () => void;
}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);


  // ==============================
  // FETCH LOGGED-IN CUSTOMER
  // ==============================

  const fetchUser = async () => {

    try {

      const token =
        localStorage.getItem("token");


      if (!token) {

        setUser(null);

        return;
      }


      const response =
        await api.get(
          "/customers/profile"
        );


      const customer =
        response.data.customer ||
        response.data.user ||
        response.data.data;


      setUser(customer);

    }

    catch (error) {

      console.log(
        "Profile Fetch Error:",
        error
      );


      localStorage.removeItem(
        "token"
      );


      setUser(null);
    }
  };


  // ==============================
  // APPLICATION START
  // ==============================

  useEffect(() => {

    const checkLogin = async () => {

      setLoading(true);

      await fetchUser();

      setLoading(false);
    };


    checkLogin();

  }, []);


  // ==============================
  // LOGIN
  // ==============================

  const login = async (
    token: string
  ) => {

    localStorage.setItem(
      "token",
      token
    );


    await fetchUser();
  };


  // ==============================
  // LOGOUT
  // ==============================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    setUser(null);
  };


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


export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }


  return context;
}