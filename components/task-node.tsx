"use client";

import type React from "react";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskNodeData } from "@/lib/types";

export const TaskNode = memo(({ data, selected }: NodeProps<TaskNodeData>) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSuggestionButton, setShowSuggestionButton] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-500";
      case "running":
        return "bg-blue-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待機中";
      case "running":
        return "実行中";
      case "done":
        return "完了";
      default:
        return "不明";
    }
  };

  const handleTaskClick = () => {
    data.onTaskClick(data.id);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // ここで新しい日付を計算して送信
    console.log(`PATCH /nodes/${data.id}`, { end: data.end });
  };

  return (
    <div
      className={cn(
        "relative bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200",
        selected
          ? "border-blue-500 shadow-md"
          : "border-gray-200 hover:border-gray-300",
        isDragging && "opacity-75"
      )}
      style={{ width: data.width, height: data.height }}
      onClick={handleTaskClick}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400"
      />

      <div className="p-3 h-full flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {data.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-white text-xs", getStatusColor(data.status))}
            >
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

      {/* 右ハンドルと「タスク候補を取得」ボタンのコンテナ */}
      <div
        className="absolute top-1/2 right-0 transform -translate-y-1/2 h-full flex items-center"
        onMouseEnter={() => setShowSuggestionButton(true)}
        onMouseLeave={() => setShowSuggestionButton(false)}
      >
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 !bg-blue-500 rounded-full cursor-pointer z-10"
          // onMouseEnter/onMouseLeave は親divに移動
        />

        {showSuggestionButton &&
          !data.isSuggestionActive && // isSuggestionActiveがfalseの時だけ表示
          data.onShowSuggestionsClick && ( // onShowSuggestionsClick を使用
            <div className="absolute left-full ml-1 z-20 p-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.onShowSuggestionsClick) {
                    // data.onShowSuggestionsClick を呼び出す
                    data.onShowSuggestionsClick(data.id);
                  }
                  setShowSuggestionButton(false); // クリック後はボタンを隠す
                }}
                // classNameを元に戻すイメージ (元の画像に近いスタイルに)
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-auto py-1 px-2 rounded whitespace-nowrap shadow-lg"
              >
                {/* アイコンは削除し、テキストのみに */}+ タスク候補を取得
              </Button>
            </div>
          )}
      </div>

      {/* 候補タスクのリスト表示をここに復元 */}
      {data.isSuggestionActive && data.currentSuggestedTasks && (
        <div
          className="absolute left-[calc(100%_+_10px)] top-0 w-[320px] space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {data.currentSuggestedTasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              提案できるタスクはありません。
            </p>
          ) : (
            data.currentSuggestedTasks.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                style={{ width: "100%" }}
              >
                {/* Main content area - similar to TaskNode */}
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {suggestion.title}
                    </h3>
                    {/* Accuracy - Temporarily removed */}
                  </div>

                  {suggestion.description && (
                    <p className="text-xs text-gray-600 leading-normal line-clamp-2">
                      {suggestion.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-white text-xs",
                        getStatusColor(suggestion.status)
                      )}
                    >
                      {getStatusText(suggestion.status)}
                    </Badge>
                  </div>
                </div>

                {/* Footer area - now includes action buttons */}
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-1 space-x-2">
                  {/* Left side: Assignee and Dates */}
                  <div className="space-y-0.5">
                    {(suggestion.assignee || suggestion.agentName) && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span>
                          {suggestion.assignee || suggestion.agentName}
                        </span>
                      </div>
                    )}
                    {(suggestion.startDate || suggestion.end) && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {suggestion.startDate
                            ? new Date(suggestion.startDate).toLocaleDateString(
                                "ja-JP"
                              )
                            : "?"}
                          {" - "}
                          {suggestion.end
                            ? new Date(suggestion.end).toLocaleDateString(
                                "ja-JP"
                              )
                            : "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right side: Action Buttons */}
                  <div className="flex space-x-2">
                    {data.onRejectSuggestion && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-8 h-8 bg-red-100 border-red-500 text-red-500 hover:bg-red-200 hover:text-red-600 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          data.onRejectSuggestion &&
                            data.onRejectSuggestion(data.id, suggestion.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {data.onApproveSuggestion && (
                      <Button
                        variant="default"
                        size="icon"
                        className="rounded-full w-8 h-8 bg-green-500 text-white hover:bg-green-600 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          data.onApproveSuggestion &&
                            data.onApproveSuggestion(data.id, suggestion);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

TaskNode.displayName = "TaskNode";
