import React from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { useTheme } from "@/hooks/useTheme"

const Header = ({ title, onMenuToggle, showMenuButton = false }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMenuToggle}
            className="lg:hidden"
          />
        )}
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-gray-100 hidden sm:block">
              TaskFlow Pro
            </span>
          </div>
          
          {title && (
            <>
              <ApperIcon name="ChevronRight" className="h-4 w-4 text-gray-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={isDark ? "Sun" : "Moon"}
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
        />
        
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
          <ApperIcon name="User" className="h-4 w-4 text-white" />
        </div>
      </div>
    </header>
  )
}

export default Header