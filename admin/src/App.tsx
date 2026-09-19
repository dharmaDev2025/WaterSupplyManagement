import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminVerifyOtp from "./pages/AdminVerifyOtp";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminDeliveryBoys from "./pages/AdminDeliveryBoys";

import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryActiveOrders from "./pages/DeliveryActiveOrders";
import DeliveryDeliveredOrders from "./pages/DeliveryDeliveredOrders";
import DeliveryOrderDetails from "./pages/DeliveryOrderDetails";

import ProtectedRoute from "./components/Protected";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/admin/verify-otp"
          element={<AdminVerifyOtp />}
        />

        <Route
          element={
            <ProtectedRoute role="admin" />
          }
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/customers"
            element={<AdminCustomers />}
          />

          <Route
            path="/admin/delivery-boys"
            element={
              <AdminDeliveryBoys />
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute role="delivery" />
          }
        >
          <Route
            path="/delivery/dashboard"
            element={
              <DeliveryDashboard />
            }
          />

           <Route
            path="/delivery/orders"
            element={
              <DeliveryActiveOrders title="Active Orders">
                {null}
              </DeliveryActiveOrders>
            }
          /> 

           <Route
            path="/delivery/orders/:id"
            element={
              <DeliveryOrderDetails />
            }
          /> 

           <Route
            path="/delivery/delivered"
            element={
              <DeliveryDeliveredOrders />
            }
          />  
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;