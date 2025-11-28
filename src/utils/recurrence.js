import { addDays, addWeeks, addMonths, format, isBefore, isAfter, startOfDay } from "date-fns"

export const RECURRENCE_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly", 
  MONTHLY: "monthly"
}

export const RECURRENCE_END_TYPES = {
  NEVER: "never",
  DATE: "date",
  COUNT: "count"
}

export const isValidRecurrencePattern = (recurrence) => {
  if (!recurrence || typeof recurrence !== "object") return false
  
  const { type, interval, endType, endDate, endCount } = recurrence
  
  // Validate type
  if (!Object.values(RECURRENCE_TYPES).includes(type)) return false
  
  // Validate interval
  if (!interval || interval < 1 || interval > 365) return false
  
  // Validate end type
  if (!Object.values(RECURRENCE_END_TYPES).includes(endType)) return false
  
  // Validate end conditions
  if (endType === RECURRENCE_END_TYPES.DATE) {
    if (!endDate || isNaN(new Date(endDate).getTime())) return false
    if (isBefore(new Date(endDate), new Date())) return false
  }
  
  if (endType === RECURRENCE_END_TYPES.COUNT) {
    if (!endCount || endCount < 1 || endCount > 1000) return false
  }
  
  return true
}

export const calculateNextOccurrence = (fromDate, recurrence) => {
  if (!recurrence || !isValidRecurrencePattern(recurrence)) return null
  
  const { type, interval, endType, endDate, endCount } = recurrence
  const baseDate = startOfDay(fromDate)
  let nextDate = baseDate
  
  // Calculate next occurrence based on type
  switch (type) {
    case RECURRENCE_TYPES.DAILY:
      nextDate = addDays(baseDate, interval)
      break
    case RECURRENCE_TYPES.WEEKLY:
      nextDate = addWeeks(baseDate, interval)
      break
    case RECURRENCE_TYPES.MONTHLY:
      nextDate = addMonths(baseDate, interval)
      break
    default:
      return null
  }
  
  // Check end conditions
  if (endType === RECURRENCE_END_TYPES.DATE && endDate) {
    if (isAfter(nextDate, new Date(endDate))) return null
  }
  
  return nextDate
}

export const formatRecurrencePattern = (recurrence) => {
  if (!recurrence || !isValidRecurrencePattern(recurrence)) return ""
  
  const { type, interval, endType, endDate, endCount } = recurrence
  
  let pattern = ""
  
  // Build pattern description
  if (interval === 1) {
    switch (type) {
      case RECURRENCE_TYPES.DAILY:
        pattern = "Daily"
        break
      case RECURRENCE_TYPES.WEEKLY:
        pattern = "Weekly"
        break
      case RECURRENCE_TYPES.MONTHLY:
        pattern = "Monthly"
        break
    }
  } else {
    switch (type) {
      case RECURRENCE_TYPES.DAILY:
        pattern = `Every ${interval} days`
        break
      case RECURRENCE_TYPES.WEEKLY:
        pattern = `Every ${interval} weeks`
        break
      case RECURRENCE_TYPES.MONTHLY:
        pattern = `Every ${interval} months`
        break
    }
  }
  
  // Add end condition
  switch (endType) {
    case RECURRENCE_END_TYPES.DATE:
      if (endDate) {
        pattern += ` until ${format(new Date(endDate), "MMM d, yyyy")}`
      }
      break
    case RECURRENCE_END_TYPES.COUNT:
      if (endCount) {
        pattern += ` for ${endCount} occurrences`
      }
      break
    case RECURRENCE_END_TYPES.NEVER:
    default:
      // No additional text needed
      break
  }
  
  return pattern
}

export const shouldGenerateNextOccurrence = (task) => {
  if (!task?.isRecurring || !task?.recurrence || !task?.nextOccurrence) return false
  
  const now = new Date()
  const nextOccurrence = new Date(task.nextOccurrence)
  
  // Generate if next occurrence is due (today or earlier)
  return !isAfter(nextOccurrence, startOfDay(now))
}

export const generateRecurringTaskInstance = (originalTask) => {
  if (!originalTask?.isRecurring || !originalTask?.recurrence) return null
  
  const nextOccurrence = calculateNextOccurrence(
    new Date(originalTask.nextOccurrence || new Date()), 
    originalTask.recurrence
  )
  
  if (!nextOccurrence) return null
  
  return {
    ...originalTask,
    Id: null, // Will be assigned by service
    title: originalTask.title,
    dueDate: nextOccurrence.toISOString(),
    completed: false,
    parentTaskId: originalTask.Id,
    isRecurring: false, // Individual instances are not recurring
    recurrence: null,
    nextOccurrence: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}