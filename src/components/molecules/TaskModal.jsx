import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import TextEditor from "@/components/molecules/TextEditor"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"
import { teamService } from "@/services/api/teamService"
import { cn } from "@/utils/cn"
import { getPriorityColor } from "@/utils/priority"
import { getStatusColor, getStatusIcon } from "@/utils/status"

const TaskModal = ({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  onTaskUpdated,
  task = null,
  mode = "create" // "create" or "edit"
}) => {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Form state
const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "not-started",
    dueDate: "",
    dueTime: "",
    projectId: null,
    assigneeId: null,
    tags: [],
    estimatedTime: "",
    timeSpent: "",
    category: "",
    reminders: {
      onDueDate: false,
      oneDayBefore: false,
      oneHourBefore: false,
      custom: {
        enabled: false,
        value: 30,
        unit: "minutes"
      }
    }
  })

  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (task && mode === "edit") {
        populateFormData()
      } else {
        resetForm()
      }
    }
  }, [isOpen, task, mode])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      const [projectsData, teamsData] = await Promise.all([
        projectService.getAll(),
        teamService.getAll()
      ])
      setProjects(projectsData)
      setTeams(teamsData)
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoadingData(false)
    }
  }

  const populateFormData = () => {
    if (!task) return
    
const dueDate = task.dueDate ? new Date(task.dueDate) : null
    
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "not-started",
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : "",
      dueTime: dueDate ? dueDate.toTimeString().slice(0, 5) : "",
      projectId: task.projectId || null,
      assigneeId: task.assigneeId || null,
      tags: task.tags || [],
      estimatedTime: task.estimatedTime || "",
      timeSpent: task.timeSpent || "",
      category: task.category || "",
      reminders: task.reminders || {
        onDueDate: false,
        oneDayBefore: false,
        oneHourBefore: false,
        custom: {
          enabled: false,
          value: 30,
          unit: "minutes"
        }
      }
    })
  }

