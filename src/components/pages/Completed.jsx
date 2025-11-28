import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { taskService } from "@/services/api/taskService";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import TaskList from "@/components/organisms/TaskList";

const Completed = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const loadCompletedTasks = async () => {
    try {
      setError("")
      setLoading(true)
      const allTasks = await taskService.getAll()
      const completedTasks = allTasks.filter(task => task.completed)
      setTasks(completedTasks)
    } catch (err) {
      setError(err.message || "Failed to load completed tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompletedTasks()
  }, [])

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId)
      await loadCompletedTasks() // Refresh tasks
      toast.success("Task restored successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

const handleEditTask = (task) => {
    navigate(`/tasks/edit/${task.Id}`)
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadCompletedTasks} />
  }

  const thisWeekCompleted = tasks.filter(task => {
    const completedDate = new Date(task.updatedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return completedDate >= weekAgo
  }).length

  const thisMonthCompleted = tasks.filter(task => {
    const completedDate = new Date(task.updatedAt)
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    return completedDate >= monthAgo
  }).length

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
            Completed Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review your accomplishments and restore tasks if needed.
          </p>
        </div>
      </motion.div>

      {/* Completion Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
              <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{thisWeekCompleted}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
              <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{thisMonthCompleted}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Completed Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleTask}
          onEdit={handleEditTask}
          showGrouping={false}
          emptyMessage="No completed tasks yet"
          emptyDescription="Completed tasks will appear here. Start working on your tasks to build up your accomplishments!"
        />
      </motion.div>

      {/* Encouragement Message */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 dark:bg-success-900 rounded-full">
              <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Great job on your productivity! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You've completed {tasks.length} tasks. Keep up the excellent work and stay organized!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Completed