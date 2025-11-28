import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const dashboardService = {
  async getDashboardStats() {
    await delay(350)
    
    try {
      const [tasks, projects] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ])

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
      
      // Calculate stats
      const todayTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false
        const dueDate = new Date(task.dueDate)
        const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        return dueStart.getTime() === todayStart.getTime()
      })

      const overdueTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false
        const dueDate = new Date(task.dueDate)
        return dueDate < todayStart
      })

      const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= now && dueDate <= sevenDaysFromNow
      })

      const activeProjects = projects.filter(project => 
        project.taskCount > project.completedTaskCount
      )

      const totalTasks = tasks.length
      const completedTasks = tasks.filter(task => task.completed).length
      const completionPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0

      return {
        todayTaskCount: todayTasks.length,
        overdueTaskCount: overdueTasks.length,
        upcomingTaskCount: upcomingTasks.length,
        activeProjectCount: activeProjects.length,
        completionPercentage,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      }
    } catch (error) {
      throw new Error("Failed to fetch dashboard statistics")
    }
  },

  async getRecentTasks(limit = 5) {
    await delay(200)
    
    try {
      const tasks = await taskService.getAll()
      return tasks
        .filter(task => !task.completed)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit)
    } catch (error) {
      throw new Error("Failed to fetch recent tasks")
    }
  },

  async getTaskAnalytics() {
    await delay(300)
    
    try {
      const tasks = await taskService.getAll()
      
      const priorityCounts = {
        high: tasks.filter(t => t.priority === "high" && !t.completed).length,
        medium: tasks.filter(t => t.priority === "medium" && !t.completed).length,
        low: tasks.filter(t => t.priority === "low" && !t.completed).length
      }

      const statusCounts = {
        pending: tasks.filter(t => t.status === "pending").length,
        "in-progress": tasks.filter(t => t.status === "in-progress").length,
        completed: tasks.filter(t => t.completed).length
      }

      return {
        priorityCounts,
        statusCounts
      }
    } catch (error) {
      throw new Error("Failed to fetch task analytics")
    }
  }
}