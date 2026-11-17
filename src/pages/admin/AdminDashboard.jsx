import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Tags,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowUpRight,
} from "lucide-react";

import { fetchCategories } from "../../features/categories/categoriesSlice";

function DashboardCard({ card }) {
  const Icon = card.icon;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex min-h-20 items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">{card.title}</p>

          <p className="mt-0.5 text-2xl font-bold leading-none text-slate-900">
            {card.value}
          </p>
        </div>
      </div>

      <Link
        to={card.link}
        className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
      >
        {card.linkText}
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();

  const { items: categories, status: categoryStatus } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    if (categoryStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryStatus]);

  const dashboardCards = [
    {
      title: "Categories",
      value: categories.length,
      icon: Tags,
      link: "/admin/categories",
      linkText: "View all categories",
    },
    {
      title: "Recipes",
      value: 4,
      icon: BookOpen,
      link: "/admin/recipe",
      linkText: "View all recipes",
    },
    {
      title: "Total Orders",
      value: 5,
      icon: ClipboardList,
      link: "/admin/order",
      linkText: "View all orders",
    },
    {
      title: "Pending Orders",
      value: 1,
      icon: Clock,
      link: "/admin/order",
      linkText: "View pending orders",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Page heading */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your restaurant operations.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <DashboardCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
