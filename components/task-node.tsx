"use client"

import type React from "react"

import { memo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface TaskNodeData extends Task {
  width: number
  height: number
  onTaskClick: (taskId: string) => void
  onDateChange: (taskId: string, newDate: string) => void
  onSuggestTask: (taskId: string) => void
}

export const TaskNode = memo(({ data, selected }: NodeProps<TaskNodeData>) => {
  const [isDragging, setIsDragging] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-500"
      case "running":
        return "bg-blue-500"
      case "done":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待機中"
      case "running":
        return "実行中"
      case "done":
        return "完了"
      default:
        return "不明"
    }
  }

  const handleTaskClick = () => {
    data.onTaskClick(data.id)
  }

  const handleSuggestTask = (e: React.MouseEvent) => {
    e.stopPropagation()
    data.onSuggestTask(data.id)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    // ここで新しい日付を計算して送信
    console.log(`PATCH /nodes/${data.id}`, { end: data.end })
  }

  return (
    <div
      className={cn(
        "relative bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200",
        selected ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300",
        isDragging && "opacity-75",
      )}
      style={{ width: data.width, height: data.height }}
      onClick={handleTaskClick}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400" />

      <div className="p-3 h-full flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{data.name}</h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
              onClick={handleSuggestTask}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn("text-white text-xs", getStatusColor(data.status))}>
              {getStatusText(data.status)}
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          {data.assignee && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{data.assignee}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{new Date(data.end).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-gray-400" />
    </div>
  )
})

TaskNode.displayName = "TaskNode"
