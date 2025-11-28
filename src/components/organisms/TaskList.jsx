import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import TaskCard from "@/components/molecules/TaskCard"
import Empty from "@/components/ui/Empty"
import { groupTasksByDate } from "@/utils/date"
import { sortTasksByPriority } from "@/utils/priority"
import { cn } from "@/utils/cn"

const TaskList = ({ 
  tasks = [], 
  onToggleComplete, 
  onEdit, 
  showGrouping = true,
  emptyMessage = "No tasks found",
  emptyDescription = "Create your first task to get started.",
  onAddTask,
  className = ""
}) => {
  const [sortBy, setSortBy] = useState("dueDate") // dueDate, priority, created
  const [filter, setFilter] = useState("all") // all, pending, completed

  if (!tasks.length) {
    return (
      <Empty
        title={emptyMessage}
        description={emptyDescription}
        action={onAddTask}
        actionLabel="Add Task"
        icon="CheckSquare"
        className={className}
      />
    )
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  // Sort tasks
  let sortedTasks = [...filteredTasks]
  switch (sortBy) {
    case "priority":
      sortedTasks = sortTasksByPriority(sortedTasks)
      break
    case "created":
      sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case "dueDate":
    default:
      sortedTasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
      break
  }

  const renderTasksByGroup = () => {
    if (!showGrouping) {
      return (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )
    }

    const groups = groupTasksByDate(sortedTasks)
    
    return (
      <div className="space-y-6">
        {groups.overdue.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-error-600 dark:text-error-400 mb-3 flex items-center gap-2">
              <ApperIcon name="AlertTriangle" className="h-4 w-4" />
              Overdue ({groups.overdue.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {groups.overdue.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {groups.today.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ApperIcon name="Calendar" className="h-4 w-4" />
              Today ({groups.today.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {groups.today.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {groups.tomorrow.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ApperIcon name="Clock" className="h-4 w-4" />
              Tomorrow ({groups.tomorrow.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {groups.tomorrow.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {groups.thisWeek.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ApperIcon name="CalendarDays" className="h-4 w-4" />
              This Week ({groups.thisWeek.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {groups.thisWeek.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {groups.upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <ApperIcon name="ArrowRight" className="h-4 w-4" />
              Upcoming ({groups.upcoming.length})
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {groups.upcoming.map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field text-sm py-1"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm py-1"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created">Created Date</option>
          </select>
        </div>
      </div>

      {/* Task Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks match your filters"
          description="Try adjusting your filter settings or add a new task."
          action={onAddTask}
          actionLabel="Add Task"
          icon="Filter"
        />
      ) : (
        renderTasksByGroup()
      )}
    </div>
  )
}

export default TaskList