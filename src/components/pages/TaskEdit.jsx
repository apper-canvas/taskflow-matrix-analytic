import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import TaskModal from "@/components/molecules/TaskModal"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import { taskService } from "@/services/api/taskService"

const TaskEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    loadTask()
  }, [id])

  const loadTask = async () => {
    try {
      setLoading(true)
      setError("")
      const taskData = await taskService.getById(parseInt(id))
      setTask(taskData)
    } catch (err) {
      setError(err.message || "Failed to load task")
      toast.error("Failed to load task")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdated = (updatedTask) => {
    navigate("/tasks", {
      state: {
        updatedTask,
        message: "Task updated successfully"
      }
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      navigate("/tasks")
    }, 150)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Task
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Loading task details...
            </p>
          </div>
        </div>
        <Loading className="mt-8" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Edit Task
            </h1>
          </div>
        </div>
        <ErrorView
          error={error || "Task not found"}
          onRetry={() => navigate("/tasks")}
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Edit Task
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
Update "{task.title || task.name}" details and settings.
          </p>
        </div>
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isOpen}
        onClose={handleClose}
        onTaskUpdated={handleTaskUpdated}
        task={task}
        mode="edit"
      />
    </div>
  )
}

export default TaskEdit