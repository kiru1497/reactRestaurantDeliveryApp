import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  LoaderCircle,
  ArrowRight,
  Lock,
} from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

import { loginAdmin, clearAuthError } from "../features/auth/authSlice";

export default function AdminLogin() {
  const dispatch = useDispatch();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginAdmin({ email, password })).unwrap();

      console.log("Admin logged in successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    dispatch(clearAuthError());
  };

  return (
    <AuthLayout variant="admin">
      {/* Admin heading */}
      <div className="mb-9">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#17243A]">
          <ShieldCheck size={29} strokeWidth={1.7} />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Administrator access
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to access your administration portal and manage restaurant
          operations.
        </p>
      </div>

      {/* Admin login form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          name="email"
          type="email"
          label="Email address"
          placeholder="admin@example.com"
          value={email}
          onChange={handleInputChange(setEmail)}
          autoComplete="username"
          icon={Mail}
          variant="admin"
        />

        <AuthInput
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={handleInputChange(setPassword)}
          autoComplete="current-password"
          icon={LockKeyhole}
          variant="admin"
        />

        {/* Error */}
        {error && (
          <div
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-[#17243A] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#253750] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign in to dashboard
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      {/* Security notice */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Lock size={17} className="mt-0.5 shrink-0 text-slate-500" />

        <div>
          <p className="text-xs font-semibold text-slate-700">
            Secure administrator access
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            This portal is restricted to authorised administrators. Your
            credentials are protected by Firebase Authentication.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
