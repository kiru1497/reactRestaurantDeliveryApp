import { useState } from "react";
import { Search, ShoppingCart, LogOut, ChefHat } from "lucide-react";

export default function UserNavbar({
  searchQuery,
  onSearchChange,
  searchResults,
  onLogout,
}) {
  const [showResults, setShowResults] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <ChefHat size={20} />
          </div>

          <span className="text-lg font-extrabold tracking-tight text-[#B9472F] sm:text-xl">
            Savora
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-3 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
            <Search size={17} className="shrink-0 text-stone-400" />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => {
                // Delay allows clicking a search result.
                setTimeout(() => setShowResults(false), 150);
              }}
              placeholder="Search categories or recipes..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Search results */}
          {showResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50"
                  >
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <ChefHat size={18} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">
                        {result.name}
                      </p>

                      <p className="text-xs capitalize text-stone-500">
                        {result.type}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-stone-500">
                  No categories or recipes found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Cart */}
          <button
            type="button"
            aria-label="Shopping cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <ShoppingCart size={19} />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <LogOut size={16} />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
