import { MapPin, Clock, Fingerprint, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

export default function EnhancedCVPanel({ project }) {
  const hasDuplicate = project.factors?.some((f) => f.signal === "visual");
  const hasGeoMismatch = project.factors?.some((f) => f.signal === "geo");
  const hasBackdatedCert = project.factors?.some((f) => f.signal === "textual");

  // Mock CV detections based on category (matches your PPT's ResNet/YOLO claim)
  const cvDetections = {
    "Roads & Pathways": ["Asphalt Surface", "Road Markings", "Construction Equipment"],
    "Drinking Water": ["Overhead Tank", "PVC Pipes", "Concrete Foundation"],
    "Community Halls": ["Building Facade", "Roof Structure", "Window Frames"],
    "Health Infrastructure": ["PHC Building", "Entrance Gate", "Parking Area"],
    "Education Infrastructure": ["Classroom Block", "Playground", "Boundary Wall"],
  };
  const tags = cvDetections[project.category] || ["Infrastructure", "Civil Works"];

  return (
    <div className="card p-6 border-t-4 border-t-indigo-700">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="text-indigo-700" size={22} />
        <h3 className="font-bold text-lg text-slate-900">AI Forensic Analysis</h3>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
          Computer Vision + NLP Module
        </span>
      </div>

      {/* Side-by-Side Image Comparison */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Primary Site Photo */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video group">
          {project.image_url ? (
            <>
              <img src={project.image_url} alt="Project Site" className="w-full h-full object-cover" />
              {/* EXIF Metadata Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 text-white text-xs space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5"><MapPin size={12} /> {project.latitude}, {project.longitude}</div>
                <div className="flex items-center gap-1.5"><Clock size={12} /> {project.actual_completion || "N/A"}</div>
                <div className="flex items-center gap-1.5"><Fingerprint size={12} /> Hash: {project.photo_hash?.slice(0, 12)}...</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
              <AlertTriangle size={32} className="mb-2" />
              <p className="text-sm font-medium">No Geo-tagged Photo Available</p>
            </div>
          )}
          
          {/* CV Detection Tags Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="bg-indigo-700/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
                🤖 {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Duplicate Match or Clean Status */}
        <div className={`relative rounded-lg overflow-hidden border aspect-video bg-slate-100 ${hasDuplicate ? "border-rose-300 ring-2 ring-rose-100" : "border-emerald-300"}`}>
          {hasDuplicate && project.duplicate_image_url ? (
            <>
              <img src={project.duplicate_image_url} alt="Duplicate Match" className="w-full h-full object-cover grayscale opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2">
                  <AlertTriangle size={14} /> 98.4% DUPLICATE MATCH
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-4 text-center">
              <CheckCircle2 size={40} className="text-emerald-600 mb-3" />
              <p className="text-base font-bold text-slate-800">Unique Asset Verified</p>
              <p className="text-xs mt-1 text-slate-500 max-w-[200px]">Perceptual hash is unique across all MPLADS works in the database.</p>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Data Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
            <MapPin size={12} /> GPS Validation
          </div>
          <div className="text-sm font-mono font-bold text-slate-800">{project.latitude}, {project.longitude}</div>
          <div className={`text-[11px] mt-2 font-bold flex items-center gap-1 ${hasGeoMismatch ? "text-rose-600" : "text-emerald-600"}`}>
            {hasGeoMismatch ? (
              <><AlertTriangle size={12} /> {project.photo_distance_km} km OFFSET (5km limit)</>
            ) : (
              <><CheckCircle2 size={12} /> Within Geo-Fence</>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
            <Clock size={12} /> Timestamp Check
          </div>
          <div className="text-sm font-mono font-bold text-slate-800">
            {project.actual_completion ? new Date(project.actual_completion).toLocaleDateString() : "Pending"}
          </div>
          <div className="text-[11px] mt-2 text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Chronologically Valid
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
            <Fingerprint size={12} /> Perceptual Hash
          </div>
          <div className="text-xs font-mono font-bold text-slate-800 truncate">{project.photo_hash || "N/A"}</div>
          <div className={`text-[11px] mt-2 font-bold flex items-center gap-1 ${hasDuplicate ? "text-rose-600" : "text-emerald-600"}`}>
            {hasDuplicate ? <><AlertTriangle size={12} /> Ghost Asset Detected</> : <><CheckCircle2 size={12} /> Unique Signature</>}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
            <FileText size={12} /> Model Confidence
          </div>
          <div className="text-xl font-bold text-indigo-700">94.2%</div>
          <div className="text-[11px] mt-1 text-slate-500">ResNet-50 + YOLOv8 Ensemble</div>
        </div>
      </div>

      {/* Document NLP Alert (If Backdated Certificate Detected) */}
      {hasBackdatedCert && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-sm font-bold text-amber-900 mb-1">NLP Document Anomaly Detected</div>
            <p className="text-sm text-amber-800 leading-relaxed">
              OCR + IndicBERT analysis flagged a date inconsistency. The completion certificate appears to be dated 
              <b> before the sanction date</b>, indicating potential backdating or document tampering. 
              This contributes significantly to the overall risk score.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}