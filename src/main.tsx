// main.tsx
// CRITICAL: Import error suppressor FIRST before anything else
import "@/utils/errorSuppressor";

// Then React and other imports
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Create root and render
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
