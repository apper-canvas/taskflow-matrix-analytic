import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { cn } from "@/utils/cn"
import { RECURRENCE_TYPES, RECURRENCE_END_TYPES, isValidRecurrencePattern } from "@/utils/recurrence"
import { format, addDays } from "date-fns"

const QuickAddTask = ({ onAdd, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showRecurrence, setShowRecurrence] = useState(false)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Recurrence state
  const [recurrenceType, setRecurrenceType] = useState(RECURRENCE_TYPES.DAILY)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceEndType, setRecurrenceEndType] = useState(RECURRENCE_END_TYPES.NEVER)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Please enter a task title")
      return
    }

    // Validate recurrence if enabled
    let recurrence = null
    if (showRecurrence) {
      recurrence = {
        type: recurrenceType,
        interval: recurrenceInterval,
        endType: recurrenceEndType,
        endDate: recurrenceEndType === RECURRENCE_END_TYPES.DATE ? recurrenceEndDate : null,
        endCount: recurrenceEndType === RECURRENCE_END_TYPES.COUNT ? recurrenceEndCount : null
      }
      
      if (!isValidRecurrencePattern(recurrence)) {
        toast.error("Please check your recurrence settings")
        return
      }
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
        recurrence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await onAdd(newTask)
      
      // Reset form
      setTitle("")
      setShowRecurrence(false)
      setRecurrenceType(RECURRENCE_TYPES.DAILY)
      setRecurrenceInterval(1)
      setRecurrenceEndType(RECURRENCE_END_TYPES.NEVER)
      setRecurrenceEndDate("")
      setRecurrenceEndCount(10)
      setIsOpen(false)
      
      toast.success(recurrence ? "Recurring task added successfully!" : "Task added successfully!")
    } catch (error) {
      toast.error("Failed to add task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setShowRecurrence(false)
    setRecurrenceType(RECURRENCE_TYPES.DAILY)
    setRecurrenceInterval(1)
    setRecurrenceEndType(RECURRENCE_END_TYPES.NEVER)
    setRecurrenceEndDate("")
    setRecurrenceEndCount(10)
    setIsOpen(false)
  }

  const getMinEndDate = () => {
    return format(addDays(new Date(), 1), "yyyy-MM-dd")
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
              
              {/* Recurrence Toggle */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecurrence}
                    onChange={(e) => setShowRecurrence(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={loading}
                  />
                  <ApperIcon name="Repeat" className="h-4 w-4" />
                  Make this a recurring task
                </label>
              </div>
              
              {/* Recurrence Options */}
              <AnimatePresence>
                {showRecurrence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-3"
                  >
                    {/* Recurrence Pattern */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                        Repeat:
                      </label>
                      <select
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="input-field text-sm py-1 flex-1"
                        disabled={loading}
                      >
                        <option value={RECURRENCE_TYPES.DAILY}>Daily</option>
                        <option value={RECURRENCE_TYPES.WEEKLY}>Weekly</option>
                        <option value={RECURRENCE_TYPES.MONTHLY}>Monthly</option>
                      </select>
                    </div>
                    
                    {/* Recurrence Interval */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                        Every:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                        className="input-field text-sm py-1 w-20"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recurrenceType === RECURRENCE_TYPES.DAILY && (recurrenceInterval === 1 ? "day" : "days")}
                        {recurrenceType === RECURRENCE_TYPES.WEEKLY && (recurrenceInterval === 1 ? "week" : "weeks")}
                        {recurrenceType === RECURRENCE_TYPES.MONTHLY && (recurrenceInterval === 1 ? "month" : "months")}
                      </span>
                    </div>
                    
                    {/* End Condition */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        End:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="endType"
                            value={RECURRENCE_END_TYPES.NEVER}
                            checked={recurrenceEndType === RECURRENCE_END_TYPES.NEVER}
                            onChange={(e) => setRecurrenceEndType(e.target.value)}
                            disabled={loading}
                          />
                          Never
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="endType"
                            value={RECURRENCE_END_TYPES.DATE}
                            checked={recurrenceEndType === RECURRENCE_END_TYPES.DATE}
                            onChange={(e) => setRecurrenceEndType(e.target.value)}
                            disabled={loading}
                          />
                          On date:
                          <input
                            type="date"
                            value={recurrenceEndDate}
                            min={getMinEndDate()}
                            onChange={(e) => setRecurrenceEndDate(e.target.value)}
                            className="input-field text-sm py-1 flex-1"
                            disabled={loading || recurrenceEndType !== RECURRENCE_END_TYPES.DATE}
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="endType"
                            value={RECURRENCE_END_TYPES.COUNT}
                            checked={recurrenceEndType === RECURRENCE_END_TYPES.COUNT}
                            onChange={(e) => setRecurrenceEndType(e.target.value)}
                            disabled={loading}
                          />
                          After:
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={recurrenceEndCount}
                            onChange={(e) => setRecurrenceEndCount(parseInt(e.target.value) || 1)}
                            className="input-field text-sm py-1 w-20"
                            disabled={loading || recurrenceEndType !== RECURRENCE_END_TYPES.COUNT}
                          />
                          occurrences
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!title.trim()}
                  size="sm"
                >
                  {showRecurrence ? "Add Recurring Task" : "Add Task"}
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