"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, User, Tag, Link2, Loader2, X, Plus, Save } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

interface TaskSidebarProps {
  taskId: string | null
  isOpen: boolean
  onClose: () => void
}

interface TaskEdge {
  id: string
  source: string
  target: string
  type: string
}

interface RelatedTask {
  id: string
  title: string
  status: string
}

export function TaskSidebar({ taskId, isOpen, onClose }: TaskSidebarProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [edges, setEdges] = useState<TaskEdge[]>([])
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([])
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [newTag, setNewTag] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskData(taskId)
    }

    return () => {
      setTask(null)
      setEdges([])
      setRelatedTasks([])
      setEditedTask({})
      setIsLoading(false)
      setIsSaving(false)
    }
  }, [isOpen, taskId])

  const fetchTaskData = async (id: string) => {
    setIsLoading(true)
    try {
      // モックデータ（実際のAPIに置き換え）
      const mockTask = {
        id,
        name: `タスク ${id}`,
        title: `タスク ${id}`,
        description: "サンプルタスクの説明です。",
        assignee: "田中太郎",
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "running" as const,
        tags: ["重要", "フロントエンド"],
      }

      setTask(mockTask)
      setEditedTask({
        title: mockTask.title,
        description: mockTask.description,
        assignee: mockTask.assignee,
        dueDate: mockTask.dueDate,
        tags: mockTask.tags || [],
      })

      // モック依存関係データ
      const mockEdges = [{ id: "e1", source: id, target: "task-2", type: "depends" }]
      setEdges(mockEdges)

      const mockRelatedTasks = [{ id: "task-2", title: "関連タスク1", status: "pending" }]
      setRelatedTasks(mockRelatedTasks)
    } catch (error) {
      console.error("タスクデータの取得エラー:", error)
      toast({
        title: "エラー",
        description: "データの取得中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!task) return

    setIsSaving(true)
    try {
      console.log(`PATCH /nodes/${task.id}`, editedTask)

      toast({
        title: "保存完了",
        description: "タスク情報が更新されました",
      })

      fetchTaskData(task.id)
    } catch (error) {
      console.error("タスク更新エラー:", error)
      toast({
        title: "保存エラー",
        description: "タスクの更新中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return

    const currentTags = editedTask.tags || []
    if (!currentTags.includes(newTag)) {
      handleInputChange("tags", [...currentTags, newTag])
    }
    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    const currentTags = editedTask.tags || []
    handleInputChange(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  const getRelationshipType = (edge: TaskEdge, taskId: string) => {
    if (edge.source === taskId) {
      return "依存先"
    } else {
      return "依存元"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{isLoading ? "読み込み中..." : "タスク詳細"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* タイトル */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                タイトル
              </label>
              <Input
                id="title"
                value={editedTask.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="タスクのタイトル"
              />
            </div>

            {/* 説明 */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                説明
              </label>
              <Textarea
                id="description"
                value={editedTask.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="タスクの説明"
                rows={3}
              />
            </div>

            {/* 担当者 */}
            <div className="space-y-2">
              <label htmlFor="assignee" className="text-sm font-medium">
                担当者
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="assignee"
                  value={editedTask.assignee || ""}
                  onChange={(e) => handleInputChange("assignee", e.target.value)}
                  placeholder="担当者名"
                />
              </div>
            </div>

            {/* 期日 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">期日</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedTask.dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.dueDate ? (
                      format(new Date(editedTask.dueDate), "yyyy年MM月dd日", { locale: ja })
                    ) : (
                      <span>期日を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                    onSelect={(date) => handleInputChange("dueDate", date ? date.toISOString().split("T")[0] : null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* タグ */}
            <div className="space-y-2">
              <label className="text-sm font-medium">タグ</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editedTask.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="新しいタグを追加"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button size="sm" variant="outline" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 依存関係 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">依存関係</h3>
              {edges.length === 0 ? (
                <p className="text-sm text-muted-foreground">依存関係はありません</p>
              ) : (
                <ul className="space-y-2">
                  {edges.map((edge) => {
                    const relatedTask = relatedTasks.find(
                      (t) => t.id === (edge.source === task?.id ? edge.target : edge.source),
                    )
                    if (!relatedTask) return null

                    return (
                      <li key={edge.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{relatedTask.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{getRelationshipType(edge, task?.id || "")}</Badge>
                          <Badge
                            variant={
                              relatedTask.status === "done"
                                ? "default"
                                : relatedTask.status === "running"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {relatedTask.status === "pending"
                              ? "待機中"
                              : relatedTask.status === "running"
                                ? "実行中"
                                : "完了"}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
