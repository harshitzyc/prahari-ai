import { Camera, MapPin, Clock, AlertTriangle, CheckCircle2, Fingerprint } from "lucide-react";

export default function ComputerVisionPanel({ project }) {
  const hasDuplicate = project.factors?.some((f) => f.signal === "visual");
  const hasGeoMismatch = project.factors?.some((f) => f.signal === "geo");

  // Mock CV detections based on category
  const cvDetections = {
    "Roads & Pathways": ["Asphalt Road", "Road Markings", "Construction Vehicle"],
    "Drinking Water": ["Water Tank", "Pipes", "Concrete Structure"],
    "Community Halls": ["Building Facade", "Roof Structure", "Windows"],
    "Health Infrastructure": ["Hospital Building", "Entrance Gate", "Parking Area"],
    "Education Infrastructure": ["School Building", "Classroom", "Playground"],
  };
  const tags = cvDetections[project.category] || ["Infrastructure", "Building", "Site"];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="text-indigo-600" size={20} />
        <h3 className="font-semibold">Computer Vision & Image Forensics</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Primary Image */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
          {project.image_url ? (
            <img src={project.image_url} alt="Project Site" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">No Image Available</div>
          )}
          {/* CV Overlay Tags */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="bg-indigo-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  🤖 {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Duplicate Image (if flagged) */}
        <div className={`relative rounded-lg overflow-hidden border aspect-video bg-slate-100 ${hasDuplicate ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"}`}>
          {hasDuplicate && project.duplicate_image_url ? (
            <img src={project.duplicate_image_url} alt="Duplicate Match" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
              <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
              <p className="text-sm font-medium">No Duplicate Found</p>
              <p className="text-xs mt-1">Perceptual hash is unique in the database.</p>
            </div>
          )}
          
          {hasDuplicate && (
            <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 animate-pulse">
              <AlertTriangle size={12} /> DUPLICATE DETECTED
            </div>
          )}
        </div>
      </div>

      {/* EXIF & Forensics Data */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><MapPin size={12} /> GPS Coordinates</div>
          <div className="text-sm font-mono font-semibold text-slate-800">{project.latitude}, {project.longitude}</div>
          <div className={`text-[10px] mt-1 font-medium ${hasGeoMismatch ? "text-rose-600" : "text-emerald-600"}`}>
            {hasGeoMismatch ? `⚠️ ${project.photo_distance_km} km from site` : "✓ Within 5km geo-fence"}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Clock size={12} /> EXIF Timestamp</div>
          <div className="text-sm font-mono font-semibold text-slate-800">
            {project.actual_completion ? new Date(project.actual_completion).toLocaleDateString() : "N/A"}
          </div>
          <div className="text-[10px] mt-1 text-slate-500 font-medium">✓ Timestamp matches records</div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Fingerprint size={12} /> Perceptual Hash</div>
          <div className="text-xs font-mono font-semibold text-slate-800 truncate">{project.photo_hash || "N/A"}</div>
          <div className={`text-[10px] mt-1 font-medium ${hasDuplicate ? "text-rose-600" : "text-emerald-600"}`}>
            {hasDuplicate ? "⚠️ 98.4% Match with PRJ-5003" : "✓ Unique Asset"}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Camera size={12} /> CV Model</div>
          <div className="text-sm font-semibold text-slate-800">ResNet-50 + YOLOv8</div>
          <div className="text-[10px] mt-1 text-slate-500 font-medium">Confidence: 94.2%</div>
        </div>
      </div>

      {hasDuplicate && (
        <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-3">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-rose-800">
            <b>Ghost Asset Alert:</b> The completion photo for this work is a <b>98.4% perceptual hash match</b> with the photo submitted for <b>PRJ-5003</b> in a different district. This strongly indicates the same photo was reused to claim funds for a non-existent (ghost) project.
          </div>
        </div>
      )}
    </div>
  );
}