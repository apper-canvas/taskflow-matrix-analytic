import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import StatCard from "@/components/molecules/StatCard"
import TaskCard from "@/components/molecules/TaskCard"
import QuickAddTask from "@/components/molecules/QuickAddTask"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import { dashboardService } from "@/services/api/dashboardService"
import { taskService } from "@/services/api/taskService"
import { toast } from "react-toastify"

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
    try {
      setError("")
      setLoading(true)

      const [dashboardStats, recent] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentTasks(5)
      ])

      setStats(dashboardStats)
      setRecentTasks(recent)
    } catch (err) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId)
      await loadDashboardData() // Refresh data
      toast.success("Task updated successfully!")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      await taskService.create(taskData)
      await loadDashboardData() // Refresh data
    } catch (err) {
      throw err // Let QuickAddTask handle the error
    }
  }

const handleEditTask = (task) => {
    navigate(`/tasks/edit/${task.Id}`)
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorView error={error} onRetry={loadDashboardData} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <QuickAddTask onAdd={handleAddTask} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Today's Tasks"
            value={stats?.todayTaskCount || 0}
            icon="Calendar"
            color="primary"
            onClick={() => navigate("/today")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Overdue"
            value={stats?.overdueTaskCount || 0}
            icon="AlertTriangle"
            color="error"
            onClick={() => navigate("/tasks")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Upcoming"
            value={stats?.upcomingTaskCount || 0}
            icon="Clock"
            color="warning"
            onClick={() => navigate("/upcoming")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Active Projects"
            value={stats?.activeProjectCount || 0}
            icon="Folder"
            color="secondary"
            onClick={() => navigate("/projects")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatCard
            title="Completed"
            value={stats?.completedTasks || 0}
            icon="CheckCircle2"
            color="success"
            onClick={() => navigate("/completed")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StatCard
            title="Completion Rate"
            value={`${stats?.completionPercentage || 0}%`}
            icon="Target"
            color={stats?.completionPercentage >= 80 ? "success" : stats?.completionPercentage >= 60 ? "warning" : "error"}
            trend={stats?.completionPercentage >= 70 ? "On track" : "Needs attention"}
            trendDirection={stats?.completionPercentage >= 70 ? "up" : "down"}
          />
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Tasks
            </h2>
            <button
              onClick={() => navigate("/tasks")}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1"
            >
              View all
              <ApperIcon name="ArrowRight" className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <Empty
                title="No recent tasks"
                description="Your recent tasks will appear here."
                icon="Inbox"
              />
            ) : (
              recentTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={handleToggleTask}
                    onEdit={handleEditTask}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="card p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/tasks")}>
          <ApperIcon name="CheckSquare" className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            Manage Tasks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and organize all your tasks
          </p>
        </div>

        <div className="card p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/projects")}>
          <ApperIcon name="Folder" className="h-8 w-8 text-secondary-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            View Projects
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track project progress and status
          </p>
        </div>

        <div className="card p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/teams")}>
          <ApperIcon name="Users" className="h-8 w-8 text-success-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            Team Collaboration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Coordinate with team members
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard