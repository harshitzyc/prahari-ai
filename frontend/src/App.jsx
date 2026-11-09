import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import CitizenHome from "./pages/CitizenHome";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Verification from "./pages/Verification";
import MapView from "./pages/MapView";
import MPDashboard from "./pages/MPDashboard";
import DataUpload from "./pages/DataUpload";

export default function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Citizen landing page (public, no login)
  if (!showLogin && !user) {
    return (
      <Routes>
        <Route path="*" element={<CitizenHome onGoToLogin={() => setShowLogin(true)} />} />
      </Routes>
    );
  }

  // Officer login page
  if (!user) {
    return <Login onLogin={setUser} onBack={() => setShowLogin(false)} />;
  }

  // Officer dashboard (authenticated)
  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={() => { setUser(null); setShowLogin(false); }} />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="map" element={<MapView />} />
        <Route path="verification" element={<Verification />} />
        <Route path="mp" element={<MPDashboard />} />
        <Route path="upload" element={<DataUpload />} />
      </Route>
    </Routes>
  );
}