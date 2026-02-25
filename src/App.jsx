import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import SavedReplies from "./pages/SavedReplies";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <KnowledgeBase />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-replies"
          element={
            <ProtectedRoute>
              <SavedReplies />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
