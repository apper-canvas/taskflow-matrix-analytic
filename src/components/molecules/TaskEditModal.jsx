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
    status: "pending",
    dueDate: "",
    dueTime: "",
    projectId: null,
    assigneeId: null
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
      status: task.status || "pending", 
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : "",
      dueTime: dueDate ? dueDate.toTimeString().slice(0, 5) : "",
      projectId: task.projectId || null,
      assigneeId: task.assigneeId || null
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
                      variant={task.priority === 'high' ? 'destructive' : 'ghost'}
                      onClick={() => handleQuickPriorityChange('high')}
                      disabled={loading}
                    >
                      <ApperIcon name="AlertTriangle" size={14} className="mr-1" />
                      High
                    </Button>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    {editingField === 'title' ? (
                      <div className="flex gap-2">
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleFieldUpdate('title', formData.title)
                            }
                          }}
                          disabled={loading}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleFieldUpdate('title', formData.title)}
                          disabled={loading}
                        >
                          <ApperIcon name="Check" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingField(null)
                            setFormData(prev => ({ ...prev, title: task.title }))
                          }}
                        >
                          <ApperIcon name="X" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setEditingField('title')}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-gray-900 dark:text-gray-100">{task.title}</span>
                        <ApperIcon name="Edit2" size={16} className="float-right text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Status and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      {editingField === 'status' ? (
                        <div className="flex gap-2">
                          <select
                            value={formData.status}
                            onChange={(e) => handleFieldUpdate('status', e.target.value)}
                            className="input-field flex-1"
                            disabled={loading}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingField(null)}
                          >
                            <ApperIcon name="X" size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingField('status')}
                          className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                          <Badge variant={getStatusColor(task.status)}>
                            <ApperIcon name={getStatusIcon(task.status)} size={14} className="mr-1" />
                            {task.status}
                          </Badge>
                          <ApperIcon name="Edit2" size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      {editingField === 'priority' ? (
                        <div className="flex gap-2">
                          <select
                            value={formData.priority}
                            onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                            className="input-field flex-1"
                            disabled={loading}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingField(null)}
                          >
                            <ApperIcon name="X" size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingField('priority')}
                          className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <ApperIcon name="Edit2" size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project and Assignee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project
                      </label>
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <span className="text-gray-900 dark:text-gray-100">{getProjectName(task.projectId)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignee
                      </label>
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <span className="text-gray-900 dark:text-gray-100">{getAssigneeName(task.assigneeId)}</span>
                      </div>
                    </div>
                  </div>
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