import {
  Navigate,
  Outlet,
} from "react-router-dom";

interface ProtectedRouteProps {
  role: "admin" | "delivery";
}

function ProtectedRoute({
  role,
}: ProtectedRouteProps) {
  const token =
    role === "admin"
      ? localStorage.getItem(
          "adminToken"
        )
      : localStorage.getItem(
          "deliveryToken"
        );

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;