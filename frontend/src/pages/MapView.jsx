import { useApi } from "../api";
import ProjectMap from "../components/ProjectMap";
import { RISK_DOT } from "../utils";

export default function MapView() {
  const { data: projects, loading, error } = useApi("/projects");

  if (loading) return <div className="text-slate-500">Loading map…</div>;
  if (error) return <div className="card p-8 text-rose-600">Unable to reach API.</div>;

  return (
    <div className="relative">
      <ProjectMap projects={projects} height="h-[calc(100vh-8.5rem)]" />
      <div className="absolute top-3 right-3 z-[1001] card p-4 w-56">
        <h4 className="text-sm font-semibold mb-2">Geo-Tagged MPLADS Works</h4>
        {["High", "Medium", "Low"].map((lvl) => (
          <div key={lvl} className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <span className="h-3 w-3 rounded-full" style={{ background: RISK_DOT[lvl] }} />
            {lvl} risk ({projects.filter((p) => p.risk_level === lvl).length})
          </div>
        ))}
        <p className="text-[10px] text-slate-400 mt-2">
          Marker size ∝ risk score. Duplicate-photo + geo-mismatch clusters indicate ghost-work patterns.
        </p>
      </div>
    </div>
  );
}