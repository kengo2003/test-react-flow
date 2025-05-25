import GanttChart from "@/components/gantt-chart";

export default function Page() {
  return (
    <main className="container mx-auto">
      <div className="bg-slate-300 p-2">
        <h1 className="text-2xl font-bold">プロジェクト管理ダッシュボード</h1>
      </div>
      <GanttChart />
    </main>
  );
}
