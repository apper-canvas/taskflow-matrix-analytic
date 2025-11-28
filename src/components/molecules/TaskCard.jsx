import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Checkbox from "@/components/atoms/Checkbox"
import { formatTaskDate, isOverdue, isDueToday } from "@/utils/date"
import { getPriorityColor, getPriorityIcon } from "@/utils/priority"
import { cn } from "@/utils/cn"

const TaskCard = ({ task, onToggleComplete, onEdit, className = "" }) => {
  const handleCompleteToggle = (e) => {
    e.stopPropagation()
    onToggleComplete(task.Id)
  }

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const priorityColor = getPriorityColor(task.priority)
  const priorityIcon = getPriorityIcon(task.priority)
  
  const isTaskOverdue = isOverdue(task.dueDate)
  const isTaskDueToday = isDueToday(task.dueDate)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -1 }}
      className={cn(
        "card p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
        task.completed && "opacity-60",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox
            checked={task.completed}
            onChange={handleCompleteToggle}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              "text-sm font-medium text-gray-900 dark:text-gray-100",
              task.completed && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.priority && (
                <Badge
                  size="sm"
                  className={cn("border", priorityColor)}
                >
                  <ApperIcon name={priorityIcon} className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1",
                  isTaskOverdue && "text-error-600 dark:text-error-400",
                  isTaskDueToday && "text-warning-600 dark:text-warning-400",
                  !isTaskOverdue && !isTaskDueToday && "text-gray-500 dark:text-gray-400"
                )}>
                  <ApperIcon name="Calendar" className="h-3 w-3" />
                  {formatTaskDate(task.dueDate)}
                  {isTaskOverdue && (
                    <Badge size="sm" variant="error" className="ml-1">
                      Overdue
                    </Badge>
                  )}
                </div>
              )}
              
              {task.projectName && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ApperIcon name="Folder" className="h-3 w-3" />
                  {task.projectName}
                </div>
              )}
            </div>
            
            {task.assigneeName && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <ApperIcon name="User" className="h-3 w-3" />
                {task.assigneeName}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard