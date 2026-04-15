import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { coursService } from '../services/coursService';
import CourseCard from './CourseCard';
import Button from './Button';
import Statistics from './Statistics';
import SearchAndFilters from './SearchAndFilters';
import InstallPrompt from './InstallPrompt';
import NotificationManager from './NotificationManager';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [sharedCourses, setSharedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchCourses();
    if (currentUser.filiere) {
      fetchSharedCourses(currentUser.filiere, currentUser.annee);
    }
  }, []); // Charger les données une seule fois au montage du composant

  const combinedCourses = useMemo(() => {
    const mine = courses.map(c => ({ ...c, isShared: false }));
    const shared = sharedCourses.map(c => ({ ...c, isShared: true }));
    return [...mine, ...shared];
  }, [courses, sharedCourses]);

  useEffect(() => {
    setFilteredCourses(combinedCourses);
  }, [combinedCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursService.getMyCourses();
      setCourses(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedCourses = async (filiere, annee) => {
    try {
      const data = await coursService.getSharedCourses(filiere, annee);
      setSharedCourses(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des cours partagés:', err);
    }
  };

  const handleFilterChange = useCallback((filtered) => {
    setFilteredCourses(filtered);
  }, []);

  return (
    <div className="dashboard-container">
      <InstallPrompt />
      <NotificationManager />
      <Statistics />
      
      <div className="dashboard-main-content">
        <div className="dashboard-left">
            <div className="dashboard-header">
              <h2>Mes Cours</h2>
              <p>Vous avez créé {courses.length} cours</p>
              <Button onClick={() => navigate('/courses/new')}>+ Nouveau cours</Button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {courses.length > 0 && (
              <SearchAndFilters courses={courses} onFilter={handleFilterChange} />
            )}

            {loading ? (
              <div className="loading">Chargement des cours...</div>
            ) : filteredCourses.length === 0 && courses.length > 0 ? (
              <div className="no-courses">
                <p>Aucun cours ne correspond à vos critères de recherche.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="no-courses">
                <p>Vous n'avez créé aucun cours pour le moment.</p>
                <Button onClick={() => navigate('/courses/new')}>Créer votre premier cours</Button>
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    courseId={course.id}
                    title={course.title}
                    category={course.category}
                    taskCount={course.tasks ? course.tasks.length : 0}
                    isShared={course.isShared}
                  />
                ))}
              </div>
            )}

            {user?.filiere && sharedCourses.length > 0 && (
              <div className="shared-courses-section">
                <div className="dashboard-header">
                  <h2>Cours partagés - {user.filiere} {user.annee && `(${user.annee})`}</h2>
                  <p>{sharedCourses.length} cours disponibles dans votre filière et année</p>
                </div>
                <div className="courses-grid">
                  {sharedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      courseId={course.id}
                      title={course.title}
                      category={course.category}
                      taskCount={course.tasks ? course.tasks.length : 0}
                      isShared
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
