import tasksData from "@/services/mockData/tasks.json"
import projectsData from "@/services/mockData/projects.json"
import teamsData from "@/services/mockData/teams.json"

let tasks = [...tasksData]
const projects = [...projectsData]
const teams = [...teamsData]

// Helper function to get project name
const getProjectName = (projectId) => {
  if (!projectId) return null
  const project = projects.find(p => p.Id === projectId)
  return project ? project.name : null
}

// Helper function to get assignee name
const getAssigneeName = (assigneeId) => {
  if (!assigneeId) return null
  for (const team of teams) {
    const member = team.members.find(m => m.Id === assigneeId)
    if (member) return member.name
  }
  return null
}

// Helper function to enrich task data
const enrichTask = (task) => ({
  ...task,
  projectName: getProjectName(task.projectId),
  assigneeName: getAssigneeName(task.assigneeId)
})

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const taskService = {
  async getAll() {
    await delay(300)
    return tasks.map(enrichTask)
  },

  async getById(id) {
    await delay(200)
    const task = tasks.find(t => t.Id === parseInt(id))
    if (!task) {
      throw new Error("Task not found")
    }
    return enrichTask(task)
  },

  async create(taskData) {
    await delay(400)
    
    // Generate new ID
    const maxId = Math.max(...tasks.map(t => t.Id), 0)
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tasks.push(newTask)
    return enrichTask(newTask)
  },

  async update(id, updates) {
    await delay(350)
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id))
    if (taskIndex === -1) {
      throw new Error("Task not found")
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return enrichTask(tasks[taskIndex])
  },

  async delete(id) {
    await delay(250)
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id))
    if (taskIndex === -1) {
      throw new Error("Task not found")
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0]
    return enrichTask(deletedTask)
  },

  async toggleComplete(id) {
    await delay(200)
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id))
    if (taskIndex === -1) {
      throw new Error("Task not found")
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      completed: !tasks[taskIndex].completed,
      updatedAt: new Date().toISOString()
    }
    
    return enrichTask(tasks[taskIndex])
  },

  async getTodayTasks() {
    await delay(250)
    const today = new Date().toDateString()
    return tasks
      .filter(task => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate).toDateString()
        return taskDate === today
      })
      .map(enrichTask)
  },

  async getOverdueTasks() {
    await delay(250)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today
    
    return tasks
      .filter(task => {
        if (!task.dueDate || task.completed) return false
        const taskDate = new Date(task.dueDate)
        return taskDate < now
      })
      .map(enrichTask)
  },

  async getUpcomingTasks(days = 7) {
    await delay(250)
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)
    
    return tasks
      .filter(task => {
        if (!task.dueDate || task.completed) return false
        const taskDate = new Date(task.dueDate)
        return taskDate >= now && taskDate <= futureDate
      })
      .map(enrichTask)
  },

  async getCompletedTasks() {
    await delay(250)
    return tasks
      .filter(task => task.completed)
      .map(enrichTask)
  },

  async getTasksByProject(projectId) {
    await delay(250)
    return tasks
      .filter(task => task.projectId === parseInt(projectId))
      .map(enrichTask)
  }
}