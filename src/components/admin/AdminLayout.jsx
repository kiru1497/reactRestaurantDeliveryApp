import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
