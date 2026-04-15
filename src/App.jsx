import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import CourseForm from './components/CourseForm';
import TaskForm from './components/TaskForm';
import ResourceUpload from './components/ResourceUpload';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import Profile from './components/Profile';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage && <Header />}
      <main style={{ minHeight: '100vh' }}>
        <Routes key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard key="dashboard" />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/new"
            element={
              <PrivateRoute>
                <CourseForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:id"
            element={
              <PrivateRoute>
                <CourseDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:id/edit"
            element={
              <PrivateRoute>
                <CourseForm isEdit={true} />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:courseId/tasks/new"
            element={
              <PrivateRoute>
                <TaskForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/tasks/:id/edit"
            element={
              <PrivateRoute>
                <TaskForm isEdit={true} />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:courseId/resources/upload"
            element={
              <PrivateRoute>
                <ResourceUpload />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
