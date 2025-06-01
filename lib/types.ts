export interface Task {
  id: string;
  title: string;
  end: string;
  parent?: string;
  assignee?: string;
  status: "pending" | "running" | "done" | "suggested";
  description?: string;
  tags?: string[];
  startDate?: string;
  // dueDate?: string; // TaskNodeDataでendを使用するため、重複する可能性のあるdueDateは一旦コメントアウト
  // name?: string; // title と重複するため削除

  // 候補タスク用のオプショナルプロパティ
  accuracy?: number;
  agentName?: string;
  estimatedTime?: string;
  // estimatedDuration は SuggestedTask に残し、startDate/endに変換する元とする
}

// TaskNodeDataの定義 (components/task-node.tsx から移動)
export interface TaskNodeData extends Task {
  width: number;
  height: number;
  onTaskClick: (taskId: string) => void;
  onDateChange: (taskId: string, newDate: string) => void;
  // onToggleSuggestions?: (taskId: string) => void; // これは削除
  // 以下の古いプロパティを復活させる
  isSuggestionActive?: boolean;
  currentSuggestedTasks?: SuggestedTask[];
  onShowSuggestionsClick?: (parentId: string) => void;
  onApproveSuggestion?: (parentId: string, suggestion: SuggestedTask) => void; // これはSuggestionNodeから呼ばれるので残す
  onRejectSuggestion?: (parentId: string, suggestionId: string) => void; // これはSuggestionNodeから呼ばれるので残す
  onHideSuggestions?: () => void;
}

// export interface TaskNode { // この古いTaskNodeの定義は削除
//   id: string;
//   type: string;
//   position: { x: number; y: number };
//   data: Task & {
//     width: number;
//     height: number;
//     onTaskClick: (taskId: string) => void;
//     onDateChange: (taskId: string, newDate: string) => void;
//     isSuggestionActive?: boolean;
//     currentSuggestedTasks?: SuggestedTask[];
//     onShowSuggestionsClick?: (parentId: string) => void;
//     onApproveSuggestion?: (parentId: string, suggestion: SuggestedTask) => void;
//     onRejectSuggestion?: (parentId: string, suggestionId: string) => void;
//     onHideSuggestions?: () => void;
//   };
// }

export interface TaskEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
}

export interface SuggestedTask extends Task {
  estimatedDuration: number;
}
