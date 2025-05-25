export interface Task {
  id: string
  name: string
  end: string
  parent?: string
  assignee?: string
  status: "pending" | "running" | "done"
  description?: string
  tags?: string[]
  startDate?: string
  dueDate?: string
  title?: string
}

export interface TaskNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Task & {
    width: number
    height: number
    onTaskClick: (taskId: string) => void
    onDateChange: (taskId: string, newDate: string) => void
    onSuggestTask: (taskId: string) => void
  }
}

export interface TaskEdge {
  id: string
  source: string
  target: string
  type: string
  animated?: boolean
}

export interface SuggestedTask {
  id: string
  title: string
  description: string
  estimatedDuration: number
}
