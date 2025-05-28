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
    // 1. タスクをIDでマップ化
    const taskMap: Record<string, Task & { children?: Task[] }> = {};
    processedTasks.forEach((task) => {
      taskMap[task.id] = { ...task, children: [] };
    });
    // 2. 親子関係を構築
    processedTasks.forEach((task) => {
      if (task.parent && taskMap[task.parent]) {
        taskMap[task.parent].children!.push(taskMap[task.id]);
      }
    });
    // 3. ルートタスクを抽出
    const roots = Object.values(taskMap).filter((task) => !task.parent);

    // 4. 再帰的にノード配置
    const nodes: TaskNodeType[] = [];
    const nodeWidth = 280;
    const nodeHeight = 130;
    const xGap = 350;
    const yGap = 50;

    // y座標の現在値を管理
    let globalY = 50;

    // 再帰配置関数
    function placeNode(
      task: Task & { children?: Task[] },
      x: number,
      y: number
    ): number {
      // ノード追加
      nodes.push({
        id: task.id,
        type: "taskNode",
        position: { x, y },
        data: {
          ...task,
          width: nodeWidth,
          height: nodeHeight,
          onTaskClick: handleTaskClick,
          onDateChange: handleDateChange,
          onSuggestTask: handleSuggestTask,
        },
      });
      // 子がいなければ高さ分だけ下に進める
      if (!task.children || task.children.length === 0) {
        return y + nodeHeight + yGap;
      }
      // 1つ目の子は親の右隣、2つ目以降は1つ目の子の下に縦並び
      let childY = y;
      for (let i = 0; i < task.children.length; i++) {
        if (i === 0) {
          // 1つ目の子は親の右隣
          childY = placeNode(task.children[i], x + xGap, y);
        } else {
          // 2つ目以降は直前の子の下
          childY = placeNode(task.children[i], x + xGap, childY);
        }
      }
      // 一番下のyを返す
      return childY;
    }

    // ルートごとに配置
    let startY = globalY;
    roots.forEach((root) => {
      const nextY = placeNode(root, 50, startY);
      startY = nextY;
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

      // 親ノードの位置を取得
      let parentNode = null;
      if (newTask.parent) {
        parentNode = nodes.find((n) => n.id === newTask.parent);
      }
      // 既存の子ノードを取得
      let siblingNodes: typeof nodes = [];
      if (newTask.parent) {
        siblingNodes = nodes.filter((n) => n.data.parent === newTask.parent);
      }
      // 配置ロジック
      let newX = 50;
      let newY = 50;
      const nodeWidth = 280;
      const nodeHeight = 130;
      const xGap = 350;
      const yGap = 50;
      if (parentNode) {
        newX = parentNode.position.x + xGap;
        if (siblingNodes.length === 0) {
          // まだ子がいなければ親のyと同じ
          newY = parentNode.position.y;
        } else {
          // 既存の子がいれば一番下の子の下
          const lastChild = siblingNodes.reduce((a, b) =>
            a.position.y > b.position.y ? a : b
          );
          newY = lastChild.position.y + nodeHeight + yGap;
        }
      }

      // ノードを追加
      const newNode: TaskNodeType = {
        id: newTask.id,
        type: "taskNode",
        position: { x: newX, y: newY },
        data: {
          ...newTask,
          width: nodeWidth,
          height: nodeHeight,
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
      nodes,
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
