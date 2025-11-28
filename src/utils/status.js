export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "not-started":
      return "secondary"
    case "pending":
      return "warning"
    case "in-progress":
      return "default"
    case "completed":
      return "success"
    case "on-hold":
      return "warning"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "not-started":
      return "Circle"
    case "pending":
      return "Clock"
    case "in-progress":
      return "Play"
    case "completed":
      return "CheckCircle2"
    case "on-hold":
      return "Pause"
    case "cancelled":
      return "XCircle"
    default:
      return "Circle"
  }
}

export const canTransitionStatus = (fromStatus, toStatus) => {
  const transitions = {
    "not-started": ["pending", "in-progress", "cancelled"],
    "pending": ["in-progress", "on-hold", "cancelled"],
    "in-progress": ["completed", "on-hold", "pending", "cancelled"],
    "on-hold": ["pending", "in-progress", "cancelled"],
    "completed": ["pending"], // Allow reopening
    "cancelled": ["not-started", "pending"]
  }
  
  return transitions[fromStatus]?.includes(toStatus) || false
}

export const getStatusDisplayName = (status) => {
  switch (status?.toLowerCase()) {
    case "not-started":
      return "Not Started"
    case "in-progress":
      return "In Progress"
    case "on-hold":
      return "On Hold"
    default:
      return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || "Unknown"
  }
}