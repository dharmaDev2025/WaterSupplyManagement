import { useEffect, useRef } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function AuthSuccess() {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const { login } = useAuth();

  // Prevent Google login logic from running twice
  // in React StrictMode during development
  const hasProcessed = useRef(false);


  useEffect(() => {

    const handleGoogleLogin = async () => {

      // Prevent duplicate execution
      if (hasProcessed.current) {
        return;
      }

      hasProcessed.current = true;


      try {

        // =====================================
        // GET JWT FROM URL
        // =====================================

        const token =
          searchParams.get("token");


        if (!token) {

          console.log(
            "Google login token not found"
          );

          navigate("/", {
            replace: true,
          });

          return;
        }


        console.log(
          "Google authentication successful"
        );


        // =====================================
        // LOGIN USING AUTH CONTEXT
        // =====================================

        // login() will:
        // 1. Save JWT in localStorage
        // 2. Call /customers/profile
        // 3. Store customer in AuthContext

        await login(token);


        // =====================================
        // GO TO DASHBOARD
        // =====================================

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );


      } catch (error) {

        console.log(
          "Google Login Error:",
          error
        );


        // Remove invalid token
        localStorage.removeItem(
          "token"
        );


        // Return to login
        navigate(
          "/",
          {
            replace: true,
          }
        );
      }
    };


    handleGoogleLogin();

  }, [
    login,
    navigate,
    searchParams,
  ]);


  // =====================================
  // LOADING SCREEN
  // =====================================

  return (

    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4">


      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">


        {/* LOGO */}

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/20">

          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9"
          >

            <path
              d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
              fill="white"
            />

          </svg>

        </div>


        {/* SPINNER */}

        <div className="mx-auto mt-7 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />


        {/* TEXT */}

        <h1 className="mt-6 text-2xl font-bold text-gray-900">

          Signing you in...

        </h1>


        <p className="mt-3 text-sm leading-6 text-gray-500">

          Your Google account has been verified.
          We're preparing your AquaFlow account.

        </p>

      </div>

    </div>
  );
}


export default AuthSuccess;