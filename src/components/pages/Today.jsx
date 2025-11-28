import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import TaskList from "@/components/organisms/TaskList"
import QuickAddTask from "@/components/molecules/QuickAddTask"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import { taskService } from "@/services/api/taskService"
import { getTodayTasks } from "@/utils/date"

const Today = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadTodayTasks = async () => {
    try {
      setError("")
      setLoading(true)
      const allTasks = await taskService.getAll()
      const todayTasks = getTodayTasks(allTasks)
      setTasks(todayTasks)
    } catch (err) {
      setError(err.message || "Failed to load today's tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodayTasks()
  }, [])

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId)
      await loadTodayTasks() // Refresh tasks
      toast.success("Task updated successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      // Set due date to today for tasks added from Today page
      const taskWithTodayDate = {
        ...taskData,
        dueDate: new Date().toISOString()
      }
      await taskService.create(taskWithTodayDate)
      await loadTodayTasks() // Refresh tasks
    } catch (err) {
      throw err // Let QuickAddTask handle the error
    }
  }

  const handleEditTask = (task) => {
    toast.info("Edit task functionality would be implemented here")
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadTodayTasks} />
  }

  const completedToday = tasks.filter(task => task.completed).length
  const totalToday = tasks.length
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

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
            Today's Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Focus on what needs to be done today.
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <QuickAddTask onAdd={handleAddTask} />
        </div>
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalToday}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
              <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedToday}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</p>
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
          showGrouping={false}
          emptyMessage="No tasks for today"
          emptyDescription="You're all caught up! Add a task or enjoy your free time."
        />
      </motion.div>
    </div>
  )
}

export default Today