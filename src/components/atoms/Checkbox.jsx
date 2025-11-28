import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Checkbox = forwardRef(({ 
  className = "", 
  checked = false,
  onChange,
  label,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <label className="inline-flex items-center cursor-pointer group">
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={cn(
          "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
          checked 
            ? "bg-primary-600 border-primary-600" 
            : "bg-white border-gray-300 hover:border-primary-400 dark:bg-gray-700 dark:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed",
          "group-hover:border-primary-500",
          className
        )}>
          {checked && (
            <ApperIcon 
              name="Check" 
              className="h-3 w-3 text-white animate-checkbox"
            />
          )}
        </div>
      </div>
      {label && (
        <span className={cn(
          "ml-2 text-sm text-gray-700 dark:text-gray-300",
          disabled && "opacity-50"
        )}>
          {label}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = "Checkbox"

export default Checkbox