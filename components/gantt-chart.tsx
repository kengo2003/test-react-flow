"use client";

import { useState, useCallback, useMemo } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";

import { TaskNode } from "@/components/task-node";
import { TaskSidebar } from "@/components/task-sidebar";
import { SuggestedTasksModal } from "@/components/suggested-tasks-modal";
import type {
  Task,
  TaskNode as TaskNodeType,
  SuggestedTask,
} from "@/lib/types";

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [suggestedTasksModal, setSuggestedTasksModal] = useState({
    isOpen: false,
    parentTaskId: null as string | null,
  });

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

  // タスクデータの処理
  const processedTasks = useMemo(() => {
    return mockTasks.map((task) => {
      // dueが欠落している場合は今日+7日を設定
      if (!task.end) {
        const today = new Date();
        const defaultDue = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        task.end = defaultDue.toISOString().split("T")[0];
      }
      return task;
    });
  }, []);

  // ノードの生成
  const initialNodes: TaskNodeType[] = useMemo(() => {
    // 1. 階層（深さ）を計算
    const getTaskDepth = (
      task: Task,
      tasks: Task[],
      cache: Record<string, number> = {}
    ): number => {
      if (cache[task.id] !== undefined) return cache[task.id];
      if (!task.parent) return 0;
      const parentTask = tasks.find((t) => t.id === task.parent);
      const depth = parentTask ? getTaskDepth(parentTask, tasks, cache) + 1 : 0;
      cache[task.id] = depth;
      return depth;
    };

    // 2. 各階層ごとにタスクをグループ化
    const depthMap: Record<number, Task[]> = {};
    const depthCache: Record<string, number> = {};
    processedTasks.forEach((task) => {
      const depth = getTaskDepth(task, processedTasks, depthCache);
      if (!depthMap[depth]) depthMap[depth] = [];
      depthMap[depth].push(task);
    });

    // 3. ノード生成
    const nodes: TaskNodeType[] = [];
    Object.entries(depthMap).forEach(([depthStr, tasksAtDepth]) => {
      const depth = Number(depthStr);
      tasksAtDepth.forEach((task, i) => {
        nodes.push({
          id: task.id,
          type: "taskNode",
          position: { x: depth * 350 + 50, y: i * 180 + 50 },
          data: {
            ...task,
            width: 280,
            height: 130,
            onTaskClick: handleTaskClick,
            onDateChange: handleDateChange,
            onSuggestTask: handleSuggestTask,
          },
        });
      });
    });
    return nodes;
  }, [processedTasks]);

  // エッジの生成（依存関係）
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
    (suggestedTask: SuggestedTask) => {
      // 新しいタスクを作成
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: suggestedTask.title,
        end: new Date(
          Date.now() + suggestedTask.estimatedDuration * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        parent: suggestedTasksModal.parentTaskId || undefined,
        assignee: "未割り当て",
        status: "pending",
      };

      // ノードを追加
      const newNode: TaskNodeType = {
        id: newTask.id,
        type: "taskNode",
        position: { x: nodes.length * 300 + 50, y: 50 },
        data: {
          ...newTask,
          width: 280,
          height: 130,
          onTaskClick: handleTaskClick,
          onDateChange: handleDateChange,
          onSuggestTask: handleSuggestTask,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      // 依存関係のエッジを追加
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

      console.log("新しいタスクを作成:", newTask);
    },
    [
      nodes.length,
      suggestedTasksModal.parentTaskId,
      setNodes,
      setEdges,
      handleTaskClick,
      handleDateChange,
      handleSuggestTask,
    ]
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