const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "not-started",
      dueDate: "",
      dueTime: "",
      projectId: null,
      assigneeId: null,
      tags: [],
      estimatedTime: "",
      timeSpent: "",
      category: "",
      reminders: {
        onDueDate: false,
        oneDayBefore: false,
        oneHourBefore: false,
        custom: {
          enabled: false,
          value: 30,
          unit: "minutes"
        }
      }
    })
    setTagInput("")
    setErrors({})
    setIsAdvanced(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (formData.dueDate && formData.dueTime) {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`)
      if (dueDateTime < new Date()) {
        newErrors.dueDate = "Due date cannot be in the past"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      let dueDate = null
      if (formData.dueDate) {
        if (formData.dueTime) {
          dueDate = new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString()
        } else {
          dueDate = new Date(`${formData.dueDate}T12:00:00`).toISOString()
        }
      }

const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate,
        projectId: formData.projectId,
        assigneeId: formData.assigneeId,
        tags: formData.tags,
        estimatedTime: parseInt(formData.estimatedTime) || 0,
        timeSpent: parseInt(formData.timeSpent) || 0,
        category: formData.category.trim(),
        completed: formData.status === "completed",
        reminders: formData.reminders
      }

      if (mode === "edit" && task) {
        const updatedTask = await taskService.update(task.Id, taskData)
        onTaskUpdated?.(updatedTask)
        toast.success("Task updated successfully")
      } else {
        const newTask = await taskService.create(taskData)
        onTaskCreated?.(newTask)
        toast.success("Task created successfully")
      }

      onClose()
    } catch (error) {
      toast.error(error.message || `Failed to ${mode} task`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const getTeamMembers = () => {
    return teams.flatMap(team => team.members || [])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {mode === "edit" ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mode === "edit" ? "Update task details" : "Add a new task to your workflow"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <ApperIcon name="Loader2" className="animate-spin h-6 w-6 text-primary-600" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter task title..."
                    className={cn(errors.title && "border-red-500")}
                    autoFocus
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center justify-between">
<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAdvanced(!isAdvanced)}
                    className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <ApperIcon name={isAdvanced ? "ChevronUp" : "ChevronDown"} size={16} />
                    {isAdvanced ? "Basic" : "Advanced"} Options
                  </button>
                </div>

                {/* Advanced Fields */}
                <AnimatePresence>
                  {isAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
className="space-y-4"
                    >
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title *
                        </label>
                        <Input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter task title..."
                          className="w-full"
                          required
                        />
                      </div>

                      {/* Project */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project
                        </label>
                        <select
                          value={formData.projectId || ""}
                          onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                          className="input-field w-full"
                        >
                          <option value="">No Project</option>
                          {projects.map(project => (
                            <option key={project.Id} value={project.Id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status, Priority, Assignee Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="input-field w-full"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="input-field w-full"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Assignee
                          </label>
                          <select
                            value={formData.assigneeId || ""}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value || null })}
                            className="input-field w-full"
                          >
                            <option value="">Unassigned</option>
                            {teams.map(member => (
                              <option key={member.Id} value={member.Id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter task description..."
                          className="input-field w-full min-h-[80px] resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Due Date and Time Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                          </label>
                          <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Time
                          </label>
                          <Input
                            type="time"
                            value={formData.dueTime}
                            onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Reminders */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Reminders
                        </label>
                        <div className="space-y-3">
                          {/* Preset Reminders */}
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.reminders.onDueDate}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  reminders: { ...formData.reminders, onDueDate: e.target.checked }
                                })}
                                className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">On due date</span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.reminders.oneDayBefore}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  reminders: { ...formData.reminders, oneDayBefore: e.target.checked }
                                })}
                                className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">1 day before</span>
                            </label>

                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.reminders.oneHourBefore}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  reminders: { ...formData.reminders, oneHourBefore: e.target.checked }
                                })}
                                className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">1 hour before</span>
                            </label>
                          </div>

                          {/* Custom Reminder */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <label className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={formData.reminders.custom.enabled}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  reminders: { 
                                    ...formData.reminders, 
                                    custom: { ...formData.reminders.custom, enabled: e.target.checked }
                                  }
                                })}
                                className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Custom reminder</span>
                            </label>

                            {formData.reminders.custom.enabled && (
                              <div className="ml-6 flex gap-2 items-center">
                                <Input
                                  type="number"
                                  value={formData.reminders.custom.value}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    reminders: {
                                      ...formData.reminders,
                                      custom: { ...formData.reminders.custom, value: parseInt(e.target.value) || 0 }
                                    }
                                  })}
                                  className="w-20"
                                  min="1"
                                />
                                <select
                                  value={formData.reminders.custom.unit}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    reminders: {
                                      ...formData.reminders,
                                      custom: { ...formData.reminders.custom, unit: e.target.value }
                                    }
                                  })}
                                  className="input-field"
                                >
                                  <option value="minutes">minutes</option>
                                  <option value="hours">hours</option>
                                  <option value="days">days</option>
                                </select>
                                <span className="text-sm text-gray-500">before due date</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estimated Time and Time Spent Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estimated Time (minutes)
                          </label>
                          <Input
                            type="number"
                            value={formData.estimatedTime}
                            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                            placeholder="e.g., 120"
                            className="w-full"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time Spent (minutes)
                          </label>
                          <Input
                            type="number"
                            value={formData.timeSpent}
                            onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                            placeholder="e.g., 60"
                            className="w-full"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <Input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., Design, Development, Bug Fix"
                          className="w-full"
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Enter tag..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleAddTag}
                            disabled={!tagInput.trim()}
                            size="sm"
                          >
                            <ApperIcon name="Plus" size={16} />
                          </Button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <ApperIcon name="X" size={12} />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!formData.title.trim()}
                  >
                    {mode === "edit" ? "Update Task" : "Create Task"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TaskModal