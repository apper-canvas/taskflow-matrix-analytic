import { format, isToday, isTomorrow, isYesterday, isThisWeek, isThisYear, addDays, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns"

export const formatTaskDate = (date) => {
  if (!date) return ""
  
  const taskDate = new Date(date)
  
  if (isToday(taskDate)) return "Today"
  if (isTomorrow(taskDate)) return "Tomorrow"
  if (isYesterday(taskDate)) return "Yesterday"
  
  if (isThisWeek(taskDate)) {
    return format(taskDate, "EEEE")
  }
  
  if (isThisYear(taskDate)) {
    return format(taskDate, "MMM d")
  }
  
  return format(taskDate, "MMM d, yyyy")
}

export const formatTaskDateTime = (date) => {
  if (!date) return ""
  
  const taskDate = new Date(date)
  
  if (isToday(taskDate)) {
    return `Today, ${format(taskDate, "h:mm a")}`
  }
  
  if (isTomorrow(taskDate)) {
    return `Tomorrow, ${format(taskDate, "h:mm a")}`
  }
  
  return format(taskDate, "MMM d, h:mm a")
}

export const isOverdue = (date) => {
  if (!date) return false
  const taskDate = new Date(date)
  const now = new Date()
  return taskDate < startOfDay(now)
}

export const isDueToday = (date) => {
  if (!date) return false
  return isToday(new Date(date))
}

export const isDueSoon = (date) => {
  if (!date) return false
  const taskDate = new Date(date)
  const threeDaysFromNow = addDays(new Date(), 3)
  const today = new Date()
  return taskDate >= startOfDay(today) && taskDate <= endOfDay(threeDaysFromNow)
}

export const getUpcomingTasks = (tasks, days = 7) => {
  const startDate = startOfDay(new Date())
  const endDate = endOfDay(addDays(new Date(), days))
  
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    return dueDate >= startDate && dueDate <= endDate
  })
}

export const getTodayTasks = (tasks) => {
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    return isToday(new Date(task.dueDate))
  })
}

export const getOverdueTasks = (tasks) => {
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    return isOverdue(task.dueDate)
  })
}

export const groupTasksByDate = (tasks) => {
  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    upcoming: []
  }
  
  tasks.forEach(task => {
    if (!task.dueDate) {
      groups.upcoming.push(task)
      return
    }
    
    const dueDate = new Date(task.dueDate)
    
    if (isOverdue(task.dueDate)) {
      groups.overdue.push(task)
    } else if (isToday(dueDate)) {
      groups.today.push(task)
    } else if (isTomorrow(dueDate)) {
      groups.tomorrow.push(task)
    } else if (isThisWeek(dueDate)) {
      groups.thisWeek.push(task)
    } else {
      groups.upcoming.push(task)
    }
  })
  
  return groups
}