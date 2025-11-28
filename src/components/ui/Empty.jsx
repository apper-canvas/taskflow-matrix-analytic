import React from "react"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  title = "No items found",
  description = "Get started by creating your first item.",
  action,
  actionLabel = "Create Item",
  icon = "Inbox",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center max-w-md">
        <ApperIcon 
          name={icon} 
          className="h-16 w-16 text-gray-400 mx-auto mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
        {action && (
          <button
            onClick={action}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default Empty