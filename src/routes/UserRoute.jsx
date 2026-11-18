import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UserRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isCustomer = isAuthenticated && user?.role === "user";

  if (!isCustomer) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
