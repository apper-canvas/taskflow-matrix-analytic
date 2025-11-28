import tasksData from "@/services/mockData/tasks.json";
import projectsData from "@/services/mockData/projects.json";
import teamsData from "@/services/mockData/teams.json";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "@/utils/date";

let tasks = [...tasksData];
const projects = [...projectsData];
const teams = [...teamsData];

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
const enrichTask = (task) => {
  const enriched = {
    ...task,
    projectName: getProjectName(task.projectId),
    assigneeName: getAssigneeName(task.assigneeId),
    dependsOn: task.dependsOn || [],
    blockedBy: task.blockedBy || []
  }
  
  // Enrich dependency information
  enriched.dependencies = enriched.dependsOn.map(depId => {
    const depTask = tasks.find(t => t.Id === depId)
    return depTask ? {
      Id: depTask.Id,
      title: depTask.title,
      completed: depTask.completed,
      status: depTask.status
    } : null
  }).filter(Boolean)
  
  // Count blocking relationships
  enriched.blockingCount = tasks.filter(t => 
    (t.dependsOn || []).includes(task.Id)
  ).length
  
  return enriched
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const taskService = {
  async getAll() {
    await delay(300);
    return tasks.map(enrichTask);
  },
async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error("Task not found");
    }
    return enrichTask(task);
  },
async create(taskData) {
    await delay(400);
    
    // Generate new ID
    const maxId = Math.max(...tasks.map(t => t.Id), 0);
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      dependsOn: taskData.dependsOn || [],
      blockedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update blocking relationships
    if (newTask.dependsOn.length > 0) {
      newTask.dependsOn.forEach(depId => {
        const depTask = tasks.find(t => t.Id === depId);
        if (depTask) {
          if (!depTask.blockedBy) depTask.blockedBy = [];
          if (!depTask.blockedBy.includes(newTask.Id)) {
            depTask.blockedBy.push(newTask.Id);
          }
        }
      });
    }
    
    tasks.push(newTask);
    return enrichTask(newTask);
  },
async update(id, updates) {
    await delay(350);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const oldTask = { ...tasks[taskIndex] };
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Handle dependency changes
    if (updates.dependsOn !== undefined) {
      const newDeps = updates.dependsOn || [];
      const oldDeps = oldTask.dependsOn || [];
      
      // Remove old blocking relationships
      oldDeps.forEach(depId => {
        if (!newDeps.includes(depId)) {
          const depTask = tasks.find(t => t.Id === depId);
          if (depTask && depTask.blockedBy) {
            depTask.blockedBy = depTask.blockedBy.filter(blockId => blockId !== parseInt(id));
          }
        }
      });
      
      // Add new blocking relationships
      newDeps.forEach(depId => {
        if (!oldDeps.includes(depId)) {
          const depTask = tasks.find(t => t.Id === depId);
          if (depTask) {
            if (!depTask.blockedBy) depTask.blockedBy = [];
            if (!depTask.blockedBy.includes(parseInt(id))) {
              depTask.blockedBy.push(parseInt(id));
            }
          }
        }
      });
    }
    
    return enrichTask(tasks[taskIndex]);
  },
async delete(id) {
    await delay(250);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    return enrichTask(deletedTask);
  },
async toggleComplete(id) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      completed: !tasks[taskIndex].completed,
      status: !tasks[taskIndex].completed ? 'completed' : 'pending',
      updatedAt: new Date().toISOString()
    };
    
    return enrichTask(tasks[taskIndex]);
  },

  async linkTasks(taskId, dependencyId) {
    await delay(200)
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId))
    const depIndex = tasks.findIndex(t => t.Id === parseInt(dependencyId))
    
    if (taskIndex === -1 || depIndex === -1) {
      throw new Error("Task not found")
    }
    
    // Validate no circular dependency
    if (await this.wouldCreateCircularDependency(taskId, dependencyId)) {
      throw new Error("Cannot create circular dependency")
    }
    
    // Add dependency
    if (!tasks[taskIndex].dependsOn) tasks[taskIndex].dependsOn = []
    if (!tasks[taskIndex].dependsOn.includes(parseInt(dependencyId))) {
      tasks[taskIndex].dependsOn.push(parseInt(dependencyId))
    }
    
    // Add blocking relationship
    if (!tasks[depIndex].blockedBy) tasks[depIndex].blockedBy = []
    if (!tasks[depIndex].blockedBy.includes(parseInt(taskId))) {
      tasks[depIndex].blockedBy.push(parseInt(taskId))
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString()
    tasks[depIndex].updatedAt = new Date().toISOString()
    
    return {
      task: enrichTask(tasks[taskIndex]),
      dependency: enrichTask(tasks[depIndex])
    }
  },

  async unlinkTasks(taskId, dependencyId) {
    await delay(200)
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId))
    const depIndex = tasks.findIndex(t => t.Id === parseInt(dependencyId))
    
    if (taskIndex === -1 || depIndex === -1) {
      throw new Error("Task not found")
    }
    
    // Remove dependency
    if (tasks[taskIndex].dependsOn) {
      tasks[taskIndex].dependsOn = tasks[taskIndex].dependsOn.filter(
        id => id !== parseInt(dependencyId)
      )
    }
    
    // Remove blocking relationship
    if (tasks[depIndex].blockedBy) {
      tasks[depIndex].blockedBy = tasks[depIndex].blockedBy.filter(
        id => id !== parseInt(taskId)
      )
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString()
    tasks[depIndex].updatedAt = new Date().toISOString()
    
    return {
      task: enrichTask(tasks[taskIndex]),
      dependency: enrichTask(tasks[depIndex])
    }
  },

  async getDependencies(taskId) {
    await delay(100)
    
    const task = tasks.find(t => t.Id === parseInt(taskId))
    if (!task) {
      throw new Error("Task not found")
    }
    
    const dependencies = (task.dependsOn || []).map(depId => {
      const depTask = tasks.find(t => t.Id === depId)
      return depTask ? enrichTask(depTask) : null
    }).filter(Boolean)
    
    const blocking = tasks.filter(t => 
      (t.dependsOn || []).includes(parseInt(taskId))
    ).map(enrichTask)
    
    return {
      dependencies,
      blocking,
      canStart: dependencies.every(dep => dep.completed)
    }
  },

  async wouldCreateCircularDependency(taskId, dependencyId) {
    const visited = new Set()
    
    const hasPath = (fromId, toId) => {
      if (fromId === toId) return true
      if (visited.has(fromId)) return false
      
      visited.add(fromId)
      
      const task = tasks.find(t => t.Id === parseInt(fromId))
      if (!task || !task.dependsOn) return false
      
      return task.dependsOn.some(depId => hasPath(depId, toId))
    }
    
    return hasPath(parseInt(dependencyId), parseInt(taskId))
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
    await delay(250);
    return tasks
      .filter(task => task.projectId === parseInt(projectId))
      .map(enrichTask);
  }
};