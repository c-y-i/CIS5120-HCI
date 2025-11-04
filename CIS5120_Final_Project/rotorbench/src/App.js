import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BuildProvider } from "./context/BuildContext";
import HomePage from "./components/HomePage";
import BuildPage from "./components/BuildPage";
import AnalysisPage from "./components/AnalysisPage";

export default function App() {
  return (
    <BuildProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </Router>
    </BuildProvider>
  );
}
