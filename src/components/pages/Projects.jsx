import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import { projectService } from "@/services/api/projectService"

const ProjectCard = ({ project, onClick }) => {
  const progressPercentage = project.taskCount > 0 
    ? (project.completedTaskCount / project.taskCount) * 100 
    : 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={() => onClick(project)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0 ml-3"
          style={{ backgroundColor: project.color }}
        />
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Task Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <ApperIcon name="CheckSquare" className="h-4 w-4" />
            {project.completedTaskCount} / {project.taskCount} tasks
          </div>
          
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <ApperIcon name="Calendar" className="h-4 w-4" />
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadProjects = async () => {
    try {
      setError("")
      setLoading(true)
      const data = await projectService.getAll()
      setProjects(data)
    } catch (err) {
      setError(err.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleProjectClick = (project) => {
    toast.info(`Project "${project.name}" details would be shown here`)
  }

  const handleAddProject = () => {
    toast.info("Add new project functionality would be implemented here")
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadProjects} />
  }

  const activeProjects = projects.filter(p => p.taskCount > p.completedTaskCount)
  const completedProjects = projects.filter(p => p.taskCount > 0 && p.completedTaskCount === p.taskCount)
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0)
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTaskCount, 0)
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track progress across all your projects.
          </p>
        </div>
        
        <Button
          onClick={handleAddProject}
          icon="Plus"
        >
          New Project
        </Button>
      </motion.div>

      {/* Project Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <ApperIcon name="Folder" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
              <ApperIcon name="Clock" className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
              <ApperIcon name="CheckCircle2" className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
              <ApperIcon name="Target" className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {projects.length === 0 ? (
          <Empty
            title="No projects found"
            description="Create your first project to start organizing your tasks and tracking progress."
            action={handleAddProject}
            actionLabel="Create Project"
            icon="Folder"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <ProjectCard
                  project={project}
                  onClick={handleProjectClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Project Summary */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Project Summary
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-success-600 dark:text-success-400">{completedTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
            </div>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">{totalTasks - completedTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Projects