import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import TaskList from "@/components/organisms/TaskList"
import QuickAddTask from "@/components/molecules/QuickAddTask"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import { taskService } from "@/services/api/taskService"

const MyTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadTasks = async () => {
    try {
      setError("")
      setLoading(true)
      const data = await taskService.getAll()
      setTasks(data)
    } catch (err) {
      setError(err.message || "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId)
      await loadTasks() // Refresh tasks
      toast.success("Task updated successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await taskService.create(taskData)
      await loadTasks() // Refresh tasks
    } catch (err) {
      throw err // Let QuickAddTask handle the error
    }
  }

  const handleEditTask = (task) => {
    // In a real app, this would open an edit modal or navigate to edit page
    toast.info("Edit task functionality would be implemented here")
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadTasks} />
  }

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
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize all your tasks in one place.
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <QuickAddTask onAdd={handleAddTask} />
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
          emptyMessage="No tasks found"
          emptyDescription="Create your first task to get started with managing your work."
        />
      </motion.div>
    </div>
  )
}

export default MyTasks