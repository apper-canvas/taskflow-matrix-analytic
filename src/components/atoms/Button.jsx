import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Button = forwardRef(({ 
  children, 
  className = "", 
  variant = "primary", 
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800",
    secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800",
    success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 active:bg-success-800",
    warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 active:bg-warning-800",
    error: "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 active:bg-error-800"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  }
  
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          className="h-4 w-4 animate-spin mr-2" 
        />
      )}
      
      {!loading && icon && iconPosition === "left" && (
        <ApperIcon 
          name={icon} 
          className="h-4 w-4 mr-2" 
        />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon 
          name={icon} 
          className="h-4 w-4 ml-2" 
        />
      )}
    </button>
  )
})

Button.displayName = "Button"

export default Button