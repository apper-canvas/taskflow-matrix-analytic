import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Input = forwardRef(({ 
  className = "", 
  type = "text",
  label,
  error,
  required = false,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm transition-colors",
          "border-gray-300 bg-white text-gray-900",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary-400",
          error && "border-error-500 focus:border-error-500 focus:ring-error-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input