import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"
import { teamService } from "@/services/api/teamService"
import { cn } from "@/utils/cn"
import { getPriorityColor } from "@/utils/priority"
import { getStatusColor, getStatusIcon } from "@/utils/status"

const TaskEditModal = ({ 
  isOpen, 
  onClose, 
  task,
  onTaskUpdated
}) => {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [editingField, setEditingField] = useState(null)
  
const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "not-started",
    dueDate: "",
    dueTime: "",
    projectId: null,
    assigneeId: null,
    estimatedTime: "",
    timeSpent: "",
    category: ""
  })

  useEffect(() => {
    if (isOpen && task) {
      loadInitialData()
      populateFormData()
    }
  }, [isOpen, task])

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
      estimatedTime: task.estimatedTime || "",
      timeSpent: task.timeSpent || "",
      category: task.category || ""
    })
  }

  const handleFieldUpdate = async (field, value) => {
    try {
      setLoading(true)
      
      let updateData = { [field]: value }
      
      // Handle special cases
if (field === 'dueDate' || field === 'dueTime') {
        const currentDueDate = formData.dueDate
        const currentDueTime = formData.dueTime
        
        const newDueDate = field === 'dueDate' ? value : currentDueDate
        const newDueTime = field === 'dueTime' ? value : currentDueTime
        
        if (newDueDate) {
          const dueDateTime = newDueTime ? 
            new Date(`${newDueDate}T${newDueTime}`).toISOString() :
            new Date(`${newDueDate}T12:00:00`).toISOString()
          updateData = { dueDate: dueDateTime }
        } else {
          updateData = { dueDate: null }
        }
      }

      if (field === 'estimatedTime' || field === 'timeSpent') {
        updateData = { [field]: parseInt(value) || 0 }
      }

      if (field === 'status' && value === 'completed') {
        updateData.completed = true
      } else if (field === 'status' && value !== 'completed') {
        updateData.completed = false
      }

      const updatedTask = await taskService.update(task.Id, updateData)
      onTaskUpdated?.(updatedTask)
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
      
      setEditingField(null)
      toast.success("Task updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStatusChange = async (newStatus) => {
    await handleFieldUpdate('status', newStatus)
  }

  const handleQuickPriorityChange = async (newPriority) => {
    await handleFieldUpdate('priority', newPriority)
  }

  const getTeamMembers = () => {
    return teams.flatMap(team => team.members || [])
  }

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId)
    return project?.name || "No Project"
  }

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return "Unassigned"
    const member = getTeamMembers().find(m => m.Id === assigneeId)
    return member?.name || "Unknown"
  }

  if (!isOpen || !task) return null

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
              <div className="flex items-center gap-3">
                <ApperIcon name="Edit3" className="h-6 w-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Quick Edit Task
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click any field to edit inline
                  </p>
                </div>
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
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto space-y-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <ApperIcon name="Loader2" className="animate-spin h-6 w-6 text-primary-600" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Quick Actions:</span>
                  
                  {/* Status Quick Buttons */}
                  <Button
                    size="sm"
                    variant={task.status === 'in-progress' ? 'default' : 'ghost'}
                    onClick={() => handleQuickStatusChange('in-progress')}
                    disabled={loading}
                  >
                    <ApperIcon name="Play" size={14} className="mr-1" />
                    Start
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={task.status === 'completed' ? 'default' : 'ghost'}
                    onClick={() => handleQuickStatusChange('completed')}
                    disabled={loading}
                  >
                    <ApperIcon name="Check" size={14} className="mr-1" />
                    Complete
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={task.status === 'on-hold' ? 'default' : 'ghost'}
                    onClick={() => handleQuickStatusChange('on-hold')}
                    disabled={loading}
                  >
                    <ApperIcon name="Pause" size={14} className="mr-1" />
                    Hold
                  </Button>

{/* Priority Quick Buttons */}
                  <div className="border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('priority', 'low')}
                      className={cn(
                        "mr-1",
                        formData.priority === 'low' && "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      Low
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('priority', 'medium')}
                      className={cn(
                        "mr-1",
                        formData.priority === 'medium' && "bg-warning-100 dark:bg-warning-900"
                      )}
                    >
                      Medium
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('priority', 'high')}
                      className={cn(
                        "mr-1",
                        formData.priority === 'high' && "bg-error-100 dark:bg-error-900"
                      )}
                    >
                      High
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('priority', 'urgent')}
                      className={cn(
                        formData.priority === 'urgent' && "bg-red-100 dark:bg-red-900"
                      )}
                    >
                      Urgent
                    </Button>
                  </div>

                  {/* Status Quick Buttons */}
                  <div className="border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('status', 'not-started')}
                      className={cn(
                        "mr-1",
                        formData.status === 'not-started' && "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      Not Started
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('status', 'in-progress')}
                      className={cn(
                        "mr-1",
                        formData.status === 'in-progress' && "bg-blue-100 dark:bg-blue-900"
                      )}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('status', 'on-hold')}
                      className={cn(
                        "mr-1",
                        formData.status === 'on-hold' && "bg-warning-100 dark:bg-warning-900"
                      )}
                    >
                      On Hold
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFieldUpdate('status', 'completed')}
                      className={cn(
                        formData.status === 'completed' && "bg-success-100 dark:bg-success-900"
                      )}
                    >
                      Completed
                    </Button>
                  </div>
                </div>

                {/* Time Tracking Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Tracking</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Estimated Time (minutes)
                      </label>
                      <Input
                        type="number"
                        value={formData.estimatedTime}
                        onChange={(e) => {
                          setFormData({ ...formData, estimatedTime: e.target.value })
                          handleFieldUpdate('estimatedTime', e.target.value)
                        }}
                        className="text-sm py-1"
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Time Spent (minutes)
                      </label>
                      <Input
                        type="number"
                        value={formData.timeSpent}
                        onChange={(e) => {
                          setFormData({ ...formData, timeSpent: e.target.value })
                          handleFieldUpdate('timeSpent', e.target.value)
                        }}
                        className="text-sm py-1"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h4>
                  
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value })
                      handleFieldUpdate('category', e.target.value)
                    }}
                    placeholder="e.g., Design, Development, Bug Fix"
                    className="text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TaskEditModal