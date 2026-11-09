import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { RISK_DOT } from "../utils";

export default function ProjectMap({ projects, height = "h-72", center = [12.75, 77.1], zoom = 8 }) {
  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden border border-slate-200`}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((p) => (
          <CircleMarker key={p.id} center={[p.latitude, p.longitude]}
            radius={6 + p.risk_score / 22}
            pathOptions={{ color: RISK_DOT[p.risk_level], fillColor: RISK_DOT[p.risk_level], fillOpacity: 0.75 }}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-slate-500">{p.work_code} · {p.constituency}</div>
                <div className="mt-1">
                  Risk: <b style={{ color: RISK_DOT[p.risk_level] }}>{p.risk_score}/100 ({p.risk_level})</b>
                </div>
                <Link className="text-indigo-600 underline" to={`/projects/${p.id}`}>Open project →</Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}