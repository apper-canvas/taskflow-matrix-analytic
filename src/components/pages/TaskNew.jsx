import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import TaskModal from "@/components/molecules/TaskModal"

const TaskNew = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  // Get any initial data passed via state
  const initialData = location.state?.initialData || {}

  const handleTaskCreated = (task) => {
    // Redirect back to tasks page or where we came from
    const returnTo = location.state?.returnTo || "/tasks"
    navigate(returnTo, { 
      state: { 
        newTask: task,
        message: "Task created successfully" 
      }
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    // Small delay for exit animation
    setTimeout(() => {
      const returnTo = location.state?.returnTo || "/tasks"
      navigate(returnTo)
    }, 150)
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
            Create New Task
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add a new task to your workflow and start tracking progress.
          </p>
        </div>
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isOpen}
        onClose={handleClose}
        onTaskCreated={handleTaskCreated}
        mode="create"
        initialData={initialData}
      />
    </div>
  )
}

export default TaskNew