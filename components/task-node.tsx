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
              {data.name}
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
          className="absolute left-[calc(100%_+_10px)] top-0 w-[320px] bg-white border border-gray-300 rounded-lg shadow-xl z-20 p-4 space-y-3"
          onClick={(e) => e.stopPropagation()} // イベントの伝播を止める
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-semibold text-gray-800">
              候補タスク
            </h4>
            {data.onHideSuggestions && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onHideSuggestions && data.onHideSuggestions();
                }}
                className="p-0 h-6 w-6 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {data.currentSuggestedTasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              提案できるタスクはありません。
            </p>
          ) : (
            data.currentSuggestedTasks.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-3 border border-gray-200 rounded-md bg-gray-50 hover:shadow-sm transition-shadow duration-150"
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-gray-900">
                    {suggestion.title}
                  </h5>
                  {suggestion.accuracy && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        suggestion.accuracy >= 90
                          ? "border-green-500 text-green-700 bg-green-50"
                          : suggestion.accuracy >= 85
                          ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                          : "border-red-500 text-red-700 bg-red-50"
                      }`}
                    >
                      {suggestion.accuracy}%
                    </Badge>
                  )}
                </div>
                {suggestion.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {suggestion.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  {suggestion.agentName && (
                    <span className="font-medium">
                      Agent: {suggestion.agentName}
                    </span>
                  )}
                  {suggestion.estimatedTime && (
                    <span>Est. Time: {suggestion.estimatedTime}</span>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  {data.onRejectSuggestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 h-7 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onRejectSuggestion &&
                          data.onRejectSuggestion(data.id, suggestion.id);
                      }}
                    >
                      <X className="h-3 w-3 mr-1" /> 拒否
                    </Button>
                  )}
                  {data.onApproveSuggestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 h-7 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        data.onApproveSuggestion &&
                          data.onApproveSuggestion(data.id, suggestion);
                      }}
                    >
                      <Check className="h-3 w-3 mr-1" /> 承認
                    </Button>
                  )}
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
