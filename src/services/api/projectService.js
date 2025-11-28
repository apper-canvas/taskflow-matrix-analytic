import projectsData from "@/services/mockData/projects.json"
import tasksData from "@/services/mockData/tasks.json"

let projects = [...projectsData]
const tasks = [...tasksData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to calculate project statistics
const enrichProject = (project) => {
  const projectTasks = tasks.filter(t => t.projectId === project.Id)
  const completedTasks = projectTasks.filter(t => t.completed)
  
  return {
    ...project,
    taskCount: projectTasks.length,
    completedTaskCount: completedTasks.length,
    completionPercentage: projectTasks.length > 0 
      ? Math.round((completedTasks.length / projectTasks.length) * 100) 
      : 0
  }
}

export const projectService = {
  async getAll() {
    await delay(300)
    return projects.map(enrichProject)
  },

  async getById(id) {
    await delay(200)
    const project = projects.find(p => p.Id === parseInt(id))
    if (!project) {
      throw new Error("Project not found")
    }
    return enrichProject(project)
  },

  async create(projectData) {
    await delay(400)
    
    const maxId = Math.max(...projects.map(p => p.Id), 0)
    const newProject = {
      ...projectData,
      Id: maxId + 1,
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: new Date().toISOString()
    }
    
    projects.push(newProject)
    return enrichProject(newProject)
  },

  async update(id, updates) {
    await delay(350)
    
    const projectIndex = projects.findIndex(p => p.Id === parseInt(id))
    if (projectIndex === -1) {
      throw new Error("Project not found")
    }
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return enrichProject(projects[projectIndex])
  },

  async delete(id) {
    await delay(250)
    
    const projectIndex = projects.findIndex(p => p.Id === parseInt(id))
    if (projectIndex === -1) {
      throw new Error("Project not found")
    }
    
    const deletedProject = projects.splice(projectIndex, 1)[0]
    return enrichProject(deletedProject)
  },

  async getActiveProjects() {
    await delay(250)
    return projects
      .map(enrichProject)
      .filter(project => project.taskCount > project.completedTaskCount)
  }
}