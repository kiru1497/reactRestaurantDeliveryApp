import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  autoComplete,
  icon: Icon,
  variant = "customer",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const inputId = name || label?.toLowerCase().replace(/\s+/g, "-");

  const isAdmin = variant === "admin";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-2 block text-sm font-semibold ${
            isAdmin ? "text-slate-700" : "text-[#51443B]"
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              isAdmin ? "text-slate-400" : "text-[#A8998B]"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border py-3.5 text-sm outline-none transition-all duration-200
            placeholder:text-[#B4A99F]
            ${Icon ? "pl-11" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            ${
              isAdmin
                ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
                : "border-[#E9E0D6] bg-[#FFFEFC] text-[#30251F] focus:border-[#B9472F] focus:bg-white focus:ring-4 focus:ring-[#B9472F]/10"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${
              isAdmin
                ? "text-slate-400 hover:text-slate-700"
                : "text-[#A8998B] hover:text-[#B9472F]"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
    </div>
  );
}
