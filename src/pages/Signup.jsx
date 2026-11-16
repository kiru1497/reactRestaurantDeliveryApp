import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  UserRound,
  UsersRound,
  Mail,
  LockKeyhole,
  LoaderCircle,
  ChefHat,
  Sparkles,
} from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

import { registerUser } from "../features/auth/authSlice";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setValidationError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setValidationError("");

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must contain at least 6 characters.");
      return;
    }

    if (!formData.firstName.trim() || !formData.fullName.trim()) {
      setValidationError("Please enter your name.");
      return;
    }

    try {
      await dispatch(
        registerUser({
          firstName: formData.firstName,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      console.log("Account created successfully");

      navigate("/login", {
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="mb-7">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#B9472F]">
          <ChefHat size={24} />
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-[#C97946]" />

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#B9472F]">
            Join the table
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#30251F]">
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#8B7B70]">
          Good food is better when there's more to discover.
        </p>
      </div>

      {/* Signup form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <AuthInput
          name="firstName"
          label="First name"
          placeholder="Your first name"
          value={formData.firstName}
          onChange={handleChange}
          autoComplete="given-name"
          icon={UserRound}
        />

        <AuthInput
          name="fullName"
          label="Full name"
          placeholder="Your full name"
          value={formData.fullName}
          onChange={handleChange}
          autoComplete="name"
          icon={UsersRound}
        />

        <AuthInput
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          icon={Mail}
        />

        <AuthInput
          name="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          icon={LockKeyhole}
        />

        <AuthInput
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          icon={LockKeyhole}
        />

        {/* Validation and Firebase errors */}
        {(validationError || error) && (
          <div
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {validationError || error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#B9472F] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#B9472F]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A23B27] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Creating your account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      {/* Login navigation */}
      <div className="mt-7 border-t border-[#F0E8DF] pt-6 text-center">
        <p className="text-sm text-[#85766B]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#B9472F] transition hover:text-[#92351F]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
