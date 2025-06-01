// import type { SuggestedTask } from "./types"; // 自分自身を参照しないように

export interface Task {
  id: string;
  name: string;
  end: string;
  parent?: string;
  assignee?: string;
  status: "pending" | "running" | "done";
  description?: string;
  tags?: string[];
  startDate?: string;
  // dueDate?: string; // TaskNodeDataでendを使用するため、重複する可能性のあるdueDateは一旦コメントアウト
  title?: string; // TaskNodeDataのnameと役割が被るため、どちらかに統一検討
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

export interface SuggestedTask {
  id: string;
  title: string;
  description?: string;
  estimatedDuration: number;
  agentName?: string;
  estimatedTime?: string;
  accuracy?: number;
  // parentId?: string; // SuggestionNodeDataに定義するため、こちらには不要
}
