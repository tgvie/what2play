import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/** Primary button */
export default function Button({
  children,
  href,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-pink px-6 py-2 text-base font-semibold text-surface shadow-lg shadow-pink/20 transition-all duration-200 hover:bg-pink-light hover:shadow-pink/30 disabled:cursor-not-allowed disabled:opacity-50";

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${className}`}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </button>
  );
}
