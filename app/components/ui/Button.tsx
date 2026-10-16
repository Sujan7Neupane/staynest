type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const Button = ({
  children,
  type = "button",
  disabled = false,
  className = "",
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-primary rounded-md cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
