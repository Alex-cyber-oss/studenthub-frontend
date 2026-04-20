import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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
import SyncStatus from './components/SyncStatus';
import { syncQueuedRequests, listenForConnectionChanges } from './services/syncService';
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
      <SyncStatus />
    </>
  );
}

function App() {
  useEffect(() => {
    // Initialiser les services hors ligne
    console.log('🚀 Initialisation des services hors ligne');
    
    // Écouter les changements de connexion
    listenForConnectionChanges();
    
    // Synchroniser si on est online au démarrage
    if (navigator.onLine) {
      console.log('✅ Connecté au démarrage');
      syncQueuedRequests();
    } else {
      console.log('📱 Mode hors ligne au démarrage');
    }

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker enregistré:', registration);
          
          // Écouter les mises à jour du SW
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nouvelle version disponible');
                // Vous pouvez notifier l'utilisateur ici
              }
            });
          });
        })
        .catch(error => console.error('❌ Erreur enregistrement SW:', error));
    }

    // Écouter les messages du Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('📬 Message du SW:', event.data);
        if (event.data.type === 'SYNC_SUCCESS') {
          console.log('✅ Synchronisation réussie:', event.data.item);
          // Vous pouvez déclencher un rafraîchissement des données ici
        } else if (event.data.type === 'SYNC_ERROR') {
          console.error('❌ Erreur de synchronisation:', event.data.error);
        }
      });
    }
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
