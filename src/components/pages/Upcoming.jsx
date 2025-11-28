import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import TaskList from "@/components/organisms/TaskList"
import QuickAddTask from "@/components/molecules/QuickAddTask"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import { taskService } from "@/services/api/taskService"
import { getUpcomingTasks } from "@/utils/date"

const Upcoming = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState(7) // 7, 14, 30 days

  const loadUpcomingTasks = async () => {
    try {
      setError("")
      setLoading(true)
      const allTasks = await taskService.getAll()
      const upcomingTasks = getUpcomingTasks(allTasks, timeRange)
      setTasks(upcomingTasks)
    } catch (err) {
      setError(err.message || "Failed to load upcoming tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUpcomingTasks()
  }, [timeRange])

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId)
      await loadUpcomingTasks() // Refresh tasks
      toast.success("Task updated successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await taskService.create(taskData)
      await loadUpcomingTasks() // Refresh tasks
    } catch (err) {
      throw err // Let QuickAddTask handle the error
    }
  }

  const handleEditTask = (task) => {
    toast.info("Edit task functionality would be implemented here")
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadUpcomingTasks} />
  }

  const urgentTasks = tasks.filter(task => task.priority === "high").length
  const totalTasks = tasks.length

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
            Upcoming Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan ahead and stay organized with your upcoming deadlines.
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <QuickAddTask onAdd={handleAddTask} />
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show tasks for:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input-field text-sm py-1"
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 2 weeks</option>
            <option value={30}>Next month</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{totalTasks} total tasks</span>
          {urgentTasks > 0 && (
            <span className="text-error-600 dark:text-error-400 font-medium">
              {urgentTasks} urgent
            </span>
          )}
        </div>
      </motion.div>

      {/* Upcoming Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error-100 dark:bg-error-900 rounded-lg">
              <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{urgentTasks}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <svg className="w-5 h-5 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Medium Priority</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tasks.filter(task => task.priority === "medium").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Low Priority</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tasks.filter(task => task.priority === "low").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleTask}
          onEdit={handleEditTask}
          onAddTask={handleAddTask}
          showGrouping={true}
          emptyMessage="No upcoming tasks"
          emptyDescription={`You have no tasks scheduled for the next ${timeRange} days. Great job staying organized!`}
        />
      </motion.div>
    </div>
  )
}

export default Upcoming