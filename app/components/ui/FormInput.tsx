import type { InputHTMLAttributes } from "react";

type FormInputProps = {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormInput = ({
  label,
  error,
  id,
  name,
  className = "",
  ...props
}: FormInputProps) => {
  return (
    <div className="form-control">
      <label htmlFor={id ?? name} className="label">
        <span className="label-text ml-1 mb-1">{label}</span>
      </label>

      <input
        id={id ?? name}
        name={name}
        className={`input input-bordered w-full rounded-md ${
          error ? "input-error" : ""
        } ${className}`}
        {...props}
      />

      {error && <span className="text-error mt-1 ml-1 text-sm">{error}</span>}
    </div>
  );
};

export default FormInput;
