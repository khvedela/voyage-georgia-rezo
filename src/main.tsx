import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ReactLenis } from "lenis/react";
import "./index.css";
import App from "./App.tsx";
import ExperiencePage from "./pages/ExperiencePage.tsx";

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<App />} />
        <Route path="/experience/:id" element={<ExperiencePage />} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactLenis root>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ReactLenis>
  </StrictMode>
);
