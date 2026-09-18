import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";


function Dashboard() {

  const navigate = useNavigate();

  const { user } = useAuth();


  return (

    <div className="flex min-h-screen flex-col bg-gray-50">


      {/* ================================= */}
      {/* FIXED NAVBAR */}
      {/* ================================= */}

      <Navbar />


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      {/* pt-20 because navbar height is h-20 */}

      <main className="flex-1 pt-20">


        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">


          {/* ================================= */}
          {/* HERO SECTION */}
          {/* ================================= */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-7 py-10 text-white shadow-xl shadow-blue-500/10 sm:px-10 lg:px-14 lg:py-14">


            {/* DECORATION */}

            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-cyan-300/20" />

            <div className="absolute right-24 top-20 hidden h-28 w-28 rounded-full bg-white/10 blur-sm lg:block" />


            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">


              {/* HERO TEXT */}

              <div>

                <p className="mb-2 font-medium text-blue-100">
                  Welcome back,
                </p>


                <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">

                  {user?.name ||
                    "Customer"} 👋

                </h1>


                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">

                  Fresh and safe drinking water delivered
                  directly to your home, office, shop or
                  hotel. Choose your product and place your
                  order in just a few steps.

                </p>


                <div className="mt-7 flex flex-wrap gap-3">


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/products"
                      )
                    }
                    className="rounded-xl bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Order Water
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/my-orders"
                      )
                    }
                    className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    My Orders
                  </button>

                </div>

              </div>


              {/* WATER VISUAL */}

              <div className="relative hidden justify-center lg:flex">


                <div className="flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">


                  <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/10">


                    <svg
                      viewBox="0 0 24 24"
                      className="h-28 w-28"
                    >

                      <path
                        d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                        fill="white"
                        fillOpacity="0.95"
                      />

                    </svg>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ================================= */}
          {/* QUICK ACTION HEADING */}
          {/* ================================= */}

          <section className="mt-12">


            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">


              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Quick Access
                </p>


                <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  What would you like to do?
                </h2>


                <p className="mt-2 text-sm text-gray-500">
                  Manage your water orders from one place.
                </p>

              </div>

            </div>


            {/* ================================= */}
            {/* QUICK ACTION CARDS */}
            {/* ================================= */}

            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


              {/* ORDER WATER */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/products"
                  )
                }
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
              >


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                  >

                    <path
                      d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                      fill="#2563eb"
                    />

                  </svg>

                </div>


                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Order Water
                </h3>


                <p className="mt-2 text-sm leading-6 text-gray-500">

                  Browse available water jars and bottles.

                </p>


                <p className="mt-5 text-sm font-semibold text-blue-600">
                  Browse Products →
                </p>

              </button>


              {/* MY ORDERS */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/my-orders"
                  )
                }
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl"
              >


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">

                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />

                  </svg>

                </div>


                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  My Orders
                </h3>


                <p className="mt-2 text-sm leading-6 text-gray-500">

                  View your current and previous orders.

                </p>


                <p className="mt-5 text-sm font-semibold text-blue-600">
                  View Orders →
                </p>

              </button>


              {/* TRACK */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/my-orders"
                  )
                }
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-100 hover:shadow-xl"
              >


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">

                  <svg
                    className="h-6 w-6 text-cyan-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17a2 2 0 104 0m-4 0H5a2 2 0 01-2-2V7a2 2 0 012-2h9v10m-5 2h4m0 0h4m0 0a2 2 0 104 0m-4 0V9h3l3 4v2a2 2 0 01-2 2h-1"
                    />

                  </svg>

                </div>


                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  Track Order
                </h3>


                <p className="mt-2 text-sm leading-6 text-gray-500">

                  Check the latest status of your order.

                </p>


                <p className="mt-5 text-sm font-semibold text-blue-600">
                  Track Status →
                </p>

              </button>


              {/* PROFILE */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/profile"
                  )
                }
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-xl"
              >


                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">

                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />

                  </svg>

                </div>


                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  My Profile
                </h3>


                <p className="mt-2 text-sm leading-6 text-gray-500">

                  Manage your account and delivery details.

                </p>


                <p className="mt-5 text-sm font-semibold text-blue-600">
                  Manage Profile →
                </p>

              </button>

            </div>

          </section>


          {/* ================================= */}
          {/* INFORMATION SECTION */}
          {/* ================================= */}

          <section className="mt-12 grid gap-6 lg:grid-cols-2">


            {/* DELIVERY LOCATION */}

            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">


              <div className="flex items-start gap-4">


                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 21s6-5.686 6-11a6 6 0 10-12 0c0 5.314 6 11 6 11z"
                    />

                    <circle
                      cx="12"
                      cy="10"
                      r="2"
                    />

                  </svg>

                </div>


                <div>

                  <h3 className="text-lg font-bold text-gray-900">
                    Default Delivery Location
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-gray-500">

                    Your saved address and map coordinates
                    will be used as your default delivery
                    location while placing an order.

                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/profile"
                      )
                    }
                    className="mt-4 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Manage Location →
                  </button>

                </div>

              </div>

            </div>


            {/* SECURE PAYMENT */}

            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">


              <div className="flex items-start gap-4">


                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">

                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5-4A11.95 11.95 0 0112 3a11.95 11.95 0 01-8 3c0 5.25 3.44 10.74 8 12 4.56-1.26 8-6.75 8-12z"
                    />

                  </svg>

                </div>


                <div>

                  <h3 className="text-lg font-bold text-gray-900">
                    Secure Online Payment
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-gray-500">

                    Complete your water order using our
                    secure online payment process. Your
                    order is confirmed only after successful
                    payment verification.

                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/products"
                      )
                    }
                    className="mt-4 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Order Now →
                  </button>

                </div>

              </div>

            </div>

          </section>


          {/* ================================= */}
          {/* HOW IT WORKS */}
          {/* ================================= */}

          <section className="mt-12 rounded-3xl bg-white p-7 shadow-sm sm:p-10">


            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Simple Process
              </p>


              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                How AquaFlow Works
              </h2>


              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                Get fresh water delivered in just four simple steps.
              </p>

            </div>


            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">


              {/* STEP 1 */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                  1
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  Choose Product
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Select your required jar or water bottle.
                </p>

              </div>


              {/* STEP 2 */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-600">
                  2
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  Confirm Delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Select or confirm your delivery location.
                </p>

              </div>


              {/* STEP 3 */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                  3
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  Make Payment
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Complete the payment securely online.
                </p>

              </div>


              {/* STEP 4 */}

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 font-bold text-green-600">
                  4
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  Get Delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Track your order status until delivery.
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <Footer />

    </div>
  );
}


export default Dashboard;