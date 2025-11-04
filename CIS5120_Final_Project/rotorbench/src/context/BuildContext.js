import React, { createContext, useContext, useState, useEffect } from "react";

const BuildContext = createContext();

export function useBuild() {
  const context = useContext(BuildContext);
  if (!context) {
    throw new Error("useBuild must be used within BuildProvider");
  }
  return context;
}

export function BuildProvider({ children }) {
  // Initialize from localStorage if available
  const [currentBuild, setCurrentBuild] = useState(() => {
    const saved = localStorage.getItem("currentBuild");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved build:", e);
        return null;
      }
    }
    return null;
  });

  // Save to localStorage whenever build changes
  useEffect(() => {
    if (currentBuild) {
      localStorage.setItem("currentBuild", JSON.stringify(currentBuild));
    } else {
      localStorage.removeItem("currentBuild");
    }
  }, [currentBuild]);

  const updateBuild = (buildConfig) => {
    setCurrentBuild(buildConfig);
  };

  const clearBuild = () => {
    setCurrentBuild(null);
  };

  return (
    <BuildContext.Provider value={{ currentBuild, updateBuild, clearBuild }}>
      {children}
    </BuildContext.Provider>
  );
}

