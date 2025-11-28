import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const Sidebar = ({ isOpen, onClose, isMobile = false }) => {
  const location = useLocation()

  const navigationItems = [
    { name: "Dashboard", href: "", icon: "LayoutDashboard" },
    { name: "My Tasks", href: "tasks", icon: "CheckSquare" },
    { name: "Today", href: "today", icon: "Calendar" },
    { name: "Upcoming", href: "upcoming", icon: "Clock" },
    { name: "Completed", href: "completed", icon: "CheckCircle2" },
    { name: "Projects", href: "projects", icon: "Folder" },
    { name: "Calendar", href: "calendar", icon: "CalendarDays" },
    { name: "Teams", href: "teams", icon: "Users" },
    { name: "Settings", href: "settings", icon: "Settings" }
  ]

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <ApperIcon name="CheckSquare" className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
            TaskFlow Pro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === `/${item.href}`
          
          return (
            <NavLink
              key={item.name}
              to={`/${item.href}`}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <ApperIcon name={item.icon} className="h-5 w-5" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 TaskFlow Pro
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:dark:bg-gray-800 lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
      {sidebarContent}
    </aside>
  )
}

export default Sidebar