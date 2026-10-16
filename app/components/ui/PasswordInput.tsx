"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({
  label = "Password",
  error,
  name,
  id,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={id ?? name} className="mb-1 block">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id ?? name}
          name={name}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded border p-2 pr-10 ${className ?? ""} ${
            error ? "border-red-500" : ""
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
