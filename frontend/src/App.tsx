import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetotp";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/Myorders";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ======================= */}
        {/* PUBLIC ROUTES */}
        {/* ======================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/auth-success"
          element={<AuthSuccess />}
        />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}

/>
 
        <Route
  path="/verify-reset-otp"
  element={<VerifyResetOtp/>}
  
/>

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />




        {/* ======================= */}
        {/* PROTECTED ROUTES */}
        {/* ======================= */}

        <Route element={<ProtectedRoute />}>
        <Route path="/my-orders" element={<MyOrders/>}/>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route path="/products" element={<Products/>}/>
               <Route path="/profile" element={<Profile/>}/>
                <Route path="/cart" element={<Cart/>}/>
                <Route
  path="/checkout"
  element={<Checkout />}
/>



        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default App;