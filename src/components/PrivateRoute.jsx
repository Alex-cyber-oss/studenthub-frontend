import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
}
