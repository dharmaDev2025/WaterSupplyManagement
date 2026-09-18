import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState<boolean>(false);


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    logout();

    navigate("/", {
      replace: true,
    });
  };


  // ==========================================
  // NAVIGATION
  // ==========================================

  const handleNavigate = (
    path: string
  ) => {

    navigate(path);

    setMobileMenuOpen(false);
  };


  // ==========================================
  // ACTIVE LINK
  // ==========================================

  const isActive = (
    path: string
  ) => {

    return location.pathname === path;
  };


  return (

    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">


      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">


        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <button
          type="button"
          onClick={() =>
            handleNavigate(
              "/dashboard"
            )
          }
          className="flex items-center gap-3"
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md shadow-blue-500/20">

            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >

              <path
                d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                fill="white"
              />

            </svg>

          </div>


          <div className="text-left">

            <h1 className="text-xl font-bold leading-none text-gray-900">
              AquaFlow
            </h1>

            <p className="mt-1 hidden text-[11px] font-medium text-gray-400 sm:block">
              Pure Water Delivery
            </p>

          </div>

        </button>


        {/* ================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================= */}

        <div className="hidden items-center gap-1 lg:flex">


          {/* HOME */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/dashboard"
              )
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive("/dashboard")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            Home
          </button>


          {/* PRODUCTS */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/products"
              )
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive("/products")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            Products
          </button>


          {/* ORDERS */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/my-orders"
              )
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive("/my-orders")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            My Orders
          </button>


          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/profile"
              )
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive("/profile")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            Profile
          </button>

        </div>


        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex items-center gap-3">


          {/* CART */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/cart"
              )
            }
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:flex"
            aria-label="Shopping cart"
          >

            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />

            </svg>

          </button>


          {/* USER INFORMATION */}

          <button
            type="button"
            onClick={() =>
              handleNavigate(
                "/profile"
              )
            }
            className="hidden items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-gray-50 sm:flex"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 font-bold uppercase text-blue-600">

              {user?.name
                ?.charAt(0)
                .toUpperCase() || "U"}

            </div>


            <div className="hidden text-left xl:block">

              <p className="max-w-[130px] truncate text-sm font-semibold text-gray-800">
                {user?.name ||
                  "Customer"}
              </p>

              <p className="text-xs capitalize text-gray-400">
                {user?.customerType ||
                  "Customer"}
              </p>

            </div>

          </button>


          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="hidden rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 lg:block"
          >
            Logout
          </button>


          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 lg:hidden"
            aria-label="Open navigation menu"
          >

            {mobileMenuOpen ? (

              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />

              </svg>

            ) : (

              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />

              </svg>

            )}

          </button>

        </div>

      </nav>


      {/* ================================= */}
      {/* MOBILE NAVIGATION */}
      {/* ================================= */}

      {mobileMenuOpen && (

        <div className="border-t border-gray-100 bg-white px-5 py-5 shadow-lg lg:hidden">

          <div className="mx-auto max-w-7xl">


            {/* MOBILE USER */}

            <div className="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold uppercase text-blue-600">

                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}

              </div>


              <div>

                <p className="font-semibold text-gray-800">
                  {user?.name}
                </p>

                <p className="text-xs capitalize text-gray-400">
                  {user?.customerType ||
                    "Customer"}
                </p>

              </div>

            </div>


            <div className="space-y-1">

              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/dashboard"
                  )
                }
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                Home
              </button>


              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/products"
                  )
                }
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                Products
              </button>


              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/my-orders"
                  )
                }
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                My Orders
              </button>


              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/cart"
                  )
                }
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                Cart
              </button>


              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    "/profile"
                  )
                }
                className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              >
                Profile
              </button>


              <button
                type="button"
                onClick={
                  handleLogout
                }
                className="mt-2 w-full rounded-lg bg-red-50 px-4 py-3 text-left font-semibold text-red-500"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      )}

    </header>
  );
}


export default Navbar;