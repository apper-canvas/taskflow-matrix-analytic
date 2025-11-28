import React, { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Checkbox from "@/components/atoms/Checkbox";
import Badge from "@/components/atoms/Badge";
import TaskDetail from "@/components/molecules/TaskDetail";
import { formatRecurrencePattern } from "@/utils/recurrence";
import { cn } from "@/utils/cn";
import { getPriorityColor, getPriorityIcon, formatTime } from "@/utils/priority";
import { formatTaskDate, isDueToday, isOverdue } from "@/utils/date";

const TaskCard = ({ task, onToggleComplete, onEdit, onLinkTasks, onUnlinkTasks, className = "" }) => {
  const [showDependencies, setShowDependencies] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  
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

  // Dependency status indicators
  const dependencyStatus = {
    canStart: !task.dependencies || task.dependencies.length === 0 || task.dependencies.every(dep => dep.completed),
    pendingCount: task.dependencies ? task.dependencies.filter(dep => !dep.completed).length : 0,
    completedCount: task.dependencies ? task.dependencies.filter(dep => dep.completed).length : 0
  }

  const handleDependencyToggle = (e) => {
    e.stopPropagation()
    setShowDependencies(!showDependencies)
  }

  // Format next occurrence for recurring tasks
  const formatNextOccurrence = () => {
    if (!task.nextOccurrence) return ""
    return formatTaskDate(task.nextOccurrence)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -1 }}
      className={cn(
        "card p-4 cursor-pointer transition-all duration-200 hover:shadow-md relative",
        task.completed && "opacity-60",
        !dependencyStatus.canStart && !task.completed && "border-l-4 border-l-warning-400",
        task.isRecurring && "border-l-4 border-l-secondary-400",
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
            <div className="flex items-center gap-2 flex-1">
              <h3 className={cn(
                "text-sm font-medium text-gray-900 dark:text-gray-100",
                task.completed && "line-through text-gray-500 dark:text-gray-400"
              )}>
                {task.title}
              </h3>
              
              {/* Recurrence Indicator */}
              {task.isRecurring && task.recurrence && (
                <Badge 
                  size="sm" 
                  variant="secondary" 
                  className="text-xs bg-secondary-50 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-100"
                  title={formatRecurrencePattern(task.recurrence)}
                >
                  <ApperIcon name="Repeat" className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
              
              {/* Parent Task Indicator */}
              {task.parentTaskId && (
                <Badge 
                  size="sm" 
                  variant="secondary" 
                  className="text-xs"
                  title="Generated from recurring task"
                >
                  <ApperIcon name="RotateCcw" className="h-3 w-3 mr-1" />
                  Instance
                </Badge>
              )}
              
              {/* Dependency Status Indicators */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDependencyToggle}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={`${dependencyStatus.completedCount}/${task.dependencies.length} dependencies completed`}
                  >
                    <ApperIcon 
                      name="GitBranch" 
                      className={cn(
                        "h-3 w-3",
                        dependencyStatus.canStart ? "text-success-600" : "text-warning-600"
                      )} 
                    />
                    <span className={cn(
                      "font-medium",
                      dependencyStatus.canStart ? "text-success-600" : "text-warning-600"
                    )}>
                      {dependencyStatus.completedCount}/{task.dependencies.length}
                    </span>
                  </button>
                  {!dependencyStatus.canStart && (
                    <Badge size="sm" variant="warning" className="text-xs">
                      Blocked
                    </Badge>
                  )}
                </div>
              )}
              
              {task.blockingCount > 0 && (
                <Badge size="sm" variant="secondary" className="text-xs" title={`Blocking ${task.blockingCount} task${task.blockingCount > 1 ? 's' : ''}`}>
                  Blocks {task.blockingCount}
                </Badge>
              )}
            </div>
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

          {/* Recurrence Details */}
          {task.isRecurring && task.recurrence && (
            <div className="mb-3 p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                <ApperIcon name="Repeat" className="h-3 w-3 text-secondary-600 dark:text-secondary-400" />
                <span className="text-secondary-700 dark:text-secondary-300 font-medium">
                  {formatRecurrencePattern(task.recurrence)}
                </span>
              </div>
              {task.nextOccurrence && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  <ApperIcon name="Clock" className="h-3 w-3 text-secondary-600 dark:text-secondary-400" />
                  <span className="text-secondary-600 dark:text-secondary-400">
                    Next: {formatNextOccurrence()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dependency Details */}
          {showDependencies && task.dependencies && task.dependencies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Dependencies:
              </div>
              <div className="space-y-2">
                {task.dependencies.map(dep => (
                  <div key={dep.Id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ApperIcon 
                        name={dep.completed ? "CheckCircle" : "Circle"} 
                        className={cn(
                          "h-3 w-3",
                          dep.completed ? "text-success-600" : "text-gray-400"
                        )} 
                      />
                      <span className={cn(
                        dep.completed && "line-through text-gray-500 dark:text-gray-400"
                      )}>
                        {dep.title}
                      </span>
                      <Badge 
                        size="sm" 
                        variant={dep.completed ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {dep.status}
                      </Badge>
                    </div>
                    {onUnlinkTasks && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnlinkTasks(task.Id, dep.Id)
                        }}
                        className="text-error-500 hover:text-error-600 transition-colors"
                        title="Remove dependency"
                      >
                        <ApperIcon name="X" className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
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

              {task.category && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ApperIcon name="Tag" className="h-3 w-3" />
                  {task.category}
                </div>
              )}

              {(task.estimatedTime > 0 || task.timeSpent > 0) && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ApperIcon name="Clock" className="h-3 w-3" />
                  {task.timeSpent > 0 && task.estimatedTime > 0 
                    ? `${formatTime(task.timeSpent)} / ${formatTime(task.estimatedTime)}`
                    : task.timeSpent > 0 
                      ? formatTime(task.timeSpent)
                      : `Est. ${formatTime(task.estimatedTime)}`}
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
      
      {/* Task Detail Modal */}
      {showTaskDetail && (
        <TaskDetail
          task={task}
          isOpen={showTaskDetail}
          onClose={() => setShowTaskDetail(false)}
          onTaskUpdate={(updatedTask) => {
            // Update parent component if needed
            setShowTaskDetail(false)
          }}
        />
      )}
    </motion.div>
  )
}

export default TaskCard