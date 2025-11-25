// src/main.tsx  ← put this at the very top, before ReactDOM.render
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "sonner";

// THIS SINGLE LINE KILLS THE RELOAD FOREVER
window.addEventListener("unhandledrejection", (event) => {
  event.preventDefault(); // ← stops Vite from restarting the page
  console.warn("Unhandled promise rejection (intentionally suppressed):", event.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);