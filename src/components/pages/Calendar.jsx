import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"
import { cn } from "@/utils/cn"

const Calendar = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [timelineBars, setTimelineBars] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragState, setDragState] = useState(null)
  const [editingLabel, setEditingLabel] = useState(null)
  const [loading, setLoading] = useState(true)

  // Month data
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  const years = Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i)

  // Status colors
  const statusColors = {
    'To Do': { bg: 'bg-blue-500', border: 'border-blue-600' },
    'In Progress': { bg: 'bg-yellow-500', border: 'border-yellow-600' },
    'Completed': { bg: 'bg-green-500', border: 'border-green-600' },
    'On Hold': { bg: 'bg-gray-500', border: 'border-gray-600' }
  }

  // Load data
  useEffect(() => {
    loadTimelineData()
  }, [selectedYear])

  const loadTimelineData = async () => {
    setLoading(true)
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll()
      ])
      
      setProjects(projectsData)
      setTasks(tasksData)
      
      // Generate timeline bars from projects and tasks
      const bars = generateTimelineBars(projectsData, tasksData)
      setTimelineBars(bars)
      
      toast.success('Timeline data loaded successfully')
    } catch (error) {
      console.error('Failed to load timeline data:', error)
      toast.error('Failed to load timeline data')
    } finally {
      setLoading(false)
    }
  }

  const generateTimelineBars = (projectsData, tasksData) => {
    const bars = []
    
    // Add project bars
    projectsData.forEach((project, index) => {
      if (project.startDate && project.endDate) {
        const startDate = new Date(project.startDate)
        const endDate = new Date(project.endDate)
        
        if (startDate.getFullYear() === selectedYear || endDate.getFullYear() === selectedYear) {
          bars.push({
            id: `project-${project.Id}`,
            type: 'project',
            title: project.name,
            status: project.status || 'To Do',
            startDate: startDate,
            endDate: endDate,
            row: index % 7,
            entityId: project.Id
          })
        }
      }
    })
    
    // Add task bars for tasks without projects or long-running tasks
    tasksData.forEach((task, index) => {
      if (task.dueDate && !task.projectId) {
        const dueDate = new Date(task.dueDate)
        const startDate = task.createdAt ? new Date(task.createdAt) : new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        if (dueDate.getFullYear() === selectedYear) {
          bars.push({
            id: `task-${task.Id}`,
            type: 'task',
            title: task.title,
            status: task.status || 'To Do',
            startDate: startDate,
            endDate: dueDate,
            row: (projectsData.length + index) % 7,
            entityId: task.Id
          })
        }
      }
    })

    return bars.slice(0, 8) // Limit to 8 rows for better UX
  }

  // Calculate task counts per month
  const getTaskCountsPerMonth = () => {
    const counts = Array(12).fill(0)
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        if (dueDate.getFullYear() === selectedYear) {
          counts[dueDate.getMonth()]++
        }
      }
    })
    
    return counts
  }

  // Calculate bar position and width
  const calculateBarStyle = (bar) => {
    const yearStart = new Date(selectedYear, 0, 1)
    const yearEnd = new Date(selectedYear, 11, 31)
    
    const barStart = bar.startDate > yearStart ? bar.startDate : yearStart
    const barEnd = bar.endDate < yearEnd ? bar.endDate : yearEnd
    
    const startPercent = ((barStart - yearStart) / (yearEnd - yearStart)) * 100
    const endPercent = ((barEnd - yearStart) / (yearEnd - yearStart)) * 100
    const width = endPercent - startPercent
    
    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.max(1, width)}%`
    }
  }

  // Handle drag start
  const handleDragStart = (e, bar, dragType = 'move') => {
    e.preventDefault()
    setIsDragging(true)
    setDragState({
      barId: bar.id,
      startX: e.clientX,
      originalStartDate: bar.startDate,
      originalEndDate: bar.endDate,
      dragType: dragType // 'move', 'resize-left', 'resize-right'
    })
  }

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !dragState) return

      const deltaX = e.clientX - dragState.startX
      const containerWidth = 800 // Approximate timeline width
      const pixelsPerDay = containerWidth / 365
      const daysDelta = Math.round(deltaX / pixelsPerDay)

      setTimelineBars(bars => bars.map(bar => {
        if (bar.id !== dragState.barId) return bar

        let newStartDate = new Date(dragState.originalStartDate)
        let newEndDate = new Date(dragState.originalEndDate)

        if (dragState.dragType === 'move') {
          newStartDate.setDate(newStartDate.getDate() + daysDelta)
          newEndDate.setDate(newEndDate.getDate() + daysDelta)
        } else if (dragState.dragType === 'resize-left') {
          newStartDate.setDate(newStartDate.getDate() + daysDelta)
          if (newStartDate >= newEndDate) {
            newStartDate = new Date(newEndDate.getTime() - 24 * 60 * 60 * 1000)
          }
        } else if (dragState.dragType === 'resize-right') {
          newEndDate.setDate(newEndDate.getDate() + daysDelta)
          if (newEndDate <= newStartDate) {
            newEndDate = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }

        return {
          ...bar,
          startDate: newStartDate,
          endDate: newEndDate
        }
      }))
    }

    const handleMouseUp = async () => {
      if (isDragging && dragState) {
        // Save changes
        const updatedBar = timelineBars.find(bar => bar.id === dragState.barId)
        if (updatedBar) {
          await saveBarChanges(updatedBar)
        }
      }
      setIsDragging(false)
      setDragState(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragState, timelineBars])

  // Save bar changes
  const saveBarChanges = async (bar) => {
    try {
      if (bar.type === 'project') {
        await projectService.update(bar.entityId, {
          startDate: bar.startDate.toISOString(),
          endDate: bar.endDate.toISOString()
        })
      } else {
        await taskService.update(bar.entityId, {
          dueDate: bar.endDate.toISOString()
        })
      }
      toast.success('Timeline updated successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      toast.error('Failed to save timeline changes')
      // Reload data on error
      loadTimelineData()
    }
  }

  // Handle label edit
  const handleLabelEdit = async (bar, newTitle) => {
    try {
      if (bar.type === 'project') {
        await projectService.update(bar.entityId, { name: newTitle })
      } else {
        await taskService.update(bar.entityId, { title: newTitle })
      }
      
      setTimelineBars(bars => bars.map(b => 
        b.id === bar.id ? { ...b, title: newTitle } : b
      ))
      
      toast.success('Title updated successfully')
    } catch (error) {
      console.error('Failed to update title:', error)
      toast.error('Failed to update title')
    }
    setEditingLabel(null)
  }

  const taskCounts = getTaskCountsPerMonth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 text-primary-600 mx-auto">
            <ApperIcon name="Loader" className="h-8 w-8" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading timeline...</p>
        </div>
      </div>
    )
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
            Project Timeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage project timelines with interactive drag and resize controls.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-auto min-w-[100px]"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Timeline Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden"
      >
        {/* Month Header */}
        <div className="grid grid-cols-12 gap-1 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          {months.map((month, index) => (
            <div key={month} className="text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {month}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {taskCounts[index]} tasks
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Grid */}
        <div className="relative overflow-x-auto">
          <div className="min-w-[800px] p-4">
            {/* Timeline Rows */}
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div key={rowIndex} className="relative h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  {/* Month grid lines */}
                  <div className="absolute inset-0 grid grid-cols-12">
                    {months.map((_, monthIndex) => (
                      <div key={monthIndex} className="border-r border-gray-200 dark:border-gray-600 last:border-r-0"></div>
                    ))}
                  </div>
                  
                  {/* Timeline bars for this row */}
                  {timelineBars
                    .filter(bar => bar.row === rowIndex)
                    .map(bar => {
                      const barStyle = calculateBarStyle(bar)
                      const colors = statusColors[bar.status] || statusColors['To Do']
                      
                      return (
                        <div
                          key={bar.id}
                          className={cn(
                            "absolute top-1 bottom-1 rounded-md shadow-sm cursor-move select-none",
                            colors.bg,
                            colors.border,
                            "border-2",
                            isDragging && dragState?.barId === bar.id ? "opacity-70 z-10" : "hover:shadow-md"
                          )}
                          style={barStyle}
                          onMouseDown={(e) => handleDragStart(e, bar, 'move')}
                        >
                          {/* Resize handle - left */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20 rounded-l-md"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, bar, 'resize-left')
                            }}
                          />
                          
                          {/* Label */}
                          <div className="flex items-center justify-center h-full px-2">
                            {editingLabel === bar.id ? (
                              <input
                                type="text"
                                defaultValue={bar.title}
                                className="w-full bg-transparent text-white text-xs font-medium outline-none text-center"
                                autoFocus
                                onBlur={(e) => handleLabelEdit(bar, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleLabelEdit(bar, e.target.value)
                                  } else if (e.key === 'Escape') {
                                    setEditingLabel(null)
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span
                                className="text-white text-xs font-medium truncate cursor-text"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingLabel(bar.id)
                                }}
                              >
                                {bar.title}
                              </span>
                            )}
                          </div>
                          
                          {/* Resize handle - right */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20 rounded-r-md"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, bar, 'resize-right')
                            }}
                          />
                        </div>
                      )
                    })
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Timeline Controls & Status Legend
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interactions
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Drag bars to move timeline dates</li>
              <li>• Drag edges to resize duration</li>
              <li>• Click labels to edit project names</li>
              <li>• Use year dropdown to switch timeline view</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Colors
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusColors).map(([status, colors]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded", colors.bg)}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Calendar