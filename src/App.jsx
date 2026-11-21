import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import UserHome from "./pages/UserHome";

import CategoryRecipes from "./pages/user/CategoryRecipes";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import OrderHistory from "./pages/user/OrderHistory";

import AdminRoute from "./routes/AdminRoute";
import UserRoute from "./routes/UserRoute";

import AdminLayout from "./components/admin/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminRecipe from "./pages/admin/AdminRecipe";
import AdminOrder from "./pages/admin/AdminOrder";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Customer authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected customer routes */}
      <Route element={<UserRoute />}>
        <Route path="/home" element={<UserHome />} />

        {/* Category-specific recipes */}
        <Route
          path="/categories/:categoryId/recipes"
          element={<CategoryRecipes />}
        />

        {/* Shopping cart */}
        <Route path="/cart" element={<Cart />} />

        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Order confirmation */}
        <Route path="/order-confirmation" element={<OrderConfirmation />} />

        {/* Order history */}
        <Route path="/order-history" element={<OrderHistory />} />
      </Route>

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="categories" element={<AdminCategories />} />

          <Route path="recipe" element={<AdminRecipe />} />

          <Route path="order" element={<AdminOrder />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
