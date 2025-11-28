export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-error-600 bg-error-50 border-error-200 dark:text-error-400 dark:bg-error-900 dark:border-error-800"
    case "medium":
      return "text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-900 dark:border-warning-800"
    case "low":
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700"
  }
}

export const getPriorityIcon = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "AlertTriangle"
    case "medium":
      return "Clock"
    case "low":
      return "Minus"
    default:
      return "Minus"
  }
}

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  
  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority?.toLowerCase()] || 0
    const bPriority = priorityOrder[b.priority?.toLowerCase()] || 0
    return bPriority - aPriority
  })
}