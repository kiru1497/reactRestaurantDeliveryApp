import { UtensilsCrossed, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, variant = "customer" }) {
  const isAdmin = variant === "admin";

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl min-h-[620px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 grid md:grid-cols-2">
          {/* Admin branding panel */}
          <div className="hidden md:flex flex-col justify-between bg-[#17243A] p-10 lg:p-14 text-white">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={24} />
                </div>

                <span className="text-xl font-bold tracking-tight">
                  Savora<span className="text-slate-400">.</span>
                </span>
              </div>

              <div className="mt-24">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Administration portal
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
                  Manage your
                  <br />
                  restaurant.
                  <br />
                  <span className="text-slate-400">With confidence.</span>
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
                  Access your restaurant operations, manage orders, and keep
                  everything running smoothly from one place.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-xs text-slate-400">
                Secure administrator access
              </p>
            </div>
          </div>

          {/* Admin form panel */}
          <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14">
            <div className="mb-10 md:hidden">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck size={25} />
                <span className="text-xl font-bold">Savora.</span>
              </div>
            </div>

            {children}

            <div className="mt-10 border-t border-slate-100 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Return to customer login
              </Link>
            </div>
          </div>
        </div>

        <div className="fixed bottom-3 left-0 right-0 text-center text-xs text-slate-400">
          © 2026 Savora. Administrative access only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex flex-col">
      {/* Customer header */}
      <header className="relative z-10 border-b border-orange-100/70 bg-[#FAF7F1]/95 px-5 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B9472F] text-white shadow-md shadow-orange-900/10">
              <UtensilsCrossed size={21} />
            </div>

            <span className="text-2xl font-extrabold tracking-tight text-[#30251F]">
              Savora<span className="text-[#B9472F]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-[#82756B] sm:flex">
            <span>Good food.</span>
            <span className="text-[#C45B40]">Good moments.</span>
          </div>
        </div>
      </header>

      {/* Customer authentication content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#5B3520]/10 lg:min-h-[650px] lg:grid-cols-2">
          {/* Food photography panel */}
          <div className="relative hidden overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85"
              alt="Freshly prepared pizza served at a restaurant"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#24150F]/95 via-[#24150F]/35 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-12 text-white">
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                Made for food lovers
              </span>

              <h2 className="mt-6 max-w-md text-4xl font-bold leading-tight xl:text-5xl">
                Great food,
                <br />
                delivered with
                <br />
                <span className="text-[#F6C28B]">a little love.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
                Discover delicious meals, explore local favourites, and enjoy
                the food you love, wherever you are.
              </p>

              <div className="mt-9 flex items-center gap-2">
                <div className="h-1.5 w-10 rounded-full bg-[#F6C28B]" />
                <div className="h-1.5 w-3 rounded-full bg-white/40" />
                <div className="h-1.5 w-3 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </main>

      <footer className="px-5 pb-5 text-center text-xs text-[#9A8D82]">
        © 2026 Savora. Made with love for food lovers.
      </footer>
    </div>
  );
}
