import { useState, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import LoadingFallback from "./components/LoadingFallback";
import { AuthProvider } from "./context/AuthContext";
import { skills } from "./data/portfolio";
import "./App.css";

// Route-based code splitting using React.lazy (Practical 8)
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const TaskApp = lazy(() => import("./components/TaskManager/TaskApp"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <AuthProvider>
      <div className={isDarkMode ? "app dark-mode" : "app"}>
        <NavBar
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home skills={skills} />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<TaskApp />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
