"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Sparkles } from "lucide-react";
import type { SuggestedTask } from "@/lib/types";

interface SuggestedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTaskId: string | null;
  onApproveTask: (task: SuggestedTask) => void;
}

export function SuggestedTasksModal({
  isOpen,
  onClose,
  parentTaskId,
  onApproveTask,
}: SuggestedTasksModalProps) {
  const [suggestedTasks] = useState<SuggestedTask[]>(() => {
    const today = new Date();
    return [
      {
        id: "suggested-1",
        title: "UIコンポーネントの設計",
        description: "ユーザーインターフェースの詳細設計を行う",
        estimatedDuration: 3,
        status: "suggested" as const,
        startDate: today.toISOString().split("T")[0],
        end: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "suggested-2",
        title: "データベーススキーマの作成",
        description: "アプリケーションで使用するデータベーススキーマを設計する",
        estimatedDuration: 2,
        status: "suggested" as const,
        startDate: today.toISOString().split("T")[0],
        end: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      {
        id: "suggested-3",
        title: "API仕様書の作成",
        description: "フロントエンドとバックエンド間のAPI仕様を定義する",
        estimatedDuration: 4,
        status: "suggested" as const,
        startDate: today.toISOString().split("T")[0],
        end: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    ];
  });

  const handleApprove = (task: SuggestedTask) => {
    onApproveTask(task);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            タスク候補の提案
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            AIが次に実行すべきタスクを提案しました。承認するタスクを選択してください。
          </p>

          <div className="space-y-3">
            {suggestedTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {task.estimatedDuration}日
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(task)}
                    className="ml-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    承認
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
