import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Mail,
  LockKeyhole,
  LoaderCircle,
  ChefHat,
  Sparkles,
} from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

import { loginUser, clearAuthError } from "../features/auth/authSlice";

import { sendPasswordResetEmail } from "../firebase";

export default function Login() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(location.state?.message || "");

  const [messageType, setMessageType] = useState(
    location.state?.message ? "success" : "",
  );

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      await dispatch(loginUser({ email, password })).unwrap();

      console.log("Logged in successfully");

      navigate("/home", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address first.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setMessageType("");

    try {
      await sendPasswordResetEmail(email);

      setMessage("Password reset email sent. Check your inbox.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    dispatch(clearAuthError());
    setMessage("");
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="mb-9">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#B9472F]">
          <ChefHat size={25} />
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={15} className="text-[#C97946]" />

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#B9472F]">
            Welcome back
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#30251F] sm:text-[34px]">
          Sign in to your account
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#8B7B70]">
          Sign in and get ready to discover something delicious.
        </p>
      </div>

      {/* Login form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={handleInputChange(setEmail)}
          autoComplete="email"
          icon={Mail}
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
        />

        {/* Forgot password */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-semibold text-[#B9472F] transition hover:text-[#92351F] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success / information message */}
        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-green-100 bg-green-50 text-green-700"
                : "border-red-100 bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#B9472F] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#B9472F]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A23B27] hover:shadow-xl hover:shadow-[#B9472F]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in to your account
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      {/* Signup navigation */}
      <div className="mt-9 border-t border-[#F0E8DF] pt-7">
        <p className="text-center text-sm text-[#85766B]">
          Don't have an account yet?{" "}
          <Link
            to="/signup"
            className="font-bold text-[#B9472F] transition hover:text-[#92351F]"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#FAF7F1] px-4 py-3">
          <LockKeyhole size={15} className="text-[#9A8A7D]" />

          <p className="text-xs text-[#85766B]">
            Are you an admin?{" "}
            <Link
              to="/admin/login"
              className="font-bold text-[#55443A] hover:text-[#B9472F]"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
