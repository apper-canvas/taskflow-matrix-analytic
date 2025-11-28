import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const QuickAddTask = ({ className = "" }) => {
  const navigate = useNavigate()

  const handleAddTask = () => {
    navigate("/tasks/new")
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleAddTask}
          icon="Plus"
          className="w-full"
        >
          Add Task
        </Button>
      </motion.div>
    </div>
  )
}

export default QuickAddTask