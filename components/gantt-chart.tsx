"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  type Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { TaskNode } from "@/components/task-node";
import { TaskSidebar } from "@/components/task-sidebar";
import { SuggestedTasksModal } from "@/components/suggested-tasks-modal";
import type { Task, SuggestedTask, TaskNodeData } from "@/lib/types";

const nodeTypes = {
  taskNode: TaskNode,
};

// モックデータ
export const mockTasks: Task[] = [
  {
    id: "task1-1",
    name: "タスク1",
    startDate: "2025-06-01",
    end: "2025-06-13",
    status: "running" as const,
    assignee: "田中 太郎",
  },
  {
    id: "task1-2",
    name: "タスク2",
    startDate: "2025-06-10",
    end: "2025-06-15",
    parent: "task1-1",
    status: "pending" as const,
    assignee: "佐藤 花子",
  },
  {
    id: "task1-3",
    name: "タスク3",
    startDate: "2025-06-14",
    end: "2025-06-20",
    parent: "task1-2",
    status: "done" as const,
    assignee: "鈴木 一郎",
  },
  {
    id: "task1",
    name: "プロジェクト計画",
    startDate: "2025-05-25",
    end: "2025-06-01",
    status: "done" as const,
    assignee: "田中 太郎",
  },
  {
    id: "task2",
    name: "要件定義",
    startDate: "2025-06-01",
    end: "2025-06-10",
    parent: "task1",
    status: "done" as const,
    assignee: "佐藤 花子",
  },
  {
    id: "task3",
    name: "デザイン",
    startDate: "2025-06-10",
    end: "2025-06-20",
    parent: "task1",
    status: "running" as const,
    assignee: "鈴木 一郎",
  },
  {
    id: "task4",
    name: "フロントエンド開発",
    startDate: "2025-07-01",
    end: "2025-07-09",
    parent: "task3",
    status: "running" as const,
    assignee: "田中 太郎",
  },
  {
    id: "task5",
    name: "バックエンド開発",
    startDate: "2025-07-01",
    end: "2025-07-10",
    parent: "task3",
    status: "pending" as const,
    assignee: "佐藤 花子",
  },
  {
    id: "task6",
    name: "テスト",
    startDate: "2025-07-15",
    end: "2025-07-21",
    parent: "task4",
    status: "pending" as const,
    assignee: "鈴木 一郎",
  },
  {
    id: "task7",
    name: "デプロイ",
    startDate: "2025-07-21",
    end: "2025-07-27",
    parent: "task5",
    status: "pending" as const,
    assignee: "田中 太郎",
  },
];

export default function GanttChart() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [suggestedTasksModal, setSuggestedTasksModal] = useState({
    isOpen: false,
    parentTaskId: null as string | null,
  });

  const [activeSuggestionParentId, setActiveSuggestionParentId] = useState<
    string | null
  >(null);
  const [currentSuggestedTasks, setCurrentSuggestedTasks] = useState<
    Record<string, SuggestedTask[]>
  >({});

  // processedTasks の定義 (tasks に依存)
  const processedTasks = useMemo(() => {
    return tasks.map((task) => {
      if (!task.end) {
        const today = new Date();
        const defaultDue = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        task.end = defaultDue.toISOString().split("T")[0];
      }
      return task;
    });
  }, [tasks]);

  // initialEdges の定義 (processedTasks に依存)
  const initialEdges: Edge[] = useMemo(() => {
    return processedTasks
      .filter((task) => task.parent)
      .map((task) => ({
        id: `edge-${task.parent}-${task.id}`,
        source: task.parent!,
        target: task.id,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#4f46e5",
          strokeWidth: 3,
        },
      }));
  }, [processedTasks]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setIsSidebarOpen(true);
  }, []);

  const handleDateChange = useCallback((taskId: string, newDate: string) => {
    console.log(`PATCH /nodes/${taskId}`, { end: newDate });
    // ここで実際のAPI呼び出しを行う
  }, []);

  const handleSuggestTask = useCallback((taskId: string) => {
    setSuggestedTasksModal({
      isOpen: true,
      parentTaskId: taskId,
    });
  }, []);

  const handleShowSuggestions = useCallback(
    (parentId: string) => {
      console.log(
        `GanttChart: handleShowSuggestions called for parentId: ${parentId}`
      );
      setActiveSuggestionParentId(parentId);
      // 候補タスクがまだロードされていなければロードする
      if (
        !currentSuggestedTasks[parentId] ||
        currentSuggestedTasks[parentId].length === 0
      ) {
        const mockSuggestions: SuggestedTask[] = [
          {
            id: "sug1-" + parentId,
            title: "実現可能性分析",
            description: "技術的・ビジネス的実現可能性を分析",
            agentName: "FeasibilityAgent",
            estimatedTime: "2-3 min",
            accuracy: 92,
            estimatedDuration: 2,
          },
          {
            id: "sug2-" + parentId,
            title: "コスト見積もり",
            description: "費用対効果、CAPEX, OPEXを算出",
            agentName: "CostAgent",
            estimatedTime: "3-4 min",
            accuracy: 87,
            estimatedDuration: 3,
          },
          {
            id: "sug3-" + parentId,
            title: "再利用性評価",
            description: "再利用可能なパターンや既存資産を特定",
            agentName: "ReuseAgent",
            estimatedTime: "2-3 min",
            accuracy: 89,
            estimatedDuration: 2,
          },
        ];
        setCurrentSuggestedTasks((prev) => ({
          ...prev,
          [parentId]: mockSuggestions,
        }));
      }
    },
    [currentSuggestedTasks]
  );

  const handleHideSuggestions = useCallback(() => {
    console.log(
      `GanttChart: handleHideSuggestions called. activeSuggestionParentId will be set to null.`
    );
    setActiveSuggestionParentId(null);
  }, []);

  const handleApproveSuggestion = useCallback(
    (parentId: string, suggestion: SuggestedTask) => {
      console.log(
        `GanttChart: handleApproveSuggestion for parent [${parentId}], suggestion:`,
        suggestion
      );
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: suggestion.title,
        parent: parentId,
        status: "pending",
        startDate: new Date().toISOString().split("T")[0],
        end: new Date(
          Date.now() + suggestion.estimatedDuration * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        assignee: suggestion.agentName || "未割り当て",
        description: suggestion.description,
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);

      if (newTask.parent) {
        const newEdge: Edge = {
          id: `edge-${newTask.parent}-${newTask.id}`,
          source: newTask.parent,
          target: newTask.id,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#4f46e5",
            strokeWidth: 3,
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }

      setCurrentSuggestedTasks((prev) => {
        const updatedSuggestions = { ...prev };
        if (updatedSuggestions[parentId]) {
          updatedSuggestions[parentId] = updatedSuggestions[parentId].filter(
            (s) => s.id !== suggestion.id
          );
        }
        if (updatedSuggestions[parentId]?.length === 0) {
          setActiveSuggestionParentId(null);
        }
        return updatedSuggestions;
      });
    },
    [setTasks, setEdges]
  );

  const handleRejectSuggestion = useCallback(
    (parentId: string, suggestionId: string) => {
      console.log(
        `GanttChart: handleRejectSuggestion for parent [${parentId}], suggestionId: ${suggestionId}`
      );
      setCurrentSuggestedTasks((prev) => {
        const updatedSuggestions = { ...prev };
        if (updatedSuggestions[parentId]) {
          updatedSuggestions[parentId] = updatedSuggestions[parentId].filter(
            (s) => s.id !== suggestionId
          );
        }
        if (updatedSuggestions[parentId]?.length === 0) {
          setActiveSuggestionParentId(null);
        }
        return updatedSuggestions;
      });
    },
    []
  );

  // ノード生成ロジックを関数化
  function generateNodesFromTasks(
    currentTasks: (Task & { children?: Task[] })[],
    currentActiveSuggestionParentId: string | null,
    currentSuggestedTasksMap: Record<string, SuggestedTask[]>,
    clickFn: (taskId: string) => void,
    dateChangeFn: (taskId: string, newDate: string) => void,
    showSuggestionsFn: (parentId: string) => void,
    hideSuggestionsFn: () => void,
    approveSuggestionFn: (parentId: string, suggestion: SuggestedTask) => void,
    rejectSuggestionFn: (parentId: string, suggestionId: string) => void
  ): Node[] {
    // 1. タスクをIDでマップ化
    const taskMap: Record<string, Task & { children?: Task[] }> = {};
    currentTasks.forEach((task) => {
      taskMap[task.id] = { ...task, children: [] };
    });
    // 2. 親子関係を構築
    currentTasks.forEach((task) => {
      if (task.parent && taskMap[task.parent]) {
        taskMap[task.parent].children!.push(taskMap[task.id]);
      }
    });
    // 3. ルートタスクを抽出
    const roots = Object.values(taskMap).filter((task) => !task.parent);

    // 4. 再帰的にノード配置
    const nodes: Node[] = [];
    const nodeWidth = 280;
    const nodeHeight = 130;
    const xGap = 350;
    const yGap = 50;
    let globalY = 50;
    function placeNode(
      task: Task & { children?: Task[] },
      x: number,
      y: number,
      parentX: number | null,
      parentY: number | null
    ): number {
      if (
        task.id === currentActiveSuggestionParentId ||
        (currentSuggestedTasksMap &&
          Object.prototype.hasOwnProperty.call(
            currentSuggestedTasksMap,
            task.id
          ))
      ) {
        console.log(`GanttChart: placeNode for task.id [${task.id}].`);
        console.log(
          `GanttChart: currentSuggestedTasksMap[${task.id}] in placeNode (used for currentSuggestedTasks):`,
          currentSuggestedTasksMap && currentSuggestedTasksMap[task.id]
            ? currentSuggestedTasksMap[task.id]
            : "NOT FOUND or EMPTY"
        );
        console.log(
          `GanttChart: Calculated isSuggestionActive for [${task.id}]: ${
            task.id === currentActiveSuggestionParentId
          }`
        );
      }

      nodes.push({
        id: task.id,
        type: "taskNode",
        position: { x, y },
        data: {
          ...task,
          width: nodeWidth,
          height: nodeHeight,
          onTaskClick: clickFn,
          onDateChange: dateChangeFn,
          isSuggestionActive: task.id === currentActiveSuggestionParentId,
          currentSuggestedTasks: currentSuggestedTasksMap[task.id] || [],
          onShowSuggestionsClick: showSuggestionsFn,
          onHideSuggestions: hideSuggestionsFn,
          onApproveSuggestion: approveSuggestionFn,
          onRejectSuggestion: rejectSuggestionFn,
        } as TaskNodeData,
      });

      if (!task.children || task.children.length === 0) {
        return y + nodeHeight + yGap;
      }
      let childY = y;
      for (let i = 0; i < task.children.length; i++) {
        if (i === 0) {
          childY = placeNode(task.children[i], x + xGap, y, x, y);
        } else {
          childY = placeNode(task.children[i], x + xGap, childY, x, y);
        }
      }
      return childY;
    }
    let startY = globalY;
    roots.forEach((root) => {
      const nextY = placeNode(root, 50, startY, null, null);
      startY = nextY;
    });
    return nodes;
  }

  // ノードリストを計算するための useMemo
  const calculatedNodes = useMemo(() => {
    console.log("GanttChart: useMemo for calculatedNodes triggered.");
    console.log(
      "GanttChart: activeSuggestionParentId in useMemo (for calculatedNodes):",
      activeSuggestionParentId
    );
    console.log(
      "GanttChart: currentSuggestedTasks in useMemo (for calculatedNodes):",
      currentSuggestedTasks
    );
    return generateNodesFromTasks(
      processedTasks,
      activeSuggestionParentId,
      currentSuggestedTasks,
      handleTaskClick,
      handleDateChange,
      handleShowSuggestions,
      handleHideSuggestions,
      handleApproveSuggestion,
      handleRejectSuggestion
    );
  }, [
    processedTasks,
    activeSuggestionParentId,
    currentSuggestedTasks,
    handleTaskClick,
    handleDateChange,
    handleShowSuggestions,
    handleHideSuggestions,
    handleApproveSuggestion,
    handleRejectSuggestion,
  ]);

  // calculatedNodes が変更されたら setNodes を呼び出す useEffect
  useEffect(() => {
    console.log(
      "GanttChart: useEffect to setNodes triggered. Applying calculatedNodes."
    );
    setNodes(calculatedNodes);
  }, [calculatedNodes, setNodes]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedTaskId(null);
  }, []);

  const handleCloseSuggestedTasks = useCallback(() => {
    setSuggestedTasksModal({
      isOpen: false,
      parentTaskId: null,
    });
  }, []);

  const handleApproveTask = useCallback(
    (suggestedTaskFromModal: SuggestedTask) => {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: suggestedTaskFromModal.title,
        end: new Date(
          Date.now() +
            suggestedTaskFromModal.estimatedDuration * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        parent: suggestedTasksModal.parentTaskId || undefined,
        assignee: "未割り当て",
        status: "pending",
        description: suggestedTaskFromModal.description,
        startDate: new Date().toISOString().split("T")[0],
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);

      // 既存のModalからのタスク追加時のエッジ生成はそのまま
      if (newTask.parent) {
        const newEdge: Edge = {
          id: `edge-${newTask.parent}-${newTask.id}`,
          source: newTask.parent,
          target: newTask.id,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#4f46e5",
            strokeWidth: 3,
          },
        };
        setEdges((eds) => [...eds, newEdge]);
      }
      console.log("古いモーダルから新しいタスクを作成:", newTask);
    },
    [processedTasks, suggestedTasksModal.parentTaskId, setTasks, setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-screen relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </ReactFlowProvider>

      <TaskSidebar
        taskId={selectedTaskId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      <SuggestedTasksModal
        isOpen={suggestedTasksModal.isOpen}
        onClose={handleCloseSuggestedTasks}
        parentTaskId={suggestedTasksModal.parentTaskId}
        onApproveTask={handleApproveTask}
      />
    </div>
  );
}
