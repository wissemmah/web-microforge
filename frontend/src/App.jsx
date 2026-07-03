import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole } from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import NewJobPage from './pages/NewJobPage';
import JobDetailPage from './pages/JobDetailPage';
import TasksPage from './pages/TasksPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminPage from './pages/AdminPage';
import { ROLES } from './lib/rbac';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/jobs" element={<RequireAuth><JobsPage /></RequireAuth>} />
      <Route path="/jobs/new" element={<RequireAuth><RequireRole roles={[ROLES.CLIENT, ROLES.ADMIN]}><NewJobPage /></RequireRole></RequireAuth>} />
      <Route path="/jobs/:id" element={<RequireAuth><JobDetailPage /></RequireAuth>} />
      <Route path="/tasks" element={<RequireAuth><RequireRole roles={[ROLES.WORKER, ROLES.ADMIN]}><TasksPage /></RequireRole></RequireAuth>} />
      <Route path="/reviews" element={<RequireAuth><RequireRole roles={[ROLES.REVIEWER, ROLES.ADMIN]}><ReviewsPage /></RequireRole></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><RequireRole roles={[ROLES.ADMIN]}><AdminPage /></RequireRole></RequireAuth>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
