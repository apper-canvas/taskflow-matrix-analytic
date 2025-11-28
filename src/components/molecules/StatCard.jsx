import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendDirection = "up",
  color = "primary",
  className = "",
  onClick
}) => {
const colors = {
    primary: {
      icon: "text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900",
      trend: trendDirection === "up" ? "text-success-600" : "text-error-600"
    },
    success: {
      icon: "text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900",
      trend: "text-success-600"
    },
    warning: {
      icon: "text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900",
      trend: "text-warning-600"
    },
    error: {
      icon: "text-error-600 bg-error-100 dark:text-error-400 dark:bg-error-900",
      trend: "text-error-600"
    },
    gray: {
      icon: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
      trend: "text-gray-600"
    }
  }

  // Defensive fallback to prevent undefined access
  const safeColors = colors[color] || colors.primary

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "card p-6 transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {trend && (
<div className={cn("flex items-center gap-1 mt-2", safeColors.trend)}>
              <ApperIcon 
                name={trendDirection === "up" ? "TrendingUp" : "TrendingDown"} 
                className="h-4 w-4" 
              />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-lg",
safeColors.icon
        )}>
          <ApperIcon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard