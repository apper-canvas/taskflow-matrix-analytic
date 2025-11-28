import React from "react"
import ApperIcon from "@/components/ApperIcon"

const ErrorView = ({ error = "Something went wrong", onRetry, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center max-w-md">
        <ApperIcon 
          name="AlertTriangle" 
          className="h-12 w-12 text-error-500 mx-auto mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="RotateCcw" className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorView