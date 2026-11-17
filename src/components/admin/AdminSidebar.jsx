import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  LayoutDashboard,
  Tags,
  BookOpen,
  ShoppingBag,
  LogOut,
} from "lucide-react";

import { logout } from "../../features/auth/authSlice";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Recipes",
    path: "/admin/recipe",
    icon: BookOpen,
  },
  {
    name: "Orders",
    path: "/admin/order",
    icon: ShoppingBag,
  },
];

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication state from Redux
    dispatch(logout());

    // Redirect to admin login page
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      {/* Sidebar heading */}
      <div className="flex h-16 shrink-0 items-center px-5">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-1 md:py-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={17} strokeWidth={1.8} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="mt-auto border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} strokeWidth={1.8} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
