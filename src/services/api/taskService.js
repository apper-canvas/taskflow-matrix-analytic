import tasksData from "@/services/mockData/tasks.json";
import projectsData from "@/services/mockData/projects.json";
import teamsData from "@/services/mockData/teams.json";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "@/utils/date";
import { calculateNextOccurrence, isValidRecurrencePattern } from "@/utils/recurrence";

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
    blockedBy: task.blockedBy || [],
    notes: task.notes || [],
    files: task.files || [],
    discussions: task.discussions || []
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
    await delay(300);
    
    const newTask = {
      Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dependsOn: taskData.dependsOn || [],
      blockedBy: taskData.blockedBy || []
    };
    
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
},

  // Notes operations
  async addNote(taskId, content) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    if (!tasks[taskIndex].notes) tasks[taskIndex].notes = [];
    
    const newNote = {
      Id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks[taskIndex].notes.push(newNote);
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    return enrichTask(tasks[taskIndex]);
  },

  async updateNote(taskId, noteId, content) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const task = tasks[taskIndex];
    if (!task.notes) task.notes = [];
    
    const noteIndex = task.notes.findIndex(n => n.Id === parseInt(noteId));
    if (noteIndex === -1) {
      throw new Error("Note not found");
    }
    
    task.notes[noteIndex] = {
      ...task.notes[noteIndex],
      content,
      updatedAt: new Date().toISOString()
    };
    
    task.updatedAt = new Date().toISOString();
    
    return enrichTask(task);
  },

  async deleteNote(taskId, noteId) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const task = tasks[taskIndex];
    if (!task.notes) task.notes = [];
    
    task.notes = task.notes.filter(n => n.Id !== parseInt(noteId));
    task.updatedAt = new Date().toISOString();
    
    return enrichTask(task);
  },

  // Files operations
  async addFile(taskId, fileData) {
    await delay(300);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    if (!tasks[taskIndex].files) tasks[taskIndex].files = [];
    
    const newFile = {
      Id: Date.now(),
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      uploadedAt: new Date().toISOString(),
      url: `#file-${Date.now()}` // Mock URL
    };
    
    tasks[taskIndex].files.push(newFile);
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    return enrichTask(tasks[taskIndex]);
  },

  async deleteFile(taskId, fileId) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    const task = tasks[taskIndex];
    if (!task.files) task.files = [];
    
    task.files = task.files.filter(f => f.Id !== parseInt(fileId));
    task.updatedAt = new Date().toISOString();
    
    return enrichTask(task);
  },

  // Discussions operations
  async addDiscussion(taskId, content) {
    await delay(200);
    
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(taskId));
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    if (!tasks[taskIndex].discussions) tasks[taskIndex].discussions = [];
    
    const newDiscussion = {
      Id: Date.now(),
      content,
      author: 'Current User', // In real app, get from auth context
      createdAt: new Date().toISOString()
    };
    
    tasks[taskIndex].discussions.push(newDiscussion);
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    return enrichTask(tasks[taskIndex]);
  },

  async getDiscussions(taskId) {
    await delay(150);
    
    const task = tasks.find(t => t.Id === parseInt(taskId));
    if (!task) {
      throw new Error("Task not found");
    }
    
    return task.discussions || [];
  }
};