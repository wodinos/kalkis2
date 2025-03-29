import React from 'react';

export function Button({ children, className, variant, size, ...props }) {
  const baseStyles = "rounded px-3 py-1 font-medium";
  const variantStyles = variant === "ghost" ? "bg-transparent" : "bg-gray-200";
  const sizeStyles = size === "sm" ? "text-sm" : "text-base";

  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}>
      {children}
    </button>
  );
}
