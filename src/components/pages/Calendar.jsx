import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const Calendar = () => {
  // Mock calendar data - in a real app this would come from a service
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = currentDate.getDate()

  // Generate calendar days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const days = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Mock task dots for demo
  const hasTasksOn = [3, 8, 12, 15, 18, 22, 25, 28]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your tasks and deadlines in calendar format.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2">
            <ApperIcon name="ChevronLeft" className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button className="btn-ghost p-2">
            <ApperIcon name="ChevronRight" className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-gray-100 dark:border-gray-700 rounded-lg relative
                ${day ? "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" : ""}
                ${day === today ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700" : ""}
              `}
            >
              {day && (
                <>
                  <div className={`
                    text-sm font-medium mb-1
                    ${day === today 
                      ? "text-primary-700 dark:text-primary-300" 
                      : "text-gray-900 dark:text-gray-100"
                    }
                  `}>
                    {day}
                  </div>
                  
                  {/* Task indicators */}
                  {hasTasksOn.includes(day) && (
                    <div className="flex flex-wrap gap-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Legend
        </h3>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High Priority Tasks</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium Priority Tasks</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Low Priority Tasks</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-100 dark:bg-primary-900 border-2 border-primary-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </motion.div>

      {/* Today's Tasks Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ApperIcon name="Calendar" className="h-5 w-5" />
          Today's Tasks
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-4 h-4 text-primary-600" />
            <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
              Review project documentation
            </span>
            <span className="text-xs text-primary-600 bg-primary-100 dark:text-primary-300 dark:bg-primary-900 px-2 py-1 rounded">
              High
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-4 h-4 text-primary-600" />
            <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
              Team meeting at 2:00 PM
            </span>
            <span className="text-xs text-warning-600 bg-warning-100 dark:text-warning-300 dark:bg-warning-900 px-2 py-1 rounded">
              Medium
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input type="checkbox" className="w-4 h-4 text-primary-600" checked readOnly />
            <span className="flex-1 text-sm text-gray-500 dark:text-gray-400 line-through">
              Send weekly report
            </span>
            <span className="text-xs text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 px-2 py-1 rounded">
              Completed
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Calendar