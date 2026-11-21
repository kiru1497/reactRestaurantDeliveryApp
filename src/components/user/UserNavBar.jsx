import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { Search, ShoppingCart, LogOut, ChefHat, ImageOff } from "lucide-react";

export default function UserNavBar({
  searchQuery,
  onSearchChange,
  searchResults = [],
  onResultClick,
  onLogout,
}) {
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [showResults, setShowResults] = useState(false);

  const handleResultClick = (result) => {
    setShowResults(false);
    onResultClick?.(result);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleResultClick(result)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50"
                  >
                    {/* Image */}
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <ImageOff size={18} />
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-800">
                        {result.name}
                      </p>

                      <p className="text-xs capitalize text-stone-500">
                        {result.type}
                      </p>

                      {result.type === "recipe" && (
                        <p className="mt-1 text-xs font-semibold text-orange-700">
                          ₹{Number(result.price || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-stone-500">
                  No results found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Cart */}
          <button
            type="button"
            aria-label="Shopping cart"
            onClick={() => navigate("/cart")}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition hover:bg-orange-50 hover:text-orange-700"
          >
            <ShoppingCart size={19} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-700 sm:px-3"
          >
            <LogOut size={17} />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
