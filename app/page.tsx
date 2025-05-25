import GanttChart from "@/components/gantt-chart";

export default function Page() {
  return (
    <main>
      <div className="bg-slate-200 p-2">
        <h1 className="text-2xl font-bold">プロジェクト管理ダッシュボード</h1>
      </div>
      <div>
        <GanttChart />
      </div>
    </main>
  );
}
