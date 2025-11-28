import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { cn } from "@/utils/cn"

const QuickAddTask = ({ onAdd, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Please enter a task title")
      return
    }

    setLoading(true)
    
    try {
      const newTask = {
        title: title.trim(),
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: null,
        projectId: null,
        assigneeId: null,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await onAdd(newTask)
      setTitle("")
      setIsOpen(false)
      toast.success("Task added successfully!")
    } catch (error) {
      toast.error("Failed to add task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              icon="Plus"
              className="w-full"
            >
              Quick Add Task
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card p-4"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                disabled={loading}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!title.trim()}
                  size="sm"
                >
                  Add Task
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuickAddTask